import Port from "../Models/portModel.js";
import UserActivityLog from "../Models/userActivityLogModel.js";

const createPort = async (req, res) => {
  let createdBy = req.auth_user._id;
  try {
    // console.log(req.body);
    const {
      portName,
      portNumber,
      portAssignment,
      portSiteAssignment,
      portCapacity,
    } = req.body;

    const existing_port = await Port.findOne({ portNumber });

    if (existing_port) {
      return res.status(400).json({ message: "Port Number already exist" });
    }
    const existing_port_name = await Port.findOne({ portName });

    if (existing_port_name) {
      return res.status(400).json({ message: "Port Name already exist" });
    }
    const new_port = await Port.create({
      portName,
      portNumber,
      portAssignment,
      portSiteAssignment,
      portCapacity,
      createdBy,
    });

    // Log the activity
    const newLog = new UserActivityLog({
      userId: req.auth_user._id,
      action: "Create Port",
      description: `User ${req.auth_user.firstName} with userId ${req.auth_user._id} created new Port with port Number ${portNumber}.`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // Save the log to the database
    await newLog.save();

    console.log(new_port);
    res.status(200).json({
      status: "success",
      new_port,
      message: "Port is successfully created.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while creating the port.",
    });
  }
};

const getPorts = async (req, res) => {
  const ports = await Port.find();

  // console.log(user);

  res.status(200).json({
    status: "true",
    ports,
  });
};

// const getAssignedPorts = async (req, res) => {
//   try {
//     const { portSiteAssignment, portAssignment } = req.query;
//     console.log("Query Params:", portSiteAssignment, portAssignment); // Log query params

//     // Fetch ports with their capacities and used port counts
//     const ports = await Port.find({
//       portSiteAssignment,
//       portAssignment,
//       isDeleted: false,
//     }).select("portNumber portCapacity usedPorts");

//     console.log("Fetched Ports:", ports); // Log fetched ports

//     // Filter ports where usedPortsCount is less than portCapacity
//     const availablePorts = ports
//       .filter((port) => {
//         console.log(
//           `Port: ${port.portNumber}, Capacity: ${port.portCapacity}, Used: ${port.usedPorts}`
//         );
//         return port.usedPorts < port.portCapacity;
//       })
//       .map((port) => port.portNumber);

//     console.log("Available Ports:", availablePorts); // Log available ports

//     // Respond with the available port numbers as JSON
//     res.status(200).json({ availablePorts });
//   } catch (error) {
//     console.error("Error fetching assigned ports:", error);
//     res.status(500).json({ error: "Failed to fetch assigned ports" });
//   }
// };

// const getAssignedPorts = async (req, res) => {
//   try {
//     const { portSiteAssignment, portAssignment } = req.query;
//     console.log("Query Params:", portSiteAssignment, portAssignment); // Log query params

//     // Fetch ports based on the specified type and site
//     const specificPorts = await Port.find({
//       portAssignment: portAssignment,
//       portSiteAssignment: portSiteAssignment,
//       isDeleted: false,
//     }).select("portNumber portCapacity usedPorts");

//     console.log("Specific Ports:", specificPorts); // Log specific ports

//     // Fetch ports assigned to BothType with the specified site
//     const bothTypePorts = await Port.find({
//       portAssignment: "BothType",
//       portSiteAssignment: portSiteAssignment,
//       isDeleted: false,
//     }).select("portNumber portCapacity usedPorts");

//     console.log("BothType Ports:", bothTypePorts); // Log BothType ports

//     // Fetch ports assigned to BothSite with the specified type
//     const bothSitePorts = await Port.find({
//       portAssignment: portAssignment,
//       portSiteAssignment: "BothSite",
//       isDeleted: false,
//     }).select("portNumber portCapacity usedPorts");

//     console.log("BothSite Ports:", bothSitePorts); // Log BothSite ports

//     // Fetch ports assigned to BothType and BothSite (no specific filter)
//     const bothTypeAndSitePorts = await Port.find({
//       portAssignment: "BothType",
//       portSiteAssignment: "BothSite",
//       isDeleted: false,
//     }).select("portNumber portCapacity usedPorts");

//     console.log("BothType and BothSite Ports:", bothTypeAndSitePorts); // Log BothType and BothSite ports

//     // Combine all fetched ports
//     const allPorts = [
//       ...specificPorts,
//       ...bothTypePorts,
//       ...bothSitePorts,
//       ...bothTypeAndSitePorts,
//     ];

//     console.log("All Ports Before Deduplication:", allPorts); // Log all ports before deduplication

//     // Remove duplicates based on portNumber
//     const uniquePortsMap = new Map();
//     allPorts.forEach((port) => {
//       if (!uniquePortsMap.has(port.portNumber)) {
//         uniquePortsMap.set(port.portNumber, port);
//       }
//     });

//     const uniquePorts = Array.from(uniquePortsMap.values());

//     console.log("Unique Ports:", uniquePorts); // Log unique ports

//     // Filter ports where usedPortsCount is less than portCapacity
//     const availablePorts = uniquePorts
//       .filter((port) => {
//         console.log(
//           `Port: ${port.portNumber}, Capacity: ${port.portCapacity}, Used: ${port.usedPorts}`
//         );
//         return port.usedPorts <= port.portCapacity;
//       })
//       .map((port) => port.portNumber);

//     console.log("Available Ports:", availablePorts); // Log available ports

//     // Respond with the available port numbers as JSON
//     res.status(200).json({ availablePorts });
//   } catch (error) {
//     console.error("Error fetching assigned ports:", error);
//     res.status(500).json({ error: "Failed to fetch assigned ports" });
//   }
// };

const getAssignedPorts = async (req, res) => {
  try {
    const { portSiteAssignment, portAssignment, currentPort } = req.query;
    console.log(
      "Query Params:",
      portSiteAssignment,
      portAssignment,
      currentPort
    ); // Log query params

    // Fetch ports based on the specified type and site
    const specificPorts = await Port.find({
      portAssignment: portAssignment,
      portSiteAssignment: portSiteAssignment,
    }).select("portNumber portCapacity usedPorts");

    console.log("Specific Ports:", specificPorts); // Log specific ports

    // Fetch ports assigned to BothType with the specified site
    const bothTypePorts = await Port.find({
      portAssignment: "BothType",
      portSiteAssignment: portSiteAssignment,
    }).select("portNumber portCapacity usedPorts");

    console.log("BothType Ports:", bothTypePorts); // Log BothType ports

    // Fetch ports assigned to BothSite with the specified type
    const bothSitePorts = await Port.find({
      portAssignment: portAssignment,
      portSiteAssignment: "BothSite",
    }).select("portNumber portCapacity usedPorts");

    console.log("BothSite Ports:", bothSitePorts); // Log BothSite ports

    // Fetch ports assigned to BothType and BothSite (no specific filter)
    const bothTypeAndSitePorts = await Port.find({
      portAssignment: "BothType",
      portSiteAssignment: "BothSite",
    }).select("portNumber portCapacity usedPorts");

    console.log("BothType and BothSite Ports:", bothTypeAndSitePorts); // Log BothType and BothSite ports

    // Combine all fetched ports
    let allPorts = [
      ...specificPorts,
      ...bothTypePorts,
      ...bothSitePorts,
      ...bothTypeAndSitePorts,
    ];

    console.log("All Ports Before Deduplication:", allPorts); // Log all ports before deduplication

    // Remove duplicates based on portNumber
    const uniquePortsMap = new Map();
    allPorts.forEach((port) => {
      if (!uniquePortsMap.has(port.portNumber)) {
        uniquePortsMap.set(port.portNumber, port);
      }
    });

    let uniquePorts = Array.from(uniquePortsMap.values());

    console.log("Unique Ports:", uniquePorts); // Log unique ports

    // Filter ports where usedPortsCount is less than portCapacity
    const filteredPorts = uniquePorts.filter((port) => {
      const isAvailable = port.usedPorts < port.portCapacity;
      console.log(
        `Port: ${port.portNumber}, Capacity: ${port.portCapacity}, Used: ${port.usedPorts}, Is Available: ${isAvailable}`
      );
      return isAvailable;
    });

    // Check if the current port fits the criteria and add it if needed
    if (currentPort) {
      const currentPortMatch = await Port.findOne({
        portNumber: currentPort,
      }).select(
        "portNumber portCapacity usedPorts portAssignment portSiteAssignment"
      );

      console.log("Current Port Match:", currentPortMatch); // Log current port match

      if (currentPortMatch) {
        const {
          portAssignment: currentPortAssignment,
          portSiteAssignment: currentPortSiteAssignment,
        } = currentPortMatch;

        // Determine if the current port should be included
        const includeCurrentPort =
          currentPortAssignment === "BothType" ||
          (currentPortAssignment === portAssignment &&
            currentPortSiteAssignment === "BothSite") ||
          (currentPortAssignment === portAssignment &&
            currentPortSiteAssignment === portSiteAssignment);

        console.log(
          `Including current port ${currentPort} based on criteria: ${includeCurrentPort}`
        );

        // Add current port to the list regardless of its capacity
        if (includeCurrentPort) {
          filteredPorts.push(currentPortMatch);
        }
      }
    }

    // Remove duplicates again after adding the current port
    const finalPortsMap = new Map();
    filteredPorts.forEach((port) => {
      if (!finalPortsMap.has(port.portNumber)) {
        finalPortsMap.set(port.portNumber, port);
      }
    });

    const finalPorts = Array.from(finalPortsMap.values());

    console.log("Final Ports After Adding Current Port:", finalPorts); // Log final ports after deduplication

    // Prepare the list of available ports for response
    const availablePorts = finalPorts.map((port) => port.portNumber);

    console.log("Available Ports:", availablePorts); // Log available ports

    // Respond with the available port numbers as JSON
    res.status(200).json({ availablePorts });
  } catch (error) {
    console.error("Error fetching assigned ports:", error);
    res.status(500).json({ error: "Failed to fetch assigned ports" });
  }
};

const deletePort = async (req, res) => {
  try {
    // Extract port ID from request parameters
    const portId = req.params.id;

    // Validate port ID
    if (!portId) {
      return res.status(400).json({ message: "Port ID is required" });
    }

    // Fetch the port from the database
    const port = await Port.findById(portId);
    if (!port) {
      return res.status(404).json({ message: "Port not found" });
    }

    // Check if usedPorts is 0
    if (port.usedPorts !== 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete port. The port is in use." });
    }

    // Perform a soft delete by updating the document
    await Port.findByIdAndDelete(portId);

    // Log the activity
    const newLog = new UserActivityLog({
      userId: req.auth_user._id,
      action: "Delete Port",
      description: `User ${req.auth_user.firstName} with userId ${req.auth_user._id} deleted Port with port Number ${port.portNumber}.`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // Save the log to the database
    await newLog.save();

    res.status(200).json({ message: "Port deleted successfully" });
  } catch (error) {
    // Handle any errors
    console.error("Error deleting Port:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export { createPort, getPorts, getAssignedPorts, deletePort };
