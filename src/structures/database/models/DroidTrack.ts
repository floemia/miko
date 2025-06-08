import { Schema, model } from "mongoose";

const DroidTrackSchema = new Schema ({
	username: { required: true, type: String },
	uid: { required: true, type: Number },
	guilds: [{
		id: { required: true, type: String },
		owner_id: { required: true, type: String }
	}],
	timestamp: { type: Date, required: true },
})


export const DroidTrack = model("droidtrackinglist", DroidTrackSchema)
