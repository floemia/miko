import mongoose from "mongoose";
import { droid_tracking, osu_tracking } from "./tracking";
import { logger } from "..";
export const connect_mongoose = async () => {
	const MONGO_URI = process.env.MONGO_URI
	if (!MONGO_URI) return logger.warning("MongoDB URI not found.", "DATABASE")

	mongoose.connect(`${MONGO_URI}`)
		.then(async () => {
			logger.info("MongoDB connection established.", "DATABASE")
			if (process.env.DROID_TRACKING_ENABLED == "true") {
				await droid_tracking()
			}
			if (process.env.OSU_TRACKING_ENABLED == "true") {
				await osu_tracking()
			}
		})
		.catch((error) => logger.error(`An error occurred while connecting to MongoDB - ${error}`, "DATABASE"))
}