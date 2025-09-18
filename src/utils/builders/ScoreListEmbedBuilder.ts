import { DroidBanchoScore, DroidRXScore, DroidScore, DroidUser } from "@floemia/osu-droid-utils";
import { ColorHelper, DroidHelper, EmojiHelper, NumberHelper } from "@utils/helpers";
import { EmbedBuilder } from "discord.js";
import { client } from "@root";
import { DroidServerData } from "@core*";

export enum ScoreListType {
    RECENT,
    TOP
}

export class ScoreListEmbedBuilder extends EmbedBuilder {
    private server: DroidServerData = client.config.servers.ibancho;
    private scores: DroidScore[] = [];
    private elements_per_page: number = 5;
    private index: number = 0;
    private type: ScoreListType = ScoreListType.RECENT;

    setType(type: ScoreListType) {
        this.type = type;
        this.setTitle(type == ScoreListType.TOP ? "**Top 50 scores**" : "**Recent 50 scores**");
        return this;
    }

    setScores(scores: DroidScore[]) {
        this.scores = scores;
        if (scores instanceof DroidRXScore) this.server = client.config.servers.rx;
        this.setFooter({ text: this.server.name, iconURL: this.server.iconURL });
        return this.setTimestamp();
    }

    private sliceScores() {
        return this.scores.slice(this.index*5, this.index*5 + this.elements_per_page);
    }

    async setPlayer(player: DroidUser) {
        await DroidHelper.getAvatarURL(player);
        let color = await ColorHelper.getAverageColor(player.avatar_url)
        return this
            .setAuthor({ name: DroidHelper.userToString(player), iconURL: player.avatar_url, url: player.url })
            .setColor(Number(`0x${color.slice(1)}`));
    }

    setPage(index: number) {
        this.index = index;
        const score_page = this.sliceScores();
        this.setFields(score_page.map((score, i) => {
            const title = score.filename;
            const total_score = NumberHelper.toShort(score.total_score);
            const pp = NumberHelper.to2Decimal(score.pp || 0) + (this.server.name == "ibancho" ? "dpp" : "pp")
            const mods = score.mods.toString();
            let time_value = Math.floor(score.played_at.valueOf() / 1000);
            const timestamp = `<t:${time_value}:R>`;
            const combo = `${NumberHelper.toInt(score.max_combo)}x`;
            const accuracy = `${(score.accuracy.value() * 100).toFixed(2)}%`;
            const rank = EmojiHelper.getRankEmoji(score.rank);
            const c = score.accuracy;
            const statistics = `[${c.n300}/${c.n100}/${c.n50}/${c.nmiss}]`;
            return {
                name: `**#${this.index * this.elements_per_page + i + 1}・${title}${mods ? ` +${mods}` : ""}**`,
                value: `${rank?.toString()}**・${score.pp ? `${pp}・` : ""}${accuracy}・${combo}・**\`${total_score}\`**・${statistics}・**${timestamp}`,
            }
        }))
        return this;
    }

}