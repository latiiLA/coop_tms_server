import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    branchCode: {
      type: String,
      unique: true,
      required: [true, "Please enter a branch code."],
    },
    companyName: {
      type: String,
      unique: true,
      required: [true, "Please enter a branch name."],
    },
    address: {
      type: String,
      required: [true, "Please enter the branch address."],
    },
    mnemonic: {
      type: String,
      unique: true,
      required: [true, "Please enter a mnemonic."],
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      required: [true, "Creator user ID is required"],
    },
  },
  { timestamps: true }
);

const Branch = mongoose.model("Branch", branchSchema);

export default Branch;
