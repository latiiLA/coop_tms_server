import express from "express";
const app = express();
const router = express.Router();

import {
  createBug,
  createFeedback,
  getFeedbacks,
  getBugs,
} from "../Controllers/feedbackController.js";
import isAuthenticated from "../Middleware/authenticate.js";
import { isSuperAuthorized } from "../Middleware/authorization.js";

router.route("/feedback").post(isAuthenticated, createFeedback);

router.route("/bug").post(isAuthenticated, createBug);
router
  .route("/getFeedbacks")
  .get(isAuthenticated, isSuperAuthorized(), getFeedbacks);
router.route("/getBugs").get(isAuthenticated, isSuperAuthorized(), getBugs);

export default router;
