import UserActivityLog from "../Models/userActivityLogModel.js"; // Ensure the path is correct
import mongoose from "mongoose";

const getActivity = async (req, res) => {
  try {
    // Fetch logs from the database
    console.log("activity in get activity");
    const logs = await UserActivityLog.find().sort({ createdAt: -1 }); // Sort by latest logs first

    // Send the logs in the response
    res.status(200).json(logs);
  } catch (error) {
    // Handle any errors
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ error: "Error while fetching activity logs!" });
  }
};

export { getActivity };
