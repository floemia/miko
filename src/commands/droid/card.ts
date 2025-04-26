import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droid } from "../../functions/osu!droid/functions"
import { embed } from "../../functions/messages/embeds"
import { unlinkSync } from "fs"
import DroidUserBindModel from "../../schemas/DroidUserBindSchema"
import { miko } from "miko-modules"
import { droid as droidModule } from "osu-droid-scraping"
import { DroidScore } from "../../functions/osu!droid/types"

import en from "../../locales/en"
import es from "../../locales/es"
const languages = { en, es };

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("card")
		.setDescription("osu!droid - (BETA) Generates a card with an osu!droid profile details.")
		.setDescriptionLocalization("es-ES", "osu!droid - (BETA) Genera una tarjeta con los datos de un perfil de osu!droid.")
		.addIntegerOption(opt => opt
			.setName("uid")
			.setDescription("UID of the osu!droid profile.").setDescriptionLocalization("es-ES", "UID del perfil de osu!droid.")
		)
		.addStringOption(opt => opt
			.setName("username")
			.setDescription("Username of the osu!droid profile.").setDescriptionLocalization("es-ES", "UID del perfil de osu!droid.")
		)
		.addUserOption(opt => opt
			.setName("user")
			.setDescription("Discord user bound to the osu!droid profile.").setDescriptionLocalization("es-ES", "Usuario de Discord vinculado al perfil de osu!droid.")
		),

	async execute(client, interaction) {

		const spanish = ["es-ES", "es-419"].includes(interaction.locale)
		let response = spanish ? languages.es : languages.en
		await interaction.deferReply()
		let new_data = await droid.get_response(interaction)
		if ("error" in new_data) return await interaction.editReply({
			embeds: [embed.response({ type: "error", description: response.command.card.error(new_data.error), interaction: interaction })]
		})
		const data: string | { error: string } = await droid.request(new_data.UserId)
		if (typeof(data) != "string" && "error" in data) return await interaction.editReply({
			embeds: [embed.response({ type: "error", description: response.command.card.error(data.error), interaction: interaction })]
		})

		const user = (await droid.user({ uid: new_data.UserId!, response: data }))!
		if ("error" in user) return await interaction.editReply({
			embeds: [embed.response({ type: "error", description: response.command.card.error(user.error), interaction: interaction })]
		})

		let scores: DroidScore[] = []
		const scores_fetch = await droidModule.scores({ uid: new_data.UserId!, type: "top", response: data }) as DroidScore[]
		for (const score of scores_fetch) {
			scores.push({
				...score,
				beatmap: undefined,
				color: "#dedede"
			})
		}

		const embed_wait = new EmbedBuilder()
			.setColor(0xdedede)
			.setDescription(response.command.card.generating(user))

		await interaction.editReply({ embeds: [embed_wait] })

		const embed_card = await droid.embed.card(user, scores)
		const attachment = new AttachmentBuilder(`./${user.id}-${user.username}.png`, { name: `${user.id}-${user.username}.png` });

		await interaction.editReply({ embeds: [embed_card], files: [attachment] })
		unlinkSync(`./${user.id}-${user.username}.png`)
	},
}
