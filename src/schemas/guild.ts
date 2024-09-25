import { Schema, model } from "mongoose";
import { GuildConfig } from "./types";

const GuildConfigSchema = new Schema<GuildConfig>({
    id: {type: String, required: true},
    channel: {
        track: {type: String, required: true},
        logs: {type: String, required: true},
    }
})

const GuildConfigModel = model("guild", GuildConfigSchema)

export default GuildConfigModel