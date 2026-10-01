import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { validateObjectIdParam } from "../middleware/validate.js";
import { checkoutLimiter } from "../middleware/rateLimiter.js";
import {
    createCheckoutSession,
    getAllPurchasedCourse,
    getCourseDetailWithPurchasedStatus,
    stripeWebhook,
    verifyCheckoutSession
} from "../controller/coursePurchase.controller.js";

const router = express.Router();

router.param("courseId", validateObjectIdParam);

router.route("/checkout/create-checkout-session").post(isAuthenticated, checkoutLimiter, createCheckoutSession);
router.route("/webhook").post(stripeWebhook);
router.route("/verify-session").post(isAuthenticated, verifyCheckoutSession);
router.route("/course/:courseId/detail-with-status").get(isAuthenticated, getCourseDetailWithPurchasedStatus);
router.route("/").get(isAuthenticated, getAllPurchasedCourse); // added isAuthenticated

export default router;
