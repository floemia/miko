import { Schema, model } from "mongoose";
import { DroidDefaultServer } from "./types";

const DiscordUserDefaultServerSchema = new Schema<DroidDefaultServer>({
	discord_id: { required: true, type: String },
	server: { required: true, type: String },
})

const DiscordUserDefaultServerModel = model("DiscordUserDefaultServer", DiscordUserDefaultServerSchema)
export default DiscordUserDefaultServerModel