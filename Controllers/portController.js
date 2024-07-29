import Port from "../Models/portModel.js";

const createPort = async (req, res) => {
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
    });

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
  const ports = await Port.find({ isDeleted: false });

  // console.log(user);

  res.status(200).json({
    status: "true",
    ports,
  });
};

const getAssignedPorts = async (req, res) => {
  try {
    const { portSiteAssignment, portAssignment } = req.query;
    console.log("Query Params:", portSiteAssignment, portAssignment); // Log query params

    // Fetch ports with their capacities and used port counts
    const ports = await Port.find({
      portSiteAssignment,
      portAssignment,
      isDeleted: false,
    }).select("portNumber portCapacity usedPorts");

    console.log("Fetched Ports:", ports); // Log fetched ports

    // Filter ports where usedPortsCount is less than portCapacity
    const availablePorts = ports
      .filter((port) => {
        console.log(
          `Port: ${port.portNumber}, Capacity: ${port.portCapacity}, Used: ${port.usedPorts}`
        );
        return port.usedPorts < port.portCapacity;
      })
      .map((port) => port.portNumber);

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
    res.status(200).json({ message: "Port deleted successfully" });
  } catch (error) {
    // Handle any errors
    console.error("Error deleting Port:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export { createPort, getPorts, getAssignedPorts, deletePort };
