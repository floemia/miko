import { Document, Schema, model } from "mongoose";
/**
 * A MongoDB document representing a Discord user's linked osu!droid account.
 */
export interface DroidBindEntry extends Document {
    /**
     * The username of the account.
     */
    username: string;

    /**
     * The UID of the account.
     */
    uid: number;

    /**
     * The Discord ID of the owner.
     */
    discord_id: string;
}

const LinkSchema = new Schema<DroidBindEntry>({
    username: { required: true, type: String },
    uid: { required: true, type: Number },
    discord_id: { required: true, type: String }
})

/**
 * The MongoDB model for the linked osu!droid accounts of the iBancho server.
 */
export const BanchoUserLink = model("osu!droid-userbind", LinkSchema)
