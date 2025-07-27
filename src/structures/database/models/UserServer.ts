import { Schema, model } from "mongoose";

export interface DroidDefaultServer {
	discord_id: string,
	server: "ibancho" | "rx",
}

const DroidDefaultServerSchema = new Schema<DroidDefaultServer>({
	discord_id: { required: true, type: String },
	server: { required: true, type: String, default: "ibancho" },
})

export const UserServer = model("discorduserdefaultserver", DroidDefaultServerSchema)
