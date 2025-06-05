import { client } from "@root";
import { Misc, Droid } from "@utils";
import { EmbedResponseParameters } from "@utils/Embeds";
import { EmbedBuilder } from "discord.js";
import { DroidBanchoScore, DroidBanchoUser, DroidRXScore, DroidRXUser, DroidScore, DroidUser } from "miko-modules";

export abstract class Embeds {
	public static response(params: EmbedResponseParameters): EmbedBuilder {
		if (!params.color) params.color = "White";
		const color = Misc.getHexColor(params.color);
		const embed = new EmbedBuilder()
			.setDescription(`> ${Misc.getCircleEmoji(params.color)}   ${params.description}`)
			.setColor(Number(`0x${color.slice(1)}`))
			.setTimestamp()
			.setFooter({ text: client.user?.displayName!, iconURL: client.user?.displayAvatarURL() })
		if (params.user)
			embed.setAuthor({ name: params.user.displayName, iconURL: params.user.displayAvatarURL() })
		if (params.title)
			embed.setTitle(params.title)
		return embed;
	}

	public static error(params: EmbedResponseParameters): EmbedBuilder {
		params.color = "Red";
		const embed = this.response(params);

		return embed;
	}

	public static async score(params: { user: DroidUser, score: DroidScore }) {
		const user = params.user as DroidBanchoUser | DroidRXUser;
		const score = params.score as DroidBanchoScore | DroidRXScore;
		let status = -1
		const embed = new EmbedBuilder()
		let title = `${score.filename}`;
		const desc = await Droid.createDescription(score);
		let iBancho = user instanceof DroidBanchoUser;
		let server = client.config.servers.ibancho;
		if (!iBancho) server = client.config.servers.rx;
		if (score.beatmap) {
			status = score.beatmap.approved;
			title = `${score.beatmap.artist} - ${score.beatmap.title} [${score.beatmap.version}] [${Misc.formatFloat(score.difficulty?.stars.osu)}⭐]`;
			embed.setURL(`https://osu.ppy.sh/beatmapsets/${score.beatmap.beatmapSetId}#osu/${score.beatmap.beatmapId}`);
			embed.setImage(`https://assets.ppy.sh/beatmaps/${score.beatmap.beatmapSetId}/covers/cover.jpg`);
		}
		const user_string = Droid.getFullUserString(user);
		if (status < 0) status = 0;
		const status_emoji = client.emojis.cache.get(client.config.emojis.status[status.toString() as keyof typeof client.config.emojis.status])
		embed.setAuthor({ name: user_string, iconURL: user.avatar_url, url: user.user_url })
		embed.setTitle(`**${status_emoji?.toString()}  ${title}**`)
		embed.setColor(Number(`0x${score.color.slice(1)}`))
		embed.setDescription(desc)
		embed.setFooter({ text: `Server: ${server.name}`, iconURL: server.iconURL })
		embed.setTimestamp(score.played_date)
		return embed;
	}

	public static async top(user: DroidUser, top: DroidScore[], page: number) {
		const scores = Misc.pagination(top, page, 5);
		let i = (5 * page) + 1;
		const iBancho = user instanceof DroidBanchoUser;
		const server = iBancho ? client.config.servers.ibancho : client.config.servers.rx;
		const user_string = Droid.getFullUserString(user);
		const embed = new EmbedBuilder()
			.setColor(Number(`0x${user.color.slice(1)}`))
			.setAuthor({ name: user_string, iconURL: user.avatar_url, url: user.user_url })
			.setTitle(`**Top 50 Scores**`)
			.setFooter({ text: `Server: ${server.name}`, iconURL: server.iconURL })
			.setTimestamp()
			.setThumbnail(user.avatar_url);
		for (const score of scores) {
			const rank_code = score.rank as keyof typeof client.config.emojis.ranks;
			const rank = client.application!.emojis.fetch(client.config.emojis.ranks[rank_code]);
			const total_score = Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(score.total_score);
			const accuracy = Misc.formatFloat(score.accuracy * 100);
			const c = score.count;
			const statistics = client.config.droid_scraping && iBancho ?
				`${c.nMiss}❌` :
				`[${c.n300}/${c.n100}/${c.n50}/${c.nMiss}]`;
			const pp = Misc.formatFloat(score.dpp || score.pp) + (iBancho ? "dpp" : "pp");
			const combo = `${Misc.formatInteger(score.combo)}x`;
			const mods_string = score.modsString();
			embed.addFields({
				name: `**#${i++}・${score.filename} \`${mods_string}\`**`,
				value: `${rank}**・${pp}・${accuracy}%・${combo}・**\`${total_score}\`**・**${statistics}**・**<t:${(score.played_date.valueOf() / 1000).toFixed(0)}:R>`
			});
		}
		return embed;
	}
}