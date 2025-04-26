import { Schema, model } from "mongoose";
import { DroidUserBind } from "./types";

const DroidRXUserBindSchema = new Schema<DroidUserBind>({
    username: { required: true, type: String },
    uid: { required: true, type: Number },
    discord_id: { required: true, type: String }
})

const DroidUserBindModel = model("osu!droidrx-userbind", DroidRXUserBindSchema)
export default DroidUserBindModel