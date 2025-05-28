import mongoose from "mongoose";
import { droid_tracking } from "./tracking";
import { auth } from "osu-api-extended"
import { utils } from "../utils"

export const osu_api_connect = async () => {
	if (process.env.OSU_CLIENT_ID && process.env.OSU_CLIENT_SECRET) {
		try{
		await auth.login({
			type: "v2",
			client_id: process.env.OSU_CLIENT_ID,
			client_secret: process.env.OSU_CLIENT_SECRET,
			scopes: ["public"]
		})
		utils.log.out({ prefix: "[API]", message: "osu! api v2 connection has been established.", color: "Blue" })
		} catch(error: any) {
			utils.log.out({ prefix: "[API][ERROR]", message: `An error has ocurred while establishing connection with osu! api v2. Details below.`, color: "Red", important: true })
			utils.log.err({ prefix: "[API]", message: error.stack || "Unknown error" })
			utils.log.out({ prefix: "[API][RETRY]", message: "Retrying osu! api v2 connection...", color: "Blue", important: true })
			await osu_api_connect()
		}
	} else {
		utils.log.out({ prefix: "[API][WARNING]", message: "osu! api v2 keys weren't found. Skipping osu! connection...", color: "Yellow", important: true })
	}
}

export const connect_mongoose = async () => {
	const MONGO_URI = process.env.MONGO_URI
	if (!MONGO_URI) return utils.log.out({ prefix: "[DATABASE][WARNING]", message: "MongoDB URI wasn't found. Skipping database connection...", color: "Yellow", important: true })


	await mongoose.connect(`${MONGO_URI}`)
		.then(async () => {
			utils.log.out({ prefix: "[DATABASE]", message: "Database connection has been established.", color: "Blue" })
			if (Boolean((process.env.DROID_TRACKING_ENABLED))) {
				droid_tracking()
			}
		})
		.catch((error: any) => {
			utils.log.out({ prefix: "[DATABASE][ERROR]", message: `An error has ocurred. Details below.`, color: "Red", important: true })
			utils.log.err({ prefix: "[DATABASE]", message: error.stack || "Unknown error" })
		})
}

