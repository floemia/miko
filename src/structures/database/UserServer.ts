import { Schema, model } from "mongoose";

/**
 * A MongoDB document representing a Discord user's default osu!droid server.
 */
export interface DroidDefaultServerEntry {
	/**
	 * The ID of the Discord user.
	 */
	discord_id: string,

	/**
	 * 
	 */
	server: "ibancho" | "rx",
}

const DroidDefaultServerSchema = new Schema<DroidDefaultServerEntry>({
	discord_id: { required: true, type: String },
	server: { required: true, type: String, default: "ibancho" },
})

export const UserServer = model("discorduserdefaultserver", DroidDefaultServerSchema)
