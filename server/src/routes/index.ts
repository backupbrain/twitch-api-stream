import express from "express";
export const router = express.Router();

import { router as accountRoutes } from "./account";

router.use("/api/1.0/account", accountRoutes);
