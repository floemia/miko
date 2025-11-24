import { DroidUser, DroidBanchoUser, DroidRXUser, BeatmapCalculatedAttributes, DroidScore, AttributesCalculator } from "@floemia/osu-droid-utils";
import { BeatmapDifficulty, MapInfo, ModCustomSpeed, Modes, ModMap, ModNightCore, ModRateAdjust } from "@rian8337/osu-base";
import { DroidServer } from "@structures/osu!droid";
import { DatabaseManager } from "@utils/managers";
import { CacheManager } from "@utils/managers/CacheManager";
import { ChatInputCommandInteraction, User } from "discord.js";
import { InteractionHelper } from "./InteractionHelper";
import { DroidCard } from "@floemia/osu-droid-card";

/**
 * Printable attributes of a beatmap.
 * 
 * `AR: 7.98▼, OD: 10.52▲ ...`
 */
export interface PrintableAttributes {
    /**
     * The map's AR.
     */
    ar: string;

    /**
     * The map's OD.
     */
    od: string;

    /**
     * The map's CS.
     */
    cs: string;

    /**
     * The map's HP.
     */
    hp: string;

    /**
     * The map's BPM.
     */
    bpm: string;
}
/**
 * Utility class for osu!droid related functions.
 */
export abstract class DroidHelper {

    /**
     * Main method for obtaining a user from an input.
     * @param input The Discord `User`, a `ChatInputCommandInteraction`, a `string` or a `number` representing the UID or the username.
     * @param server The osu!droid server to get the user from.
     * @returns A `DroidBanchoUser` or a `DroidRXUser` instance.
     */
    static async getUser(input: User | ChatInputCommandInteraction | string | number, server: "ibancho" | "rx" = "ibancho"): Promise<DroidBanchoUser | DroidRXUser | undefined> {
        if (input instanceof User) return await DatabaseManager.getLinkedUser(input, server);

        if (input instanceof ChatInputCommandInteraction) {
            const t = InteractionHelper.getLocale(input);
            const mentionUser = input.options.getUser("user");
            let inputServer = input.options.getString("server") as DroidServer | undefined;
            // check by mentioned user
            if (mentionUser) {
                if (!inputServer) inputServer = await DroidHelper.getDefaultServer(mentionUser);
                const user = await DroidHelper.getUser(mentionUser, inputServer);
                if (!user) await InteractionHelper.replyError(input, t.general.mention_no_link);

                return user;
            }

            // check by passed uid or username
            if (!inputServer) inputServer = await DroidHelper.getDefaultServer(input.user);
            const uid = input.options.getInteger("uid") || undefined;
            const username = input.options.getString("username") || undefined;
            if (uid || username) {
                const user = await DroidHelper.getUser((uid ?? username)!, inputServer);
                if (!user) await InteractionHelper.replyError(input, t.general.user_dne);

                return user;
            }

            // check by interaction author
            if (!inputServer) inputServer = await DroidHelper.getDefaultServer(input.user);
            const user = await DroidHelper.getUser(input.user, inputServer);
            if (!user) await InteractionHelper.replyError(input, t.general.no_link);

            return user;
        }
        // input is string or number
        const uid = typeof input == "number" ? input : undefined;
        const username = typeof input == "string" ? input : undefined;
        if (!uid && !username) return;
        const ServerClass = server == "ibancho" ? DroidBanchoUser : DroidRXUser;
        return await ServerClass.get({ uid: uid!, username: username! });
    }

    /**
     * Gets the default osu!droid server of a user.
     * @param user The Discord `User`.
     * @returns `"ibancho"` or `"rx"`
     */
    static async getDefaultServer(user: User): Promise<DroidServer> {
        let server = CacheManager.getDefaultServer(user) ?? await DatabaseManager.getDefaultServer(user) ?? "ibancho";
        return server;
    }

    /**
     * Sets the default osu!droid server of a user.
     * @param user The Discord `User`.
     * @param server `"ibancho"` or `"rx"`.
     */
    static async setDefaultServer(user: User, server: DroidServer): Promise<void> {
        await DatabaseManager.setDefaultServer(user, server);
    }


    /**
     * Creates a formatted string representing a `DroidUser`.
     * @param user The `DroidUser` to parse.
     * @param type The type of string to create. Can be `"flag"` or `"rank"`.
     * @returns The formatted string.
     */
    static userToString(user: DroidUser, type: "flag" | "rank" = "rank"): string {
        const name = user.username;
        let str = ""
        if (type == "flag") {
            if (user.country) str += `:flag_${user.country.toLowerCase()}: `;
            str += `**${name}**`;
            return str;
        }
        let pp = user.statistics.pp.toLocaleString("en-US", { maximumFractionDigits: 2 });
        if (user instanceof DroidBanchoUser) pp += "dpp";
        else pp += "pp";
        const rank = user.statistics.rank;
        const g_rank = rank.global.toLocaleString("en-US");
        const c_rank = rank.country ? `${user.country!.toUpperCase()}#` + rank.country.toLocaleString("en-US") : "";

        str += `${name}・${pp} (#${g_rank}`;
        if (c_rank) str += ` ${c_rank}`;
        str += `)`;
        return str;



    }

    /**
     * Validates and returns the avatar URL of a `DroidUser`.
     * @param user The `DroidUser` to get the avatar URL from.
     * @returns 
     */
    static async getAvatarURL(user: DroidUser): Promise<string> {
        try {
            const res = await fetch(user.avatar_url, { method: "HEAD" });
            if (!res.ok) return "https://osu.ppy.sh/images/layout/avatar-guest@2x.png";
            if (res.headers.get("content-type")?.includes("image")) return user.avatar_url;
            return "https://osu.ppy.sh/images/layout/avatar-guest@2x.png";
        } catch {
            return "https://osu.ppy.sh/images/layout/avatar-guest@2x.png";
        }

    }

    /**
     * Generates the card of an osu!droid user.
     * @param user The `DroidBanchoUser` or `DroidRXUser` to generate the card of.
     * @returns The card of the user.
     */
    static async getCard(user: DroidBanchoUser | DroidRXUser): Promise<Buffer<ArrayBufferLike>> {
        const inCache = CacheManager.getDroidCard(user);
        if (inCache) return inCache;
        const buffer = await DroidCard.create(user);
        CacheManager.setDroidCard(user, buffer);
        return buffer;
    }

    /**
     * Calculates the length of a beatmap
     * @param beatmap The `MapInfo` of the beatmap.
     * @param mods The `ModMap` to calculate the map length with.
     * @returns The map length in `mm:ss` format.
     */
    static getMapLength(beatmap: MapInfo<true>, mods?: ModMap): string {
        let map_length = beatmap.totalLength; // in seconds
        if (mods) {
            let speed = 1;
            for (const mod of mods.values()) {
                if (mod instanceof ModRateAdjust) speed *= mod.trackRateMultiplier.value;
            }
            map_length /= speed;
        }
        const minutes = Math.floor(map_length / 60);
        const seconds = Math.floor(map_length % 60);
        return `${minutes.toLocaleString("en-US", { minimumIntegerDigits: 2 })}:${seconds.toLocaleString("en-US", { minimumIntegerDigits: 2 })}`;
    }

    /**
     * Gets a clean attribute string.
     * @param val1 Value after mods.
     * @param val2 Value before mods.
     */
    private static cleanAttr(val1: number, val2: number): string {
        let str = `${val1.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
        if (val1 != val2) str += val1 < val2 ? "▼" : "▲";
        return str;
    }

    static getPrintableAttributes(score: DroidScore): PrintableAttributes | undefined {
        if (!score.beatmap) return undefined
        const att = AttributesCalculator.calculate(score, score.beatmap, score.mods, Modes.droid)!;
        const og = score.beatmap.beatmap!.difficulty;
        return {
            ar: this.cleanAttr(att.ar, og.ar),
            od: this.cleanAttr(att.od, og.od),
            cs: this.cleanAttr(att.cs, og.cs),
            hp: this.cleanAttr(att.hp, og.hp),
            bpm: this.cleanAttr(att.bpm, score.beatmap.bpm)
        }
    }
}