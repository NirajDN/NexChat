//Sign up New user

import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";

const sanitizeUser = (user) => {
	const sanitized = user.toObject ? user.toObject() : { ...user };
	delete sanitized.password;
	return sanitized;
};

export const signup = async (req, res) => {
	try {
		const { fullName, email, password, bio } = req.body;

		if (!fullName || !email || !password || !bio) {
			return res
				.status(400)
				.json({ success: false, message: "Missing required fields" });
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res
				.status(409)
				.json({ success: false, message: "Account already exists" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = await User.create({
			fullName,
			email,
			password: hashedPassword,
			bio,
		});

		const token = generateToken(newUser._id);

		res.status(201).json({
			success: true,
			userData: sanitizeUser(newUser),
			token,
			message: "Account created successfully",
		});
	} catch (error) {
		console.error("signup error:", error);
		res
			.status(500)
			.json({ success: false, message: "Failed to create account" });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ success: false, message: "Missing credentials" });
		}

		const userData = await User.findOne({ email });

		if (!userData) {
			return res
				.status(401)
				.json({ success: false, message: "Invalid credentials" });
		}

		const isPasswordCorrect = await bcrypt.compare(
			password,
			userData.password
		);

		if (!isPasswordCorrect) {
			return res
				.status(401)
				.json({ success: false, message: "Invalid credentials" });
		}

		const token = generateToken(userData._id);

		res.json({
			success: true,
			userData: sanitizeUser(userData),
			token,
			message: "Login successful",
		});
	} catch (error) {
		console.error("login error:", error);
		res.status(500).json({ success: false, message: "Login failed" });
	}
};
//controller to check if user is authenticated

export const checkAuth=(req,res)=>{
    res.json({success:true ,user:req.user});
}

//Controller to update user profile details
export const updateProfile = async (req, res) => {
	try {
		const { profilePic, bio, fullName } = req.body;

		const userID = req.user._id;
		let updatedUser;

		if (!profilePic) {
			updatedUser = await User.findByIdAndUpdate(
				userID,
				{ bio, fullName },
				{ new: true }
			).select("-password");
		} else {
			const upload = await cloudinary.uploader.upload(profilePic);
			updatedUser = await User.findByIdAndUpdate(
				userID,
				{
					profilePic: upload.secure_url,
					bio,
					fullName,
				},
				{ new: true }
			).select("-password");
		}
		res.json({ success: true, user: updatedUser });
	} catch (error) {
		console.error("updateProfile error:", error);
		res
			.status(500)
			.json({ success: false, message: "Failed to update profile" });
	}
};