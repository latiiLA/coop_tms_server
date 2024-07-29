import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(cookieParser());
// Allow requests from localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // Enable credentials (cookies, authorization headers, etc.)
  })
);
// Middleware to parse JSON
app.use(express.json());

import authRoute from "./Routes/authRoute.js";
import commandRoute from "./Routes/commandRoute.js";
import terminalRoute from "./Routes/terminalRoute.js";
import portRoute from "./Routes/portRoute.js";
import searchRoute from "./Routes/searchRoute.js";

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        `Mongodb connected and Listening on the port ${process.env.PORT}`
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/auth", authRoute);
app.use("/command", commandRoute);
app.use("/terminal", terminalRoute);
app.use("/port", portRoute);
app.use("/search", searchRoute);
