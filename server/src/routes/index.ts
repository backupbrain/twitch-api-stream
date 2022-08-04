import express from "express";
export const router = express.Router();

import { router as accountRoutes } from "./account";
import { router as billingRoutes } from "./billing";

router.use("/api/1.0/account", accountRoutes);
router.use("/api/1.0/account/billing", billingRoutes);
