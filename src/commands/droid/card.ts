import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droid } from "../../functions/osu!droid/functions"
import { embed } from "../../functions/messages/embeds"
import { unlinkSync } from "fs"
import DroidUserBindModel from "../../schemas/osudroid-userbind"
import { miko } from "miko-modules"
import { droid as droidModule } from "osu-droid-scraping"
import { DroidScore } from "../../functions/osu!droid/types"

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
		await interaction.deferReply()
		let id = interaction.options.getInteger("uid")
		let username = interaction.options.getString("username")
		let discord_user = interaction.options.getUser("user")

		if (!id && !username && !discord_user) {
			let db_get = await DroidUserBindModel.findOne({ discord_id: interaction.user.id })
			if (!db_get) 
				return await interaction.editReply({
					embeds: [embed.response({
						type: "error",
						description: spanish ? `No tienes una cuenta de osu!droid vinculada. Usa \`/userbind\`.` :
							`You don't have a linked osu!droid account. Use \`/userbind\`.`,
						interaction: interaction
					})]
				})
			else id = db_get.uid
		}
		if (!id && !username && discord_user) {
			let db_get = await DroidUserBindModel.findOne({ discord_id: discord_user.id })
			if (!db_get) return await interaction.editReply({
				embeds: [embed.response({
					type: "error",
					description: spanish ? "El usuario de Discord no tiene una cuenta vinculada por `/userbind`." :
						"The Discord user doesn't have a linked account through `/userbind`.",
					interaction: interaction
				})]
			})
			else id = db_get.uid
		}
		if (username || id) {
			let response = await miko.request({ username: username || undefined, uid: id || undefined })
			if (response.error) return await interaction.editReply({
				embeds: [embed.response({
					type: "error",
					description: spanish ? `El usuario no existe.` :
						`The user does not exist.`,
					interaction: interaction
				})]
			})
		}
		const data = await droid.request(id!)
		if (!data) return await interaction.editReply({
			embeds: [embed.response({ type: "error", description: spanish ? `El usuario no existe.` : "That user doesn't exist.", interaction: interaction })]
		})
		const user = (await droid.user({ uid: id!, response: data }))!
		let scores: DroidScore[] = []
		const scores_fetch = (await droidModule.scores({ uid: id!, type: "top", response: data }))!

		for (const score of scores_fetch) {
			scores.push({
				...score,
				beatmap: undefined,
				color: "#dedede"
			})
		}
		const embed_wait = new EmbedBuilder()
			.setColor(0xdedede)
			.setDescription(spanish ?
				`> <:graycheck:903741976061567027> <:droid_simple:1021473577951821824>  **osu!droid・**Creando tarjeta de perfil de  :flag_${user.country.toLowerCase()}:  **${user.username}...**`
				: `> <:graycheck:903741976061567027> <:droid_simple:1021473577951821824>  **osu!droid・**Creating profile card of  :flag_${user.country.toLowerCase()}:  **${user.username}...**`)


		await interaction.editReply({ embeds: [embed_wait] })

		const embed_card = await droid.embed.card(user, scores)
		const attachment = new AttachmentBuilder(`./${user.id}-${user.username}.png`, { name: `${user.id}-${user.username}.png` });

		await interaction.editReply({ embeds: [embed_card], files: [attachment] })
		unlinkSync(`./${user.id}-${user.username}.png`)
	},
}
