export type DroidTrackingUser = {
    username: string,
    uid: number,
    discord_id: string,
    guild: string,
    country: string,
    last_score: number,
    timestamp: number
}

export type GuildConfig = {
    id: string,
    channel: {
        track: string,
        logs: string,
    }
}