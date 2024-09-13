import mongoose from "mongoose";

const bugSchema = new mongoose.Schema(
  {
    bugDescription: {
      type: String,
    },
    steps: {
      type: String,
    },
    expectedBehaviour: {
      type: String,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
    },
  },
  { timestamps: true }
);

const Bug = mongoose.model("Bug", bugSchema);

export default Bug;
