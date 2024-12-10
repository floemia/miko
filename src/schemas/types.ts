export type DroidTrackingUser = {
    username: string,
    uid: number,
    discord_id: string,
    guild: string,
    country: string,
    last_score: number,
    timestamp: number
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

export type GuildConfig = {
    id: string,
    channel: {
        track: string,
        logs: string,
    }
}