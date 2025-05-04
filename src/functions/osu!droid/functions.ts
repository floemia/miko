import { embed } from "./embeds"
import { DroidUser } from "./types"
import { average_color, num_formatted } from "../utils"
import { tracking } from "./tracking"
import { droid as droidModule, DroidUserParameters } from "osu-droid-scraping"
import { card } from "osu-droid-card"
import DroidUserBindModel from "../../schemas/DroidUserBindSchema"
import DroidRXUserBindModel from "../../schemas/DroidRXUserBindSchema"
import { DroidBanchoUser, DroidRXUser, miko } from "miko-modules"
import { ChatInputCommandInteraction } from "discord.js"
import en from "../../locales/en"
import es from "../../locales/es"
import { BeatmapDifficulty, ModCustomSpeed, ModDifficultyAdjust, ModDoubleTime, ModHalfTime, ModMap, ModNightCore } from "@rian8337/osu-base"
import DiscordUserDefaultServerModel from "../../schemas/DiscordUserDefaultServerSchema"
const languages = { en, es };

const user = async (params: DroidUserParameters): Promise<DroidUser | { error: string }> => {
	const data = await droidModule.user(params)
	if ("error" in data) return data
	const color = await average_color(data.avatar_url)
	const user: DroidUser = { ...data, color: color.hex }
	return user
}

const get_droid_user = async (interaction: ChatInputCommandInteraction, server?: string) => {
	let ibancho = ( server == "ibancho")
	let spanish = ["es-ES", "es-419"].includes(interaction.locale)
	let response = spanish ? languages.es : languages.en
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
		if (!user_db) throw new Error(response.error.no_linked)
		uid = user_db.uid
	} else if (!uid && !username && discord_user) {
		if (!server) {
			let server_db = await DiscordUserDefaultServerModel.findOne({ discord_id: discord_user.id })
			if (server_db) ibancho = (server_db.server == "ibancho")
			else ibancho = true
		}
		let db = ibancho ? DroidUserBindModel : DroidRXUserBindModel
		let user_db = await db.findOne({ discord_id: discord_user.id })
		if (!user_db) throw new Error(response.error.mention_no_linked(discord_user.id))
		uid = user_db.uid
	}

	if (uid || username) {
		if (ibancho) return await DroidBanchoUser.get({ uid: uid, username: username })
		else return await DroidRXUser.get({ uid: uid, username: username })
	}
	else throw new Error(response.error.no_params)
}

const request = droidModule.request
export const droid = { user, embed, tracking, request, card, get_droid_user }

