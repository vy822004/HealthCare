import { User } from "../models/user.model.js";
import { Patient } from "../models/patient.model.js";
import cloudinary from "../libs/cloudinary.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");
    const patient = await Patient.findOne({ userId });

    res.status(200).json({
      user,
      patient,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const setProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      email,
      age,
      gender,
      height,
      weight,
      conditions,
      profilePic
    } = req.body;

    // Update User (name, email, profilePic)
    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (email) userUpdate.email = email;
    
    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "healthcare_profiles"
      });
      userUpdate.profilePic = uploadResponse.secure_url;
    }
    
    let updatedUser = await User.findById(userId).select("-password");
    if (Object.keys(userUpdate).length > 0) {
      updatedUser = await User.findByIdAndUpdate(userId, userUpdate, { new: true }).select("-password");
    }

    // Update Patient (health info)
    const patient = await Patient.findOneAndUpdate(
      { userId },
      {
        age,
        gender,
        height,
        weight,
        conditions,
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.status(200).json({ user: updatedUser, patient });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
