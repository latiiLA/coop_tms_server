import Feedback from "../Models/feedbackModel.js";
import Bug from "../Models/bugModel.js";
import UserActivityLog from "../Models/userActivityLogModel.js"; // Ensure the path is correct
import mongoose from "mongoose";

const createFeedback = async (req, res) => {
  let createdBy = req.auth_user._id;
  //   clg(req.body);
  try {
    const feedback = req.body;

    const new_feedback = await Feedback.create({
      ...feedback,
      createdBy,
    });

    // Log the activity
    const newLog = new UserActivityLog({
      userId: req.auth_user._id,
      action: "Feedback Added",
      description: `User ${req.auth_user.firstName} with userId ${req.auth_user._id} added new feedback.`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // Save the log to the database
    await newLog.save();

    // console.log(new_feedback);
    res.status(200).json({
      status: "success",
      new_feedback,
      message: "Feedback is successfully sent.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while sending feedback.",
    });
  }
};

const createBug = async (req, res) => {
  let createdBy = req.auth_user._id;
  try {
    const bugReport = req.body;

    const new_bug = await Bug.create({
      ...bugReport,
      createdBy,
    });

    // Log the activity
    const newLog = new UserActivityLog({
      userId: req.auth_user._id,
      action: "Bug Report",
      description: `User ${req.auth_user.firstName} with userId ${req.auth_user._id} added reported a bug.`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // Save the log to the database
    await newLog.save();

    // console.log(new_feedback);
    res.status(200).json({
      status: "success",
      new_bug,
      message: "Bug is successfully reported.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while reporting bug.",
    });
  }
};

const getFeedbacks = async (req, res) => {
  const feedback = await Feedback.find();

  res.status(200).json({
    status: "true",
    feedback,
  });
};

const getBugs = async (req, res) => {
  const bug = await Bug.find();

  res.status(200).json({
    status: "true",
    bug,
  });
};

export { createBug, createFeedback, getFeedbacks, getBugs };
