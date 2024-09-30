import { Schema, model } from "mongoose";
import { OsuTrackingUser } from "./types";

const OsuAccountTrackSchema = new Schema<OsuTrackingUser>({
    username: { required: true, type: String },
	country: { required: true, type: String },
    uid: { required: true, type: Number },
    discord_id: { required: true, type: String },
	mode: { required: true, type: String },
	mode_int: { required: true, type: Number },
    guild: { required: true, type: String },
    last_score_id: { type: Number, required: true },
})

const OsuAccountTrackModel = model("osu-tracking", OsuAccountTrackSchema)
export default OsuAccountTrackModel