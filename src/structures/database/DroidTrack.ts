import { Schema, model } from "mongoose";

/**
 * A MongoDB document representing an entry in the osu!droid score tracking system.
 */
export interface DroidTrackingEntry {
	/**
	 * The username of the tracked account.
	 */
	username: string;

	/**
	 * The UID of the tracked account.
	 */
	uid: number;

	/**
	 * An array containing the guilds the account is tracked in.
	 */
	guilds: string[];

	/**
	 * The `Date` the last score was set in.
	 */
	timestamp: Date;
}

const DroidTrackSchema = new Schema<DroidTrackingEntry> ({
	username: { required: true, type: String },
	uid: { required: true, type: Number },
	guilds: { type: [String], required: true },
	timestamp: { type: Date, required: true },
})

/**
 * The MongoDB model for the `DroidTrackingEntry` interface.
 */
export const DroidTrack = model("ibancho-tracking-user", DroidTrackSchema)

