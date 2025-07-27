import { ColorHelper, DroidHelper } from "@utils/helpers";
import { CacheManager } from "@utils/managers";
import { APIEmbed, EmbedBuilder } from "discord.js";
import { client } from "@root";
import { DroidBanchoScore, DroidScore, DroidUser } from "@floemia/osu-droid-utils";

export class ScoreEmbedBuilder extends EmbedBuilder {
    private player: DroidUser | undefined;

    public setPlayer(player: DroidUser) {
        this.player = player;
        return this.setAuthor({ name: DroidHelper.userToString(player), iconURL: player.avatar_url, url: player.url })
    }

    async setScore(score: DroidScore) {
        const inCache = CacheManager.getScoreEmbed(score);
        if (inCache) return this.replaceEmbed(inCache);
        const description = await DroidHelper.createDescription(score);
        const iBancho = score instanceof DroidBanchoScore;
        const server = iBancho ? client.config.servers.ibancho : client.config.servers.rx;
        const color = score.beatmap ? (await ColorHelper.getAverageColor(`https://assets.ppy.sh/beatmaps/${score.beatmap.beatmapSetId}/covers/cover.jpg`)).hex : "#FFFFFF";
        this.setDescription(description)
            .setFooter({ text: `Server: ${server.name}`, iconURL: server.iconURL })
            .setTimestamp(score.played_at)
            .setColor(Number(`0x${color.slice(1)}`))
            .setTitle(await DroidHelper.createTitle(score));
        if (score.beatmap) {
            this.setURL(`https://osu.ppy.sh/beatmapsets/${score.beatmap.beatmapSetId}#osu/${score.beatmap.beatmapId}`);
            this.setImage(`https://assets.ppy.sh/beatmaps/${score.beatmap.beatmapSetId}/covers/cover.jpg`);
        } else {
            this.setImage(null)
            this.setURL(null);
        };
        CacheManager.setScoreEmbed(score, this);
        return this;
    }

    private replaceEmbed(data: APIEmbed) {
        this.setTitle(data.title ?? null);
        this.setDescription(data.description!);
        this.setURL(data.url ?? null);
        this.setColor(data.color!);
        this.setImage(data.image?.url ?? null);
        this.setTimestamp(new Date(data.timestamp!));
        this.setPlayer(this.player!);
        this.setFooter(data.footer ? { text: data.footer.text, iconURL: data.footer.icon_url } : null);
        return this;
    }
}