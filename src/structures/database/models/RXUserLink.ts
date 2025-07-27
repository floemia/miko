import { Schema, model } from "mongoose";
import { DroidUserBind } from "./types";

const LinkSchema = new Schema<DroidUserBind>({
    username: { required: true, type: String },
    uid: { required: true, type: Number },
    discord_id: { required: true, type: String }
})

export const RXUserLink = model("osu!droidrx-userbind", LinkSchema)