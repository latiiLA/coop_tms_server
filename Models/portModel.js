import mongoose from "mongoose";

const portSchema = mongoose.Schema(
  {
    portName: {
      type: String,
      unique: true,
      required: [true, "Please enter port command."],
    },
    portNumber: {
      type: Number,
      unique: true,
      required: [true, "Please enter port number."],
    },
    portAssignment: {
      type: String,
      required: [true, "Please assign ATM type the Port is used for."],
    },
    portSiteAssignment: {
      type: String,
      required: [true, "Please assign ATM site to the Port."],
    },
    usedPorts: {
      type: Number,
      default: 0,
    },
    portCapacity: {
      type: Number,
      required: [true, "Please enter port capacity."],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // createdby: {
    //   type: String,
    //   required: [true, "Created user id is required"],
    // },
  },
  { timestamps: true }
);

const Port = mongoose.model("Port", portSchema);

export default Port;
