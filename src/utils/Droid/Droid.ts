import DroidUserBindModel from "@structures/mongoose/DroidUserBindSchema";
import DroidRXUserBindModel from "@structures/mongoose/DroidRXUserBindSchema";
import DiscordUserDefaultServerModel from "@structures/mongoose/DiscordUserDefaultServerSchema";
import { client } from "@root";
import { Misc } from "@utils";
import { ChatInputCommandInteraction } from "discord.js";
import { DroidBanchoScore, DroidBanchoUser, DroidRXUser, DroidScore, DroidScrape, DroidUser } from "miko-modules";
export abstract class Droid {
	public static async getUserFromInteraction(interaction: ChatInputCommandInteraction): Promise<DroidBanchoUser | DroidRXUser | undefined> {
		let server = interaction.options.getString("server") || undefined;
		let ibancho = !server ? "ibancho" : (server == "ibancho")
		let uid = interaction.options.getInteger("uid") || undefined
		let username = interaction.options.getString("username") || undefined
		let discord_user = interaction.options.getUser("user") || undefined
		if (!uid && !username && !discord_user) {
			if (!server) {
				let server_db = await DiscordUserDefaultServerModel.findOne({ discord_id: interaction.user.id })
				if (server_db) ibancho = (server_db.server == "ibancho")
				else ibancho = true
			}
			let db = ibancho ? DroidUserBindModel : DroidRXUserBindModel
			let user_db = await db.findOne({ discord_id: interaction.user.id })
			if (!user_db) throw new Error("no user")
			uid = user_db.uid
		} else if (!uid && !username && discord_user) {
			if (!server) {
				let server_db = await DiscordUserDefaultServerModel.findOne({ discord_id: discord_user.id })
				if (server_db) ibancho = (server_db.server == "ibancho")
				else ibancho = true
			}
			let db = ibancho ? DroidUserBindModel : DroidRXUserBindModel
			let user_db = await db.findOne({ discord_id: discord_user.id })
			if (!user_db) throw new Error("no linked user")
			uid = user_db.uid
		}

		if (uid || username) {
			if (ibancho) {
				if (process.env.NEW_DROID_HOTFIX == "true") {
					if (!uid) throw new Error("broken")
					const old_user = await DroidScrape.getUser(uid);
					if (!old_user) return undefined;
					return new DroidBanchoUser(DroidScrape.temp_toNew(old_user), old_user);
				}

				return await DroidBanchoUser.get({ uid: uid, username: username })
			}
			else return await DroidRXUser.get({ uid: uid, username: username })
		}
		else throw new Error("no params")
	}

	public static async createDescription(score: DroidScore): Promise<string> {
		let description = "";
		let diff_string = ""
		let pp_string = "";
		let ur_penalties = "";
		const iBancho = score instanceof DroidBanchoScore;
		if (!score.calculated) await score.calculate();
		let rank_code = score.rank as keyof typeof client.config.emojis.ranks;
		const rank = client.application!.emojis.fetch(client.config.emojis.ranks[rank_code]);
		const total_score = Misc.formatInteger(score.total_score);
		let combo = `${Misc.formatInteger(score.combo)}x`;
		const accuracy = `${(score.accuracy * 100).toFixed(2)}%`;
		const c = score.count;
		const statistics = client.config.droid_scraping ?
			`${c.nMiss}❌` :
			`[${c.n300}/${c.n100}/${c.n50}/${c.nMiss}]`;
		if (score.beatmap) {
			await DroidScore.calculateFC(score);
			combo += `/${Misc.formatInteger(score.beatmap.maxCombo!)}x`;
			let { ar, od, hp, cs } = score.difficulty!;
			const bpm = score.beatmap.bpm * score.getFinalSpeed();
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
				const _2H = score.is2Hand();
				const SC = score.isSliderCheesed();
				const penalties = (_3F || _2H || SC)
				if (penalties) {
					ur_penalties += `\n> **Penalties:** `;
					const list_penalties = [];
					if (_3F) list_penalties.push("3F");
					if (SC) list_penalties.push("SC");
					if (_2H) list_penalties.push("2H");
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
		if (user instanceof DroidBanchoUser) user_string += `${Misc.formatFloat(user.stats.dpp)}dpp (#${Misc.formatInteger(user.stats.rank.global)}`;
		if (user instanceof DroidRXUser) user_string += `${Misc.formatFloat(user.stats.pp)}pp (#${Misc.formatInteger(user.stats.rank)}`;
		if (user.country && user instanceof DroidBanchoUser) {
			let rank = Misc.formatInteger((<DroidBanchoUser>user).stats.rank.country);
			user_string +=  ` ${user.country.toUpperCase()}#${rank})`
		} else user_string += `)`
		return user_string;
	}
}