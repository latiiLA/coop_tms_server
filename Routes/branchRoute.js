import express from "express";
const app = express();
const router = express.Router();

import { getBranch } from "../Controllers/branchController.js";
import isAuthenticated from "../Middleware/authenticate.js";
import { isAuthorized } from "../Middleware/authorization.js";

// get command
router.route("/getBranch").get(isAuthenticated, getBranch);

export default router;
