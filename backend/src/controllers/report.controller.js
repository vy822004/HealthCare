import { Patient } from '../models/patient.model.js';
import { Report } from '../models/report.model.js';
import { User } from '../models/user.model.js';
import { Doctor } from '../models/doctor.model.js';
import { Appointment } from '../models/appointment.model.js';
import OpenAI from 'openai';
import '../polyfill.js';
import { PDFParse } from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';
import cloudinary from '../libs/cloudinary.js';
import PDFDocument from 'pdfkit';
// Initialize OpenAI using the environment variable
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

export const uploadReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(userId);
    const userName = user ? user.name : "Unknown User";

    // Read the file and parse text
    let extractedText = "";
    try {
      if (file.mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(file.path);
        const parser = new PDFParse({ data: dataBuffer });
        const result = await parser.getText();
        extractedText = result.text;
        await parser.destroy();
      } else if (file.mimetype.startsWith('image/')) {
        const worker = await Tesseract.createWorker('eng', 1, {
          cachePath: '/tmp',
        });
        const result = await worker.recognize(file.path);
        extractedText = result.data.text;
        await worker.terminate();
      } else {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        return res.status(400).json({ message: "Unsupported file type. Please upload a PDF or Image." });
      }
    } catch (err) {
      console.error("File Parsing Error:", err);
      // Clean up file if parsing fails
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ message: "Could not parse document. Ensure it is a valid file." });
    }

    // Call OpenAI to extract fields
    const prompt = `
      You are a medical data extraction assistant. Given the following raw text extracted from a medical report/prescription document, extract the following fields and return them as a strict JSON object:
      {
        "isMedicalRecord": true or false (true if this text appears to be a medical record, prescription, or lab report, false otherwise),
        "belongsToUser": true or false (true if the patient name in the text matches or closely resembles "${userName}", false if it clearly belongs to someone else. If no name is mentioned, assume true),
        "title": "A short descriptive title (e.g. Blood Test Report, Prescription, X-Ray)",
        "description": "A brief summary of what this document is",
        "prescription": "Any medications or prescriptions mentioned",
        "diagnosis": "The medical diagnosis or conclusions found",
        "reportType": "Must be one of: 'lab', 'diagnosis', 'prescription', or 'discharge'"
      }

      If any information is not present, use an empty string. Do not wrap the JSON in markdown code blocks. Just output raw JSON.

      Extracted Text:
      """
      ${extractedText.substring(0, 4000)}
      """
    `;

    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    let aiResult;
    try {
      let rawContent = response.choices[0].message.content.trim();
      // Clean up markdown if any
      if (rawContent.startsWith('\`\`\`json')) {
        rawContent = rawContent.substring(7, rawContent.length - 3);
      } else if (rawContent.startsWith('\`\`\`')) {
        rawContent = rawContent.substring(3, rawContent.length - 3);
      }
      aiResult = JSON.parse(rawContent);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response", parseError);
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(500).json({ message: "Failed to parse AI response" });
    }

    if (!aiResult.isMedicalRecord) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ message: "This document is not a medical record. The file will not be saved." });
    }

    if (aiResult.belongsToUser === false) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ message: "This medical record does not appear to belong to you. The file will not be saved." });
    }

    // Find the patient ID for the logged-in user
    let patient = await Patient.findOne({ userId });
    
    // If the user hasn't completed their profile, create a dummy patient record
    if (!patient) {
      patient = new Patient({ userId });
      await patient.save();
    }

    // Upload to Cloudinary
    let cloudinaryUrl = "";
    try {
      const cloudinaryResult = await cloudinary.uploader.upload(file.path, {
        resource_type: "auto",
        folder: "medical_reports"
      });
      cloudinaryUrl = cloudinaryResult.secure_url;
    } catch (cloudErr) {
      console.error("Cloudinary Upload Error:", cloudErr);
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(500).json({ message: "Failed to upload file to cloud storage" });
    }

    // Now safe to delete the local file
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    // Create Report
    const newReport = new Report({
      patientId: patient._id,
      title: aiResult.title || "Uploaded Report",
      description: aiResult.description || "",
      prescription: aiResult.prescription || "",
      diagnosis: aiResult.diagnosis || "",
      reportType: ['lab', 'diagnosis', 'prescription', 'discharge'].includes(aiResult.reportType) ? aiResult.reportType : 'diagnosis',
      fileUrl: cloudinaryUrl,
    });

    await newReport.save();

    res.status(201).json({
      message: "Report processed and saved successfully!",
      report: newReport,
    });

  } catch (error) {
    console.error("Report Upload Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const patient = await Patient.findOne({ userId });
    
    if (!patient) {
      return res.status(200).json([]);
    }

    const reports = await Report.find({ patientId: patient._id }).sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const reportId = req.params.id;
    const { recordStatus } = req.body;
    
    if (!['active', 'fixed'].includes(recordStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const patient = await Patient.findOne({ userId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const report = await Report.findOne({ _id: reportId, patientId: patient._id });
    if (!report) {
      return res.status(404).json({ message: "Report not found or unauthorized" });
    }

    report.recordStatus = recordStatus;
    await report.save();

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPrescription = async (req, res) => {
  try {
    const { patientUserId, diagnosis, prescriptionNotes, appointmentId } = req.body;
    const doctorUserId = req.user.id;

    const doctor = await Doctor.findOne({ userId: doctorUserId }).populate('userId', 'name');
    if (!doctor) {
      return res.status(403).json({ message: "Only doctors can write prescriptions." });
    }

    const patientUser = await User.findById(patientUserId);
    if (!patientUser) {
      return res.status(404).json({ message: "Patient not found." });
    }

    let patient = await Patient.findOne({ userId: patientUserId });
    if (!patient) {
      // Should exist if they booked an appointment, but just in case
      patient = new Patient({ userId: patientUserId });
      await patient.save();
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));

    const pdfPromise = new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "prescriptions", resource_type: "image", format: "pdf" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(pdfData);
      });
    });

    doc.fontSize(22).fillColor('#2563eb').text('Jeevan Care', { align: 'center' });
    doc.fontSize(10).fillColor('gray').text('Premium Healthcare Services', { align: 'center' });
    doc.moveDown(2);
    
    doc.fillColor('black').fontSize(14).text(`Doctor: Dr. ${doctor.userId.name}`, { continued: true });
    doc.text(` (${doctor.specialization})`, { align: 'right' });
    doc.fontSize(12).text(`Hospital/Clinic: ${doctor.hospital || "Jeevan Care Network"}`);
    
    doc.moveDown();
    doc.text(`Patient: ${patientUser.name}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown(2);
    
    doc.fontSize(16).fillColor('#374151').text('Diagnosis:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('black').text(diagnosis || "N/A");
    doc.moveDown(1.5);
    
    doc.fontSize(16).fillColor('#374151').text('Prescription & Advice:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('black').text(prescriptionNotes || "N/A");
    
    doc.moveDown(4);
    doc.fontSize(10).fillColor('gray').text('-----------------------------------', { align: 'right' });
    doc.text(`Signature: Dr. ${doctor.userId.name}`, { align: 'right' });

    doc.end();

    const cloudinaryResult = await pdfPromise;
    
    // Cloudinary restricts PDFs by default on many accounts (401 error).
    // But since it's uploaded as 'image', we can bypass this by simply asking Cloudinary 
    // to deliver it as a JPG! Cloudinary will automatically convert the PDF to a high-quality JPG.
    const fileUrl = cloudinaryResult.secure_url.replace(/\.pdf$/, '.jpg');

    const report = new Report({
      patientId: patient._id,
      assignedDoctor: doctor._id,
      title: `Prescription by Dr. ${doctor.userId.name}`,
      description: "Doctor's official post-appointment prescription.",
      diagnosis: diagnosis,
      prescription: prescriptionNotes,
      reportType: "prescription",
      fileUrl: fileUrl
    });

    await report.save();

    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, { isPrescribed: true });
    }

    res.status(201).json({ message: "Prescription generated and saved securely.", report });
  } catch (error) {
    console.error("Prescription Error:", error);
    res.status(500).json({ message: "Failed to generate prescription" });
  }
};
