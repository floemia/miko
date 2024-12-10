import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droid, NewDroidResponse } from "../../functions/osu!droid/functions"
import { embed } from "../../functions/messages/embeds"
import { unlinkSync } from "fs"
import DroidUserBindModel from "../../schemas/osudroid-userbind"

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
		let request: NewDroidResponse | undefined

		if (!id) {
			if (username) {
				request = await droid.request_newdroid({ username: username })
				id = await droid.get_uid(request) || null
			} else if (discord_user) {
				id = (await DroidUserBindModel.findOne({ discord_id: discord_user.id }))?.uid || null
			} else {
				id = (await DroidUserBindModel.findOne({ discord_id: interaction.user.id }))?.uid || null
			}
		}
		if (!id) return await interaction.editReply({
			embeds: [embed.response({
				type: "error",
				description: spanish ? `No tienes una cuenta vinculada por \`/userbind\`. Vincula una o especifica un parámetro.` :
					"You don't have a linked account through \`/userbind\`. Bind one or pass at least one parameter.",
				interaction: interaction
			})]
		})

		const data = await droid.request(id)
		if (!data) return await interaction.editReply({
			embeds: [embed.response({type: "error", description: spanish ?  `El usuario no existe.` : "That user doesn't exist.", interaction: interaction})]
		})
		const user = (await droid.user({ uid: id, response: data }))!
		const scores = (await droid.scores({ uid: id, type: "top", response: data }))!
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
