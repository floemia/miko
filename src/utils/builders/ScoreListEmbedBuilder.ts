import { DroidRXScore, DroidScore, DroidUser } from "@floemia/osu-droid-utils";
import { ColorHelper, DroidHelper, EmojiHelper } from "@utils/helpers";
import { EmbedBuilder } from "discord.js";
import { Config } from "@core/Config";
import { DroidServerData } from "@structures/osu!droid";

/**
 * The score list's type.
 */
export type ScoreListType = "top" | "recent";

/**
 * Utility class for creating an `EmbedBuilder` containing a list of scores.
 */
export class ScoreListEmbedBuilder extends EmbedBuilder {
    /**
     * The scores to be included in the list.
     */
    private scores: DroidScore[] = [];

    /**
     * The number of elements per page.
     */
    private elements_per_page: number = 5;

    /**
     * The index of the current page.
     */
    private index: number = 0;

    /**
     * The type of the score list.
     */
    private type: ScoreListType = "top";

    /**
     * The server where the scores are set.
     */
    private server: DroidServerData = Config.servers.ibancho;


    /**
     * Sets the type for the score list.
     * @param type The `ScoreListType` to set.
     * @returns The updated `ScoreListEmbedBuilder` instance.
     */
    setType(type: ScoreListType): ScoreListEmbedBuilder {
        this.type = type;
        this.setTitle(this.type == "top" ? "**Top 50 scores**" : "**Recent 50 scores**");
        return this;
    }

    /**
     * Sets the scores for the score list.
     * @param scores The `DroidScore[]` to set.
     * @returns The updated `ScoreListEmbedBuilder` instance.
     */
    setScores(scores: DroidScore[]): ScoreListEmbedBuilder {
        this.scores = scores;
        if (scores instanceof DroidRXScore) this.server = Config.servers.rx;
        this.setFooter({ text: this.server.name, iconURL: this.server.iconURL });
        return this.setTimestamp();
    }

    /**
     * Slices the score list for pagination.
     * @returns The sliced `DroidScore[]` for the current page.
     */
    private sliceScores(): DroidScore[] {
        return this.scores.slice(this.index * 5, this.index * 5 + this.elements_per_page);
    }

    /**
     * Sets the player to display in the author field of the embed.
     * @param player The `DroidUser` to set as the player.
     * @returns The updated `ScoreListEmbedBuilder` instance.
     */
    async setPlayer(player: DroidUser): Promise<ScoreListEmbedBuilder> {
        await DroidHelper.getAvatarURL(player);
        let color = await ColorHelper.getAverageColor(player.avatar_url)
        return this
            .setAuthor({ name: DroidHelper.userToString(player), iconURL: player.avatar_url, url: player.url })
            .setColor(color);
    }

    /**
     * Goes to a specific page.
     * @param index The index to set the page to.
     * @returns The updated `ScoreListEmbedBuilder` instance.
     */
    setPage(index: number): ScoreListEmbedBuilder {
        this.index = index;
        const score_page = this.sliceScores();
        this.setFields(score_page.map((score, i) => {
            const title = score.filename;
            const total_score = score.total_score.toLocaleString("en-US", { compactDisplay: "short" });
            const pp = (score.pp || 0).toLocaleString("en-US", { maximumFractionDigits: 2 }) + (this.server.name == "ibancho" ? "dpp" : "pp")
            const mods = score.mods.toString();
            let time_value = Math.floor(score.played_at.valueOf() / 1000);
            const timestamp = `<t:${time_value}:R>`;
            const combo = `${score.max_combo.toLocaleString("en-US")}x`;
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