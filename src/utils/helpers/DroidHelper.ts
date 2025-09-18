import { ChatInputCommandInteraction, User } from "discord.js";
import { DroidBanchoScore, DroidBanchoUser, DroidRXUser, DroidScore, DroidUser } from "@floemia/osu-droid-utils";
import { EmojiHelper, InteractionHelper, NumberHelper, TimeHelper } from "@utils/helpers";
import { CacheManager, DBManager } from "@utils/managers";
import { client } from "@root";
import { RankEmojis } from "@core";
import { DroidServer } from "@structures/servers";
import { DroidUserNotFound } from "@structures/errors";

export abstract class DroidHelper {
    static async getUser(input: User | ChatInputCommandInteraction | string | number, server: "ibancho" | "rx" = "ibancho"): Promise<DroidBanchoUser | DroidRXUser | undefined> {
        if (input instanceof User) return await DBManager.getLinkedUser(input, server);

        if (input instanceof ChatInputCommandInteraction) {
            const str = InteractionHelper.getLocaleResponses(input);
            const mentionUser = input.options.getUser("user");
            let inputServer = input.options.getString("server") as DroidServer | undefined;
            // check by mentioned user
            if (mentionUser) {
                if (!inputServer) inputServer = await DroidHelper.getDefaultServer(mentionUser);
                const user = await DroidHelper.getUser(mentionUser, inputServer);
                if (!user) throw new DroidUserNotFound(str.general.mention_no_link);
                return user;
            }

            // check by passed uid or username
            if (!inputServer) inputServer = await DroidHelper.getDefaultServer(input.user);
            const uid = input.options.getInteger("uid") || undefined;
            const username = input.options.getString("username") || undefined;
            if (uid || username) return await DroidHelper.getUser((uid ?? username)!, inputServer);

            // check by interaction author
            if (!inputServer) inputServer = await DroidHelper.getDefaultServer(input.user);
            const db_user = await DroidHelper.getUser(input.user, inputServer);
            if (!db_user) throw new DroidUserNotFound(str.general.you_no_link);
            return db_user;
        }
        // input is string or number
        const uid = typeof input == "number" ? input : undefined;
        const username = typeof input == "string" ? input : undefined;
        const ServerClass = server == "ibancho" ? DroidBanchoUser : DroidRXUser;
        return await ServerClass.get({ uid: uid, username: username });
    }

    static async getDefaultServer(user: User): Promise<DroidServer> {
        let server = CacheManager.getDefaultServer(user) ?? await DBManager.getDefaultServer(user) ?? "ibancho";
        CacheManager.setDefaultServer(user, server);
        return server;
    }

    static async setDefaultServer(user: User, server: DroidServer): Promise<void> {
        CacheManager.setDefaultServer(user, server);
        await DBManager.setDefaultServer(user, server);
    }

    static userToString(user: DroidUser, full: boolean = true): string {
        const rx = user instanceof DroidRXUser;
        if (!full) {
            let country = user.country;
            let country_str = "";
            if (country) country_str = `:flag_${country.toLowerCase()}:`;
            return `${country_str}  ${user.username}`;
        }
        const pp = NumberHelper.to2Decimal(user.statistics.pp || 0);
        const g_rank = NumberHelper.toInt(user.statistics.rank.global);
        let user_string = `${user.username}・${pp}${rx ? "pp" : "dpp"} (#${g_rank}`;
        if (user.statistics.rank.country && user.country) {
            const c_rank = NumberHelper.toInt(user.statistics.rank.country);
            user_string += ` ${user.country.toUpperCase()}#${c_rank})`
        } else user_string += `)`
        return user_string;
    }

    static async createDescription(score: DroidScore): Promise<string> {
        let description = "";
        let diff_string = ""
        let pp_string = "";
        let ur_penalties = "";
        const iBancho = score instanceof DroidBanchoScore;
        if (!score.calculated) await score.calculate();
        let rank_code = score.rank as keyof RankEmojis;
        const rank = EmojiHelper.getRankEmoji(rank_code);
        const total_score = NumberHelper.toInt(score.total_score);
        let combo = `${NumberHelper.toInt(score.max_combo)}x`;
        const accuracy = `${(score.accuracy.value() * 100).toFixed(2)}%`;
        const c = score.accuracy;
        const statistics = `[${c.n300}/${c.n100}/${c.n50}/${c.nmiss}]`;
        if (score.beatmap) {
            const data = (await score.calculate())!;
            combo += `/${NumberHelper.toInt(score.beatmap.maxCombo!)}x`;
            let { ar, od, hp, cs } = data;
            const bpm_emoji = client.config.emojis.stats.bpm;
            const time_emoji = client.config.emojis.stats.time;
            const total_length = TimeHelper.secondsToMapLength(score.beatmap.totalLength / score.getFinalSpeed());
            const bpm = (score.beatmap.bpm * score.getFinalSpeed()).toLocaleString("en-US", { maximumFractionDigits: 2 });
            diff_string = `\n${time_emoji} \`${total_length}\`**・**${bpm_emoji} \`${bpm}\`**・**\`AR ${NumberHelper.toFixedClean(ar!)}  OD ${NumberHelper.toFixedClean(od!)}  HP ${NumberHelper.toFixedClean(hp!)}  CS ${NumberHelper.toFixedClean(cs!)}\``;
            let dpp = "";
            if (score.pp)
                dpp = NumberHelper.to2Decimal(score.pp);
            else
                dpp = NumberHelper.to2Decimal(data.performance.droid.total);

            const pp = NumberHelper.to2Decimal(data.performance.osu.total);
            if (dpp && iBancho) pp_string += `${dpp}dpp・`;
            pp_string += `${pp}pp⠀${accuracy}`;
            if (iBancho) {
                if (!score.isFC()) {
                    const score_fc = DroidScore.toFC(score);
                    const data_fc = await score_fc.calculate();
                    const fc_dpp = NumberHelper.to2Decimal(data_fc!.performance.droid.total);
                    const fc_pp = NumberHelper.to2Decimal(data_fc!.performance.osu.total);
                    const fc_acc = NumberHelper.to2Decimal(score_fc.accuracy.value() * 100);
                    pp_string += `\n**_(${iBancho ? `${fc_dpp}dpp・` : ""}${fc_pp}pp ➜ FC ${fc_acc}%)_`;
                } else pp_string += `**`;

                // if (score.replay) {
                //     const hit_error = score.replay.calculateHitError();
                //     console.log(hit_error);
                //     ur_penalties += `・**${hit_error?.unstableRate.toFixed(2)} UR`;
                //     const _3F = score.is3Finger();
                //     const SC = score.isSliderCheesed();
                //     const penalties = (_3F || SC)
                //     if (penalties) {
                //         ur_penalties += `\n> **Penalties:** `;
                //         const list_penalties = [];
                //         if (_3F) list_penalties.push("3F");
                //         if (SC) list_penalties.push("SC");
                //         ur_penalties += list_penalties.join(", ");
                //     }
                // }
            } else pp_string += `**`
        }
        if (!pp_string) pp_string = `${accuracy}**`;
        description = `>>> ${rank}⠀**${pp_string}\n` +
            `${total_score}⠀${statistics}⠀${combo}${ur_penalties}${diff_string}`

        return description;
    }

    static async createTitle(score: DroidScore) {
        let title = "";
        const data = await score.calculate();
        if (score.beatmap) {
            const stars = data!.difficulty.osu.starRating;
            const status_emoji = EmojiHelper.getStatusEmoji(score.beatmap.approved);
            title = `**${status_emoji?.toString()}  ${score.beatmap.artist} - ${score.beatmap.title} [${score.beatmap.version}] [${NumberHelper.to2Decimal(stars)}⭐]**`;
        } else {
            title = `**${score.filename}**`;
        }

        const mods = "+" + score.mods.toString().replaceAll(",", "") || "NM";
        return title + ` ${mods}`;
    }

    public static async getAvatarURL(user: DroidUser): Promise<string> {
        const response = await fetch(user.avatar_url);
        if (response.status != 200) user.avatar_url = "https://osu.ppy.sh/images/layout/avatar-guest@2x.png";
        return user.avatar_url;
    }
}