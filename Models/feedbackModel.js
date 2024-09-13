import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    service: {
      type: String,
    },
    feedback: {
      type: String,
    },
    expectedResult: {
      type: String,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
