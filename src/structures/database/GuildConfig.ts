import { Schema, model } from "mongoose";

/**
 * A MongoDB document representing a guild's configuration.
 */
export interface GuildConfigEntry {
    /**
     * The ID of the guild.
     */
    id: string;

    /**
     * Whether the score tracking system is active in this guild or not.
     */
    tracking_enabled: boolean;

    /**
     * List of used channels in this guild.
     */
    channel: {

        /**
         * The channel ID for the score tracking system.
         */
        track: string;

        /**
         * The channel ID for the logs.
         */
        logs: string;
    }
}


const GuildConfigSchema = new Schema<GuildConfigEntry>({
    id: {type: String, required: true},
	tracking_enabled: {type: Boolean, required: true, default: true},
    channel: {
        track: {type: String, required: true, default: ""},
        logs: {type: String, required: true, default: ""},
    }
})

/**
 * The MongoDB model for the configutation of the guilds the bot is in.
 */
export const GuildConfig = model("guild", GuildConfigSchema)

