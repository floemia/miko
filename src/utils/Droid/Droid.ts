import { client } from "@root";
import { Misc } from "@utils";
import { ChatInputCommandInteraction } from "discord.js";
import { DroidBanchoScore, DroidBanchoUser, DroidRXUser, DroidScore, DroidScrape, DroidUser } from "miko-modules";
import { en, es } from "@locales";

export abstract class Droid {
	public static async getUserFromInteraction(interaction: ChatInputCommandInteraction): Promise<DroidBanchoUser | DroidRXUser | undefined> {
		const spanish = interaction.locale.includes("es");
		const str = spanish ? es : en;

		let server = interaction.options.getString("server") as "ibancho" | "rx" | undefined;
		let ibancho = !server ? "ibancho" : (server == "ibancho")
		let uid = interaction.options.getInteger("uid") || undefined
		let username = interaction.options.getString("username") || undefined
		let discord_user = interaction.options.getUser("user") || undefined
		if (!uid && !username) {
			const db = await client.db.user.getDroidUser(discord_user ? discord_user.id : interaction.user.id, server);
			if (!db) {
				if (!discord_user) throw new Error(str.general.you_no_link);
				else throw new Error(str.general.mention_no_link);
			}
			uid = db.uid;
		}

		if (ibancho) {
			if (client.config.scraping == true) {
				if (!uid) throw new Error(str.general.api_broken);
				const old_user = await DroidScrape.getUser(uid);
				if (!old_user) return undefined;
				return new DroidBanchoUser(DroidScrape.temp_toNew(old_user), old_user);
			}
			return await DroidBanchoUser.get({ uid: uid, username: username })
		}
		else return await DroidRXUser.get({ uid: uid, username: username })
	}

	public static async createDescription(score: DroidScore): Promise<string> {
		let description = "";
		let diff_string = ""
		let pp_string = "";
		let ur_penalties = "";
		const iBancho = score instanceof DroidBanchoScore;
		if (!score.calculated) await score.calculate();
		let rank_code = score.rank as keyof typeof client.config.emojis.ranks;
		const rank = await client.application!.emojis.fetch(client.config.emojis.ranks[rank_code]).catch(() => rank_code);
		const total_score = Misc.formatInteger(score.total_score);
		let combo = `${Misc.formatInteger(score.combo)}x`;
		const accuracy = `${(score.accuracy * 100).toFixed(2)}%`;
		const c = score.count;
		const statistics = client.config.scraping ?
			`${c.nMiss}❌` :
			`[${c.n300}/${c.n100}/${c.n50}/${c.nMiss}]`;
		if (score.beatmap) {
			await DroidScore.calculateFC(score);
			combo += `/${Misc.formatInteger(score.beatmap.maxCombo!)}x`;
			let { ar, od, hp, cs } = score.difficulty!;
			const bpm = (score.beatmap.bpm * score.getFinalSpeed()).toLocaleString("en-US", { maximumFractionDigits: 2 });
			diff_string = `\n> \`BPM: ${bpm} AR: ${Misc.to2Dec(ar!)} OD: ${Misc.to2Dec(od!)} HP: ${Misc.to2Dec(hp!)} CS: ${Misc.to2Dec(cs!)}\``;
			const dpp = Misc.formatFloat(score.dpp);
			const pp = Misc.formatFloat(score.pp);
			if (dpp) pp_string += `${dpp}dpp | `;
			pp_string += `${pp}pp・${accuracy}`;
			if (score.fc) {
				const fc_dpp = Misc.formatFloat(score.fc?.dpp);
				const fc_pp = Misc.formatFloat(score.fc?.pp);
				const fc_acc = Misc.formatFloat(score.fc?.accuracy * 100);
				pp_string += ` **(${iBancho ? `${fc_dpp}dpp | ` : ""}${fc_pp}pp ➜ FC ${fc_acc}%)`;
			} else pp_string += `**`

			if (iBancho && score.replay) {
				const hit_error = score.replay.calculateHitError();
				ur_penalties += `・**${hit_error?.unstableRate.toFixed(2)} UR`;
				const _3F = score.is3Finger();
				const SC = score.isSliderCheesed();
				const penalties = (_3F || SC)
				if (penalties) {
					ur_penalties += `\n> **Penalties:** `;
					const list_penalties = [];
					if (_3F) list_penalties.push("3F");
					if (SC) list_penalties.push("SC");
					ur_penalties += list_penalties.join(", ");
				}
			}

		}
		if (!pp_string) pp_string = `${accuracy}**`;
		if (!ur_penalties) ur_penalties = `**`;
		description = `> ${rank?.toString()}**・${pp_string}
		> ${total_score}**・**${statistics}**・${combo}${ur_penalties}${diff_string}`

		return description;
	}

	public static getFullUserString(user: DroidUser) {
		let user_string = `${user.username}・`;
		if (user instanceof DroidBanchoUser) user_string += `${Misc.formatFloat(user.stats.dpp || 0)}dpp (#${Misc.formatInteger(user.stats.rank.global)}`;
		if (user instanceof DroidRXUser) user_string += `${Misc.formatFloat(user.stats.pp || 0)}pp (#${Misc.formatInteger(user.stats.rank)}`;
		if (user.country && user instanceof DroidBanchoUser) {
			let rank = Misc.formatInteger((<DroidBanchoUser>user).stats.rank.country);
			user_string += ` ${user.country.toUpperCase()}#${rank})`
		} else user_string += `)`
		return user_string;
	}
}