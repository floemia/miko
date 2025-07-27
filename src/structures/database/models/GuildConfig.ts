import { Schema, model } from "mongoose";
import { GuildConfigModel } from "./types";

const GuildConfigSchema = new Schema<GuildConfigModel>({
    id: {type: String, required: true},
	tracking_enabled: {type: Boolean, required: true, default: true},
    channel: {
        track: {type: String, required: true, default: ""},
        logs: {type: String, required: true, default: ""},
    }
})

export const GuildConfig = model("guild", GuildConfigSchema)

