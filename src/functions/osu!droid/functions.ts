import { embed } from "./embeds"
import { DroidUser } from "./types"
import { average_color } from "../utils"
import { tracking } from "./tracking"
import { droid as droidModule, DroidUserParameters } from "osu-droid-scraping"
import { card } from "osu-droid-card"
import DroidUserBindModel from "../../schemas/DroidUserBindSchema"
import { miko, NewDroidResponse } from "miko-modules"
import { ChatInputCommandInteraction } from "discord.js"
import en from "../../locales/en"
import es from "../../locales/es"
const languages = { en, es };

const user = async (params: DroidUserParameters): Promise<DroidUser | { error: string }> => {
	const data = await droidModule.user(params)
	if ("error" in data) return data
	const color = await average_color(data.avatar_url)
	const user: DroidUser = { ...data, color: color.hex }
	return user
}

const get_response = async (interaction: ChatInputCommandInteraction) => {
	let spanish = ["es-ES", "es-419"].includes(interaction.locale)
	let response = spanish ? languages.es : languages.en
	let uid = interaction.options.getInteger("uid") || undefined
	let username = interaction.options.getString("username") || undefined
	let discord_user = interaction.options.getUser("user") || undefined

	if (!uid && !username && !discord_user) {
		let db = await DroidUserBindModel.findOne({ discord_id: interaction.user.id })
		if (!db) return { error: response.error.no_linked }
		uid = db.uid
	} else if (!uid && !username && discord_user) {
		let db = await DroidUserBindModel.findOne({ discord_id: discord_user.id })
		if (!db) return { error: response.error.mention_no_linked(discord_user.id) }
		uid = db.uid
	}

	if (uid || username) return await miko.request({ uid: uid, username: username })
	else return { error: response.error.no_params }
}

const request = droidModule.request
export const droid = { user, embed, tracking, request, card, get_response }
