import { TrackingConfig, ColorConfig, AvatarCycleConfig } from "@structures/config";
import { BeatmapStatusEmojis, ScoreRankEmojis } from "@structures/emojis";
import { DroidServer, DroidServerData } from "@structures/osu!droid";
import path from "path";

/**
 * Global configuration of the bot.
 */
export abstract class Config {

    /**
     * Whether the bot is in debug mode or not.
     */
    static readonly debug = false;

    /**
     * The developers of the bot.
     */
    static readonly developers = ["596481414426525696"];

    /**
     * The ID the bot's test guild.
     */
    static readonly test_guild = "976981749848473610";

    /**
     * Options for the osu!droid score tracking system.
     */
    static tracking: TrackingConfig = {
        enabled: true,
        interval: 1000 * 15
    }

    /** 
     * Configuration for the avatar cycle.
     */
    static avatar_cycle: AvatarCycleConfig = {
        enabled: true,
        interval: 3600 * 1000,
        path: path.join(__dirname, "../../assets/avatars/")
    }

    /**
     * Colors for the bot's output.
     */
    static colors: ColorConfig = {
        connection: "#7ED9C8",
        debug: "#F2BBC9",
        default: "#A9D979",
        error: "#FF0000",
        tracking: "#AD82D9",
    }

    /**
     * Emojis for all of the possible score ranks.
     */
    static rank_emojis: ScoreRankEmojis = {
        A: "1438709816985124895",
        B: "1438709380160946289",
        C: "1438709844885635102",
        D: "1438709889055719587",
        S: "1438709951412437044",
        SH: "1438709923063140435",
        X: "1438710004180848734",
        XH: "1438709421629898752"
    }

    /**
     * Emojis for all of the possible beatmap ranking statuses.
     */
    static status_emojis: BeatmapStatusEmojis = {
        "0": "1369498405440589895",
        "1": "1369494433288032426",
        "2": "1369496051467288656",
        "3": "1369496051467288656",
        "4": "1369494384613130320",
    }

    /**
     * BPM emoji ID.
     */
    static bpm_emoji = "1417866532251500674";

    /**
     * Length emoji ID.
     */
    static length_emoji = "1417866529579466913";

    /**
     * The data of the supported osu!droid servers.
     */
    static servers: Record<DroidServer, DroidServerData> = {
        ibancho:  {
            name: "osu!droid",
            codename: "ibancho",
            iconURL: "https://cdn.discordapp.com/icons/316545691545501706/a_2e882927641c2b4bb15e514d4e2829c7.webp"
        },
        rx: {
            name: "osudroid!rx",
            codename: "rx",
            iconURL: "https://cdn.discordapp.com/icons/1095653998389907468/a_82bf78e259e9cb4ba4d4ca355e28e0df.webp"
        }
    }

}