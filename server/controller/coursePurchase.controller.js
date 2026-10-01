import Stripe from "stripe";
import Course from "../model/course.model.js";
import { CoursePurchase } from "../model/purchaseCourse.model.js";
import { Lecture } from "../model/lecture.model.js";
import User from "../model/user.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Marks a purchase as completed and enrolls the user. Safe to call many times
// (webhook + verify endpoint can both run for the same payment).
export const completePurchase = async (session) => {
    const purchase = await CoursePurchase.findOne({ paymentId: session.id });
    if (!purchase) return false;

    if (purchase.status !== "completed") {
        if (session.amount_total) {
            purchase.amount = session.amount_total / 100;
        }
        purchase.status = "completed";
        await purchase.save();
    }

    // $addToSet makes these idempotent, so they also heal a half-finished earlier attempt
    await User.findByIdAndUpdate(purchase.userId, {
        $addToSet: { enrolledCourses: purchase.courseId },
    });
    await Course.findByIdAndUpdate(purchase.courseId, {
        $addToSet: { enrolledStudents: purchase.userId },
    });
    return true;
};

export const createCheckoutSession = async (req, res) => {
    try {
        const userId = req.id;
        const { courseId } = req.body;

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                message: "course Not found"
            });
        }

        if (!course.isPublished) {
            return res.status(400).json({
                message: "This course is not available for purchase"
            });
        }

        if (String(course.creator) === String(userId)) {
            return res.status(400).json({
                message: "You cannot purchase your own course"
            });
        }

        const alreadyBought = await CoursePurchase.exists({ userId, courseId, status: "completed" });
        if (alreadyBought) {
            return res.status(400).json({
                message: "You are already enrolled in this course"
            });
        }

        // ADDED: guard against courses with no price set — this is what
        // was causing the "amount required" ValidationError crash
        if (!course.coursePrice || course.coursePrice <= 0) {
            return res.status(400).json({
                message: "This course does not have a valid price set"
            });
        }

        // create new course purchase record
        const newPurchase = new CoursePurchase({
            courseId,
            userId,
            amount: course.coursePrice,
            status: "pending"
        });

        // create a stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: course.courseTitle,
                            ...(course.courseThumbnail ? { images: [course.courseThumbnail] } : {}),
                        },
                        unit_amount: Math.round(course.coursePrice * 100), // amount in paisa (rounded: no floating point cents)
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/course-progress/${courseId}?session_id={CHECKOUT_SESSION_ID}`, // once payment success
            cancel_url: `${process.env.FRONTEND_URL}/course-detail/${courseId}`,
            metadata: {
                courseId: courseId,
                userId: userId,
            },
            shipping_address_collection: {
                allowed_countries: ["IN"], // optionally restrict allowed countries
            },
        });

        if (!session.url) {
            return res.status(400).json({
                success: false,
                message: "error while creating session"
            });
        }

        // save the purchased record
        newPurchase.paymentId = session.id;
        await newPurchase.save();

        return res.status(200).json({
            success: true,
            url: session.url, // return the stripe checkout url
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const stripeWebhook = async (req, res) => {
    let event;
    try {
        // req.body must be the RAW request buffer here (use express.raw()
        // for this route), not JSON-parsed — Stripe signature verification
        // needs the exact raw bytes.
        const signature = req.headers["stripe-signature"];
        const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

        event = stripe.webhooks.constructEvent(req.body, signature, secret);

    } catch (error) {
        console.error("webhook error", error.message);
        return res.status(400).send(`webhook error:${error.message}`);
    }

    // handle checkout session complete event
    if (event.type === "checkout.session.completed") {
        try {
            const done = await completePurchase(event.data.object);
            if (!done) {
                return res.status(404).json({ message: "purchase not found" });
            }
        } catch (error) {
            console.error("Error handling event", error);
            return res.status(500).json({
                message: "Internal server Error"
            });
        }
    }

    res.status(200).send();
};


export const verifyCheckoutSession = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ message: "sessionId is required" });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // a user may only verify their own payment
        if (String(session.metadata?.userId) !== String(req.id)) {
            return res.status(403).json({ message: "This payment does not belong to you" });
        }

        if (session.payment_status !== "paid") {
            return res.status(200).json({
                success: false,
                completed: false,
                message: "Payment not completed",
            });
        }

        const done = await completePurchase(session);
        if (!done) {
            return res.status(404).json({ message: "purchase not found" });
        }

        return res.status(200).json({ success: true, completed: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getCourseDetailWithPurchasedStatus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        const course = await Course.findById(courseId)
            // only public instructor fields - NEVER the whole user document (it contains the password hash)
            .populate({ path: "creator", select: "name photourl" })
            .populate({ path: "lectures" })
            .lean();

        if (!course) {
            return res.status(404).json({
                message: "course not found"
            });
        }

        const isOwner = String(course.creator?._id) === String(userId);
        const purchase = await CoursePurchase.exists({ userId, courseId, status: "completed" });
        const hasAccess = Boolean(purchase) || isOwner;

        // Paywall: visitors only receive the video of lectures marked "free preview".
        if (!hasAccess) {
            course.lectures = (course.lectures || []).map((lecture) =>
                lecture.isPreviewFree ? lecture : { ...lecture, videoUrl: undefined, publicId: undefined }
            );
        }

        return res.status(200).json({
            course,
            purchased: hasAccess, // true = may open the course content ("Continue course")
            isOwner
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


export const getAllPurchasedCourse = async (req, res) => {
    try {
        // only the logged-in instructor's own courses
        const creatorCourses = await Course.find({ creator: req.id }).select("_id").lean();
        const courseIds = creatorCourses.map((c) => c._id);
        const match = { status: "completed", courseId: { $in: courseIds } };

        // totals are computed by the database, so the dashboard stays fast with thousands of sales
        const [totals, purchasedCourse] = await Promise.all([
            CoursePurchase.aggregate([
                { $match: match },
                { $group: { _id: null, totalSales: { $sum: 1 }, totalRevenue: { $sum: "$amount" } } },
            ]),
            // latest 100 sales feed the chart
            CoursePurchase.find(match).sort({ createdAt: -1 }).limit(100).populate("courseId").lean(),
        ]);

        return res.status(200).json({
            purchasedCourse: purchasedCourse || [],
            totalSales: totals[0]?.totalSales || 0,
            totalRevenue: totals[0]?.totalRevenue || 0,
            message: "Get purchased course successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "server error"
        });
    }
};
