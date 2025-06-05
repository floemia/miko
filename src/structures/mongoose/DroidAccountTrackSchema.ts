import { Schema, model } from "mongoose";
import { DroidTrackingUser } from "./types";

const DroidAccountTrackSchema = new Schema<DroidTrackingUser>({
	username: { required: true, type: String },
	uid: { required: true, type: Number },
	guilds: [{
		id: { required: true, type: String },
		owner_id: { required: true, type: String }
	}],
	timestamp: { type: Date, required: true },
})

const DroidAccountTrackModel = model("DroidTrackingList", DroidAccountTrackSchema)
export default DroidAccountTrackModel