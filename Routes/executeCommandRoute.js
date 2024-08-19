import express from "express";
const app = express();
const router = express.Router();

import {
  checkConnectionHandler,
  sendLoad,
} from "../Controllers/executeCommandController.js";
import isAuthenticated from "../Middleware/authenticate.js";
import { isSuperAuthorized } from "../Middleware/authorization.js";

// get log activity
router.route("/load").post(isAuthenticated, isSuperAuthorized(), sendLoad);
router
  .route("/connect")
  .post(isAuthenticated, isSuperAuthorized(), checkConnectionHandler);

export default router;
