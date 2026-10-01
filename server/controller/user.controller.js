import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uplaodMedia } from "../utils/cloudinary.js";
import { authCookieOptions } from "../utils/cookieOptions.js";

// valid bcrypt hash used to spend the same time when the email does not exist (hides which emails are registered)
const DUMMY_HASH = "$2b$10$qKIL1JA3vVPjzZ1H8dhzqe2Ma6t6bPhrlF/yyn87QVRlZtTRvYEsK";

export const register = async (req, res) => {
    try {
        // console.log(req.body);
        const { name, password } = req.body;
        const email = String(req.body.email || "").trim().toLowerCase();

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password 
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        // const newUser = new User({ name, email, password });
        // await newUser.save();
        // or
        await User.create({
            name: String(name).trim(),
            email,
            password: hashedPassword
        });

        res.status(201).json({ message: "User registered successfully" });
        
    } catch (error) {
        console.error(error);// show the error for debugging purposes on console
        res.status(500).json({ message: "Server error" });// send a generic error message to the client
    }
}


export const login = async (req, res) => {
    try {
        const { password } = req.body;
        const rawEmail = String(req.body.email || "").trim();

        if (!rawEmail || !password) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        // older accounts may have been saved with capital letters, so try both spellings
        const user = await User.findOne({ email: { $in: [rawEmail.toLowerCase(), rawEmail] } });

        // always run one bcrypt compare, even for unknown emails, so response time does not reveal who has an account
        const isMatch = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
        if (!user || !isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // generate token and send it to the client;
       const token = generateToken(user)
        const { password: _password, ...safeUser } = user.toObject();
        return res
            .status(200)
            .cookie("token", token, authCookieOptions(24 * 60 * 60 * 1000))
            .json({
                success: true,
                message: `welcome back ${user.name}`,
                user: safeUser,
            });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}


export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", authCookieOptions(0)).json({
            message: "logged out successfully",
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to logout"
        })
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.id;
        // console.log(userId)

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID missing from request",
            });
        }

        const user = await User.findById(userId).select("-password").populate("enrolledCourses");
        //console.log(user)
        // const updatednewuser = await User.findByIdAndUpdate(
        //     userId,
        //     { role: "instructor" },
        //     { new: true }
        // );

        // console.log(updatednewuser);

        if (!user) {
            return res.status(404).json({
                message: "Profile not found",
                success: false,
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("getUserProfile error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load profile",
        });
    }
};



export const updateProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { name } = req.body;
        const profilePhoto = req.file;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "user not found ",
                success: false
            })
        }

        const updatedData = {};
        if (name) updatedData.name = name;

        // only touch the photo when a new file was actually uploaded
        if (profilePhoto) {
            // delete the old Cloudinary image (skip the default avatar)
            if (user.photourl && user.photourl.includes("cloudinary")) {
                const publicId = user.photourl.split("/").pop().split(".")[0];
                try {
                    await deleteMediaFromCloudinary(publicId);
                } catch (err) {
                    console.log(err);
                }
            }

            const cloudResponse = await uplaodMedia(profilePhoto.path);
            if (!cloudResponse) {
                return res.status(500).json({
                    success: false,
                    message: "failed to upload photo"
                });
            }
            updatedData.photourl = cloudResponse.secure_url;
        }

        const updateduser = await User.findByIdAndUpdate(userId, updatedData, { new: true }).select("-password")

        return res.status(200).json({
            success: true,
            user: updateduser,
            message: "Profile updated sucessfully"
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "failed to load user "
        })
    }
}