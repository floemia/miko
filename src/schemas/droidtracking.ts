import { Schema, model } from "mongoose";
import { DroidTrackingUser } from "./types";

const DroidAccountTrackSchema = new Schema<DroidTrackingUser>({
    username: { required: true, type: String },
    uid: { required: true, type: Number },
    discord_id: { required: true, type: String },
    country: { required: true, type: String },
    guild: { required: true, type: String },
    last_score: { type: Number, required: true },
    timestamp: { type: Number, required: true },
})

const DroidAccountTrackModel = model("droid-tracking", DroidAccountTrackSchema)
export default DroidAccountTrackModel