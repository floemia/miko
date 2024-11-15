import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droid } from "../../functions/osu!droid/functions"
import { embed } from "../../functions/messages/embeds"
import { unlinkSync } from "fs"

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("card")
		.setDescription("osu!droid - (BETA) Generates a card with an osu!droid profile details.")
		.setDescriptionLocalization("es-ES", "osu!droid - (BETA) Genera una tarjeta con los datos de un perfil de osu!droid.")
		.addIntegerOption(opt => opt
			.setName("uid")
			.setDescription("UID of osu!droid profile.").setDescriptionLocalization("es-ES", "UID del perfil de osu!droid.")
			.setRequired(true)
		),

	async execute(client, interaction) {
		
		const spanish = ["es-ES", "es-419"].includes(interaction.locale)
		await interaction.deferReply()
		const user = await droid.user({ uid: interaction.options.getInteger("uid", true), type: "with_top_plays" })
		if (!user) return await interaction.editReply({
			embeds: [embed.response({type: "error", description: spanish ?  `El usuario no existe.` : "That user doesn't exist.", interaction: interaction})]
		})

		const embed_wait = new EmbedBuilder()
		.setColor(0xdedede)
		.setDescription(spanish ?
			`> <:graycheck:903741976061567027> <:droid_simple:1021473577951821824>  **osu!droid・**Creando tarjeta de perfil de  :flag_${user.country.toLowerCase()}:  **${user.username}...**` 
			: `> <:graycheck:903741976061567027> <:droid_simple:1021473577951821824>  **osu!droid・**Creating profile card of  :flag_${user.country.toLowerCase()}:  **${user.username}...**`)
		

		await interaction.editReply({ embeds: [embed_wait] })

		const embed_card = await droid.embed.card(user)
		const attachment = new AttachmentBuilder(`./${user.id}-${user.username}.png`, { name: `${user.id}-${user.username}.png` });

		await interaction.editReply({ embeds: [embed_card], files: [attachment] })
		unlinkSync(`./${user.id}-${user.username}.png`)
	},
}
