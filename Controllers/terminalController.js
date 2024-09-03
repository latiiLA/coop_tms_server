import Terminal from "../Models/terminalModel.js";
import Port from "../Models/portModel.js";
import UserActivityLog from "../Models/userActivityLogModel.js";
import mongoose from "mongoose";

const createTerminal = async (req, res) => {
  try {
    let createdBy = req.auth_user._id;
    const {
      unitId,
      type,
      terminalId,
      terminalName,
      branchName,
      district,
      site,
      cbsAccount,
      port,
      ipAddress,
    } = req.body;

    // Check for existing records
    const existingUnitId = await Terminal.findOne({ unitId, type });
    if (existingUnitId) {
      throw new Error("Unit id already exists.");
    }

    const existingTerminalId = await Terminal.findOne({ terminalId });
    if (existingTerminalId) {
      throw new Error("Terminal id already exists.");
    }

    const existingCbsAccount = await Terminal.findOne({ cbsAccount });
    if (existingCbsAccount) {
      throw new Error("CBS account already exists.");
    }

    const existingIpAddress = await Terminal.findOne({
      ipAddress,
      isDeleted: false,
    });
    if (existingIpAddress) {
      throw new Error("Ip address already exists.");
    }

    // Check port validity and availability
    const existingPort = await Port.findOne({ portNumber: port });
    if (!existingPort) {
      throw new Error("Port number does not exist.");
    }

    if (existingPort.usedPorts >= existingPort.portCapacity) {
      throw new Error("Port capacity is reached.");
    }

    // Increment the used count of the port
    existingPort.usedPorts += 1;
    await existingPort.save();

    // Create the terminal
    const terminal = await Terminal.create({
      unitId,
      type,
      terminalId,
      terminalName,
      branchName,
      site,
      district,
      cbsAccount,
      port,
      ipAddress,
      createdBy,
    });

    // Log the activity
    const newLog = new UserActivityLog({
      userId: createdBy,
      action: "Create Terminal",
      description: `User ${req.auth_user.firstName} with userId ${createdBy} created new Terminal with unitId ${unitId}.`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // Save the log to the database
    await newLog.save();

    console.log(terminal);
    res.status(200).json({
      status: "success",
      terminal,
      message: "The terminal is successfully created.",
    });
  } catch (error) {
    console.log("Error creating terminal:", error.message);

    res.status(500).json({
      status: "error",
      message:
        error.message || "An error occurred while creating the terminal.",
    });
  }
};

const getTerminal = async (req, res) => {
  try {
    let role = req.auth_user.role;
    // console.log("user in get terminal", role);
    const terminals = await Terminal.find({ isDeleted: false });

    // console.log(terminals);

    res.status(200).json({
      status: "true",
      terminals,
      role,
    });
  } catch (error) {
    // Log the error (optional)
    console.error(error);

    // Send back an error response
    res.status(500).json({
      status: false,
      message: "Failed to retrieve terminals",
      error: error.message,
    });
  }
};

const getAllTerminal = async (req, res) => {
  try {
    let role = req.auth_user.role;
    // console.log("user in get terminal", role);
    const terminals = await Terminal.find();

    // console.log(terminals);

    res.status(200).json({
      status: "true",
      terminals,
      role,
    });
  } catch (error) {
    // Log the error (optional)
    console.error(error);

    // Send back an error response
    res.status(500).json({
      status: false,
      message: "Failed to retrieve terminals",
      error: error.message,
    });
  }
};

const getTerminalCounts = async (req, res) => {
  try {
    const terminalsCount = await Terminal.aggregate([
      {
        $group: {
          _id: "$type", // Group by the 'type' field
          count: { $sum: 1 }, // Count the number of terminals in each group
        },
      },
    ]);
    res.status(200).json({
      status: "true",
      terminalsCount,
    });
  } catch (error) {
    // Log the error (optional)
    console.error(error);

    // Send back an error response
    res.status(500).json({
      status: false,
      message: "Failed to retrieve terminals",
      error: error.message,
    });
  }
};

const getSiteCounts = async (req, res) => {
  try {
    const terminals = await Terminal.aggregate([
      {
        $match: {
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: { type: "$type", site: "$site" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.type",
          onsite: {
            $sum: {
              $cond: {
                if: { $eq: ["$_id.site", "Onsite"] },
                then: "$count",
                else: 0,
              },
            },
          },
          offsite: {
            $sum: {
              $cond: {
                if: { $eq: ["$_id.site", "Offsite"] },
                then: "$count",
                else: 0,
              },
            },
          },
          total: { $sum: "$count" },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          onsite: 1,
          offsite: 1,
          total: 1,
        },
      },
    ]);

    res.status(200).json({ data: terminals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTerminal = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const auth_user = req.auth_user;

  try {
    // Find the existing terminal
    const existingTerminal = await Terminal.findById(id);
    if (!existingTerminal) {
      return res.status(404).json({ message: "Terminal not found." });
    }

    // Handle soft delete and port update
    if (updateData.status === "Stopped" || updateData.status === "Relocated") {
      updateData.isDeleted = true;

      // Decrement the usedPorts count for the current port
      const existingPort = await Port.findOne({
        portNumber: existingTerminal.port,
      });
      if (existingPort) {
        existingPort.usedPorts -= 1;
        await existingPort.save();
      }

      // Update the terminal with the new data
      const updatedTerminal = await Terminal.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updatedTerminal) {
        return res.status(404).json({ message: "Terminal not found." });
      }

      // Log the activity
      const newLog = new UserActivityLog({
        userId: auth_user._id,
        action: "Delete Terminal",
        description: `User ${auth_user.firstName} with userId ${auth_user._id} Deleted Terminal with unitId ${updateData.unitId}.`,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      // Save the log to the database
      await newLog.save();

      return res.status(200).json({
        message: "Terminal successfully updated.",
        terminal: updatedTerminal,
      });
    }

    // Validate if the terminalId is already in use
    const existingTerminalById = await Terminal.findOne({
      _id: { $ne: id }, // Exclude the current terminal being updated
      terminalId: updateData.terminalId,
    });
    if (existingTerminalById) {
      return res.status(400).json({ message: "Terminal ID already in use." });
    }

    // Validate if the unitId is already in use
    const existingTerminalByUnitId = await Terminal.findOne({
      _id: { $ne: id },
      unitId: updateData.unitId,
      type: updateData.unitId,
    });
    if (existingTerminalByUnitId) {
      return res.status(400).json({ message: "Unit ID already exists." });
    }

    // Validate if the ipAddress is already in use
    const existingTerminalByIpAddress = await Terminal.findOne({
      _id: { $ne: id },
      ipAddress: updateData.ipAddress,
      isDeleted: false,
    });
    if (existingTerminalByIpAddress) {
      return res.status(400).json({ message: "IP Address already exists." });
    }

    // Validate if the cbsAccount is already in use
    const existingTerminalByCbsAccount = await Terminal.findOne({
      _id: { $ne: id },
      cbsAccount: updateData.cbsAccount,
    });
    if (existingTerminalByCbsAccount) {
      return res.status(400).json({ message: "CBS Account already exists." });
    }

    // Check if the port number has changed
    if (existingTerminal.port !== updateData.port) {
      // Validate if the new port number exists and has capacity
      const newPort = await Port.findOne({ portNumber: updateData.port });
      if (!newPort) {
        return res
          .status(400)
          .json({ message: "New port number does not exist." });
      }
      if (newPort.usedPorts >= newPort.portCapacity) {
        return res
          .status(400)
          .json({ message: "New port capacity is reached." });
      }

      // Increase usedPorts count for the new port
      newPort.usedPorts += 1;
      await newPort.save();

      // Fetch the existing port document for the current terminal
      const existingPort = await Port.findOne({
        portNumber: existingTerminal.port,
      });
      if (existingPort) {
        // Decrease usedPorts count for the existing port
        existingPort.usedPorts -= 1;
        await existingPort.save();
      }
    }

    // Update the terminal with the new data
    const updatedTerminal = await Terminal.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedTerminal) {
      return res.status(404).json({ message: "Terminal not found." });
    }

    // Log the activity
    const newLog = new UserActivityLog({
      userId: auth_user._id,
      action: "Update Terminal",
      description: `User ${auth_user.firstName} with userId ${auth_user._id} updated Terminal with unitId ${updateData.unitId}.`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // Save the log to the database
    await newLog.save();

    res.status(200).json({
      message: "Terminal successfully updated.",
      terminal: updatedTerminal,
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({ message: "Duplicate key error", error });
    }
    console.error("Error updating terminal:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteTerminal = async (req, res) => {
  try {
    // Extract terminal ID from request parameters
    const terminalId = req.params.id;
    console.log("terminal id to be deleted", terminalId);

    // Validate terminal ID
    if (!terminalId) {
      return res.status(400).json({ message: "Terminal ID is required" });
    }

    // Fetch the terminal to get the associated portNumber
    const terminal = await Terminal.findById(terminalId);
    if (!terminal) {
      return res.status(404).json({ message: "Terminal not found" });
    }

    // Fetch the port based on the portNumber stored in the terminal
    const portNumber = terminal.port; // Assuming terminal has a portNumber field
    const port = await Port.findOne({ portNumber: portNumber });
    if (!port) {
      return res.status(404).json({ message: "Port not found" });
    }

    // Decrease the usageCount by one
    if (port.usedPorts > 0) {
      port.usedPorts -= 1;
    }

    // Save the updated port
    await port.save();

    // Perform a soft delete by updating the document
    terminal.status = "Deleted";
    terminal.isDeleted = true;
    await terminal.save();

    // Return a success response
    res
      .status(200)
      .json({ message: "Terminal marked as deleted successfully" });
  } catch (error) {
    // Handle any errors
    console.error("Error deleting Terminal:", error);
    res.status(500).json({ message: "Server error " }, error);
  }
};

const getRelocatedTerminal = async (req, res) => {
  try {
    let role = req.auth_user.role;
    // console.log("user in get terminal", role);
    const terminals = await Terminal.find({ isDeleted: true });

    // console.log(terminals);

    res.status(200).json({
      status: "true",
      terminals,
      role,
    });
  } catch (error) {
    // Log the error (optional)
    console.error(error);

    // Send back an error response
    res.status(500).json({
      status: false,
      message: "Failed to retrieve terminals",
      error: error.message,
    });
  }
};

export {
  createTerminal,
  getTerminal,
  getTerminalCounts,
  getSiteCounts,
  updateTerminal,
  deleteTerminal,
  getAllTerminal,
  getRelocatedTerminal,
};
