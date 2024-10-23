import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droid } from "../../functions/osu!droid/functions"
import { embed } from "../../functions/messages/embeds"
import { unlinkSync } from "fs"

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("card")
		.setDescription("osu!droid - (BETA) Genera una imagen con los datos de un perfil de osu!droid")
		.addIntegerOption(opt => opt
			.setName("uid")
			.setDescription("UID del usuario")
			.setRequired(true)
		),

	async execute(client, interaction) {
		await interaction.deferReply()
		const user = await droid.user({ uid: interaction.options.getInteger("uid", true), type: "with_top_plays" })
		if (!user) return await interaction.editReply({
			embeds: [await embed.interaction("error", `El usuario no existe.`, interaction)]
		})

		const embed_wait = new EmbedBuilder()
		.setColor(0xdedede)
		.setDescription(`> <:graycheck:903741976061567027> <:droid_simple:1021473577951821824>  **osu!droid・**Creando card para  :flag_${user.country.toLowerCase()}:  **${user.username}...**`)
		

		await interaction.editReply({ embeds: [embed_wait] })

		const embed_card = await droid.embed.card(user)
		const attachment = new AttachmentBuilder(`./${user.id}-${user.username}.png`, { name: `${user.id}-${user.username}.png` });

		await interaction.editReply({ embeds: [embed_card], files: [attachment] })
		unlinkSync(`./${user.id}-${user.username}.png`)
	},
}
