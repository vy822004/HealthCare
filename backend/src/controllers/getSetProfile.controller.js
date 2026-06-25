
import express from 'express';
import cookieParser from 'cookie-parser';

const router = express();








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
      age,
      gender,
      height,
      weight,
      conditions,
    } = req.body;

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

    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export default router;
