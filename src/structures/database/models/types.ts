export type GuildAndOwner = {
	id: string,
	owner_id: string
}

export type DroidTrackingUser = {
	username: string,
	uid: number,
	guilds: GuildAndOwner[],
	timestamp: Date,
}


export type OsuTrackingUser = {
	username: string,
    uid: number,
	country: string,
    discord_id: string,
    guild: string,
	mode: string,
	mode_int: number,
	last_score_id: number
}

export type DroidUserBind = {
    username: string,
    uid: number,
	avatar_url: string,
    discord_id: string,
}

export type DroidDefaultServer = {
	discord_id: string,
	server: "ibancho" | "rx",
}

export type GuildConfigModel = {
    id: string,
	tracking_enabled: boolean,
    channel: {
        track: string,
        logs: string,
    }
}