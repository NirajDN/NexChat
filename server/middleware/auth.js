import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
	try {
		const token =
			req.headers.token ||
			req.headers.authorization?.replace("Bearer ", "");

		if (!token) {
			return res
				.status(401)
				.json({ success: false, message: "Authentication required" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const user = await User.findById(decoded.userID).select("-password");

		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		req.user = user;
		next();
	} catch (error) {
		console.error("protectRoute error:", error);
		return res
			.status(401)
			.json({ success: false, message: "Invalid or expired token" });
	}
};