import mongoose from "mongoose";
import { droid_tracking, osu_tracking } from "./tracking";
import { logger } from "..";
import { auth } from "osu-api-extended"

export const osu_api_connect = async () => {
	if (process.env.OSU_CLIENT_ID && process.env.OSU_CLIENT_SECRET) {
		await auth.login(Number(process.env.OSU_CLIENT_ID), process.env.OSU_CLIENT_SECRET, ['public'])
		logger.info("osu! api v2 connection established.", "API")
	}
}

export const connect_mongoose = async () => {
	const MONGO_URI = process.env.MONGO_URI
	if (!MONGO_URI) return logger.warning("MongoDB URI not found.", "DATABASE")

	await mongoose.connect(`${MONGO_URI}`)
		.then(async () => {
			logger.info("MongoDB connection established.", "DATABASE")
			if (process.env.OSU_TRACKING_ENABLED == "true") {
				osu_tracking()
			}
			if (process.env.DROID_TRACKING_ENABLED == "true") {
				droid_tracking()
			}
		})
		.catch((error) => logger.error(`An error occurred while connecting to MongoDB - ${error}`, "DATABASE"))
}