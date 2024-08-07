import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please enter firstName."],
    },
    fatherName: {
      type: String,
      required: [true, "Please enter fatherName."],
    },
    gfatherName: {
      type: String,
      required: [true, "Please enter gfatherName."],
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      trim: true,
      required: [true, "Please enter email."],
    },
    username: {
      type: String,
      unique: true,
      required: [true, "Please enter username email."],
    },
    department: {
      type: String,
      required: [true, "Please enter deparment."],
    },
    role: {
      type: String,
      lowercase: true,
      required: [true, "Please enter role"],
      enum: ["user", "admin", "tempo_user", "tempo_admin"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Please enter password"],
      trim: true,
      // minLength: 8,
      select: false,
    },
    // createdby: {
    //   type: String,
    //   required: [true, "Created user id is required"],
    // },
    status: {
      type: String,
      default: "New",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    wrongPasswordCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
