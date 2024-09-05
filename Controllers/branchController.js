import Branch from "../Models/branchModel.js";
import UserActivityLog from "../Models/userActivityLogModel.js";

const getBranch = async (req, res) => {
  try {
    // console.log("user in get terminal", role);
    const branches = await Branch.find();

    res.status(200).json({
      status: "true",
      branches,
    });
  } catch (error) {
    // Log the error (optional)
    console.error(error);

    // Send back an error response
    res.status(500).json({
      status: false,
      message: "Failed to retrieve branches",
      error: error.message,
    });
  }
};

export { getBranch };
