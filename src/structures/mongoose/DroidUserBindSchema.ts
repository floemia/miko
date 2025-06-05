import { Schema, model } from "mongoose";
import { DroidUserBind } from "./types";

const DroidUserBindSchema = new Schema<DroidUserBind>({
    username: { required: true, type: String },
    uid: { required: true, type: Number },
    discord_id: { required: true, type: String }
})

const DroidUserBindModel = model("osu!droid-userbind", DroidUserBindSchema)
export default DroidUserBindModel