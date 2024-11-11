import { ButtonInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droid } from "../../functions/osu!droid/functions"
import { embed } from "../../functions/messages/embeds"
import { create_row } from "../../functions/utils"
import { osu } from "../../functions/osu/functions"
import { MapInfo } from "@rian8337/osu-base"
export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("top")
		.setDescription("osu!droid - Get top plays from an osu!droid profile.")
		.setDescriptionLocalization("es-ES", "osu!droid - Obtener top plays de un perfil de osu!droid.")
		.addIntegerOption(opt => opt
			.setName("uid")
			.setDescription("UID of osu!droid profile.").setDescriptionLocalization("es-ES", "UID del perfil de osu!droid.")
			.setRequired(true)
		)
		.addIntegerOption(opt => opt
			.setName("page").setNameLocalization("es-ES", "pagina")
			.setDescription("The n-th page to show (1 <= n <= 10). Defaults to 1.").setDescriptionLocalization("es-ES", "La n-ésima página a mostrar (1 <= n <= 10). 1 por defecto.")
			.setMaxValue(10).setMinValue(1)
		),
	async execute(client, interaction) {
		await interaction.deferReply()
		const spanish = ["es-ES", "es-419"].includes(interaction.locale)
		const user = await droid.user({ uid: interaction.options.getInteger("uid", true), type: "with_top_plays" })
		if (!user || !user.scores || user.scores.length == 0) return await interaction.editReply({
			embeds: [embed.response({
				type: "error",
				description:
					user ?
						spanish ? `El usuario  :flag_${user.country.toLowerCase()}:  **${user.username}**  no ha subido ningún score.` :
							`The user  :flag_${user.country.toLowerCase()}:  **${user.username}**  has no submitted scores.`
						: spanish ? `El usuario no existe.` : "User does not exist.",
				interaction: interaction
			})]
		})
		const embed_top = new EmbedBuilder()
			.setAuthor({ iconURL: user.avatar_url, url: `https://osudroid.moe/profile.php?uid=${user.id}`, name: spanish ? `osu!droid・Top plays de  :flag_${user.country.toLowerCase()} :  **${user.username}**` : `osu!droid・Top plays of  :flag_${user.country.toLowerCase()}:  **${user.username}**` })
			.setDescription(spanish ?
				`> **DPP total:** ${user.dpp.toLocaleString("en-US")} DPP\n> **Rank de DPP:** #${user.rank.dpp.toLocaleString("en-US")}\n> **Página del perfil:** [osudroid.moe](https://osudroid.moe/profile.php?uid=${user.id}) - [Droid PP Board]()`
				: `> **Total DPP:** ${user.dpp.toLocaleString("en-US")} DPP\n> **DPP rank:** #${user.rank.dpp.toLocaleString("en-US")}\n> **Profile page:** [osudroid.moe](https://osudroid.moe/profile.php?uid=${user.id}) - [Droid PP Board]()`
			)
		await interaction.editReply({
			embeds: [await droid.embed.top(embed_top, user.scores.slice(5,10), 1)]
		})

		//console.log(array_scores)
	}
}