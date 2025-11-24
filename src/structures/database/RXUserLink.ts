import { Schema, model } from "mongoose";
import { DroidBindEntry } from "./BanchoUserLink";

const LinkSchema = new Schema<DroidBindEntry>({
    username: { required: true, type: String },
    uid: { required: true, type: Number },
    discord_id: { required: true, type: String }
})

/**
 * The MongoDB model for the linked osu!droid accounts of the RX server.
 */
export const RXUserLink = model("osu!droidrx-userbind", LinkSchema)