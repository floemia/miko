import { MapInfo } from "@rian8337/osu-base"

export type DroidUser = {
    username: string,
    avatar_url: string,
    color: string,
    id: number,
    rank: {
        score: number,
        pp: number,
    },
    country: string,
    score: number,
    pp: number,
    accuracy: number,
    playcount: number,
}

export type DroidScoreScraped = {
    fallback_title: string,
    rank: string,
    score: number,
    embed_color: string | undefined,
    timestamp: number,
    performance: {
        pp: number | undefined,
        dpp: number | undefined,
        stars_dr: number | undefined,
        stars_pc: number | undefined
    },
    performance_fc:{
        pp: number | undefined,
        dpp: number | undefined,
        accuracy: number | undefined
    },
    scraped_pp: number
    accuracy: number,
    mods: string[],
    combo: number
    misses: number,
    hash: string,
    user: DroidUser,
    beatmap: MapInfo | undefined
}

export type DroidMods = {
    str: string,
    speed: number
}

export type ScorePerformanceData = {
    performance: {
        pp: number | undefined,
        dpp: number | undefined,
        stars_dr: number | undefined,
        stars_pc: number | undefined,
    },
    performance_fc: {
        pp: number | undefined,
        dpp: number | undefined,
        accuracy: number | undefined
    }
}