import { DroidBanchoScore, DroidScore, DroidUser } from "@floemia/osu-droid-utils";
import { MapInfo, Modes } from "@rian8337/osu-base";
import { ColorHelper, DroidHelper, EmojiHelper } from "@utils/helpers";
import { APIEmbed, EmbedBuilder } from "discord.js";
import { client } from "@root";
import { CacheManager } from "@utils/managers/CacheManager";
import { Config } from "@core/Config";

export class ScoreEmbedBuilder extends EmbedBuilder {


    private update(data: APIEmbed): ScoreEmbedBuilder {
        this.setTitle(data.title ?? null);
        this.setDescription(data.description!);
        this.setURL(data.url ?? null);
        this.setColor(data.color ?? null);
        this.setImage(data.image?.url ?? null);
        this.setTimestamp(new Date(data.timestamp!));
        this.setFooter({ text: data.footer?.text! ?? null, iconURL: data.footer?.icon_url! ?? null });
        return this;
    }
    /**
     * Updates the author field of the embed with the user's details.
     * @param user The new `DroidUser`.
     * @returns The updated instance of `ScoreEmbedBuilder`.
     */

    setUser(user: DroidUser): ScoreEmbedBuilder {
        return this.setAuthor({ name: DroidHelper.userToString(user, "rank"), iconURL: user.avatar_url, url: user.url });
    }

    /**
     * Updates the fields of the embed with the score's details.
     * @param score The new `DroidScore`.
     * @returns The updated instance of `ScoreEmbedBuilder`.
     */
    async setScore(score: DroidScore): Promise<ScoreEmbedBuilder> {
        const cached = CacheManager.getScoreEmbed(score);
        if (cached) return this.update(cached);

        const isBancho = score instanceof DroidBanchoScore;
        const rank = EmojiHelper.getRankEmoji(score.rank);

        const acc = score.accuracy;
        const acc_percent = this.formatNum(acc.value() * 100) + "%";

        const statistics = `[${acc.n300}/${acc.n100}/${acc.n50}/${acc.nmiss}]`;
        const total_score = this.formatNum(score.total_score);

        let pp_string = "";
        if (score.pp) {
            const ppValue = this.formatNum(score.pp);
            pp_string = `${ppValue}${isBancho ? "dpp" : "pp"}`;
        }

        let mods = score.mods.toString();
        const modsString = mods ? `+${mods}` : "";

        let title = `**${score.filename} ${modsString}**`;
        let combo = `${this.formatNum(score.max_combo)}x`;
        let diff_string = "";

        score.beatmap = await MapInfo.getInformation(score.hash) || undefined;
        if (score.beatmap) {
            const { beatmap } = score;
            const coverURL = `https://assets.ppy.sh/beatmaps/${beatmap.beatmapSetId}/covers/cover.jpg`;
            const color = await ColorHelper.getAverageColor(coverURL);
            this.setColor(color)
                .setImage(coverURL)
                .setURL(`https://osu.ppy.sh/beatmapsets/${beatmap.beatmapSetId}#osu/${beatmap.beatmapId}`);

            const { ar, od, cs, hp, bpm } = DroidHelper.getPrintableAttributes(score)!;

            const map_length = DroidHelper.getMapLength(beatmap, score.mods);
            const osu_perf = await score.calculate(Modes.osu);
            const stars = this.formatNum(osu_perf?.difficultyAttributes.starRating) + "⭐";

            combo += `/${this.formatNum(beatmap.maxCombo!)}x`;
            diff_string = `\n\`${map_length}\`**・**\`AR ${ar} OD ${od} HP ${hp} CS ${cs} BPM ${bpm}\``;
            title = `${EmojiHelper.getStatusEmoji(beatmap.approved)} ` +
                `**${beatmap.artist} - ${beatmap.title} [${beatmap.version}] (${stars}) ${modsString}**`;

            if (isBancho) {
                if (!score.pp) {
                    const droid_perf = await score.calculate(Modes.droid);
                    pp_string = `${this.formatNum(droid_perf?.total)}dpp`;
                };
                const pp_osu = this.formatNum(osu_perf?.total);
                pp_string += `・${pp_osu}pp⠀${acc_percent}`;

                if (!score.isFC()) {
                    const score_fc = DroidScore.toFC(score);
                    const droid_fc = await score_fc.calculate(Modes.droid);
                    const osu_fc = await score_fc.calculate(Modes.osu);

                    const dpp_fc = this.formatNum(droid_fc?.total);
                    const pp_fc = this.formatNum(osu_fc?.total);
                    const fc_acc = this.formatNum(osu_fc?.computedAccuracy.value()! * 100) + "%";

                    pp_string += `**\n_(${dpp_fc}dpp・${pp_fc}pp ➜ FC ${fc_acc})_`;
                } else pp_string += "**";
            } else pp_string += `⠀${acc_percent}**`;
        } else {
            pp_string += `⠀${acc_percent}`;
        }

        const description =
            `>>> ${rank}⠀**${pp_string}\n` +
            `${total_score}⠀${statistics}⠀${combo}${diff_string}`;

        const server = isBancho ? Config.servers.ibancho : Config.servers.rx;
        this.setFooter({
            iconURL: server.iconURL,
            text: server.name
        })
            .setTimestamp(score.played_at)
            .setTitle(title)
            .setDescription(description);
        CacheManager.setScoreEmbed(score, this);
        return this;
    }

    /**
     * Utility for numeric formatting.
     */
    private formatNum(value: any, digits = 2): string {
        return Number(value).toLocaleString("en-US", {
            maximumFractionDigits: digits,
        });
    }


}