import { ButtonInteraction, ComponentType, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droid } from "../../functions/osu!droid/functions"
import { embed } from "../../functions/messages/embeds"
import { create_row } from "../../functions/utils"
export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("recent")
		.setDescription("osu!droid - Get recent scores from an osu!droid profile.")
		.setDescriptionLocalization("es-ES", "osu!droid - Obtener scores recientes de un perfil de osu!droid.")
		.addIntegerOption(opt => opt
			.setName("uid")
			.setDescription("UID of osu!droid profile.").setDescriptionLocalization("es-ES", "UID del perfil de osu!droid.")
			.setRequired(true)
		)
		.addIntegerOption(opt => opt
			.setName("index").setNameLocalization("es-ES", "indice")
			.setDescription("The n-th play to show (1 <= n <= 50). Defaults to 1.").setDescriptionLocalization("es-ES", "La n-ésima play a mostrar (1 <= n <= 50). 1 por defecto.")
			.setMaxValue(50).setMinValue(1)
		),

	async execute(client, interaction) {
		const spanish = ["es-ES", "es-419"].includes(interaction.locale)
		const response = await interaction.deferReply()
		const id = interaction.options.getInteger("uid", true)
		const data = await droid.request(id)
		if (!data) return await interaction.editReply({
			embeds: [embed.response({
				type: "error",
				description: spanish ? `El usuario no existe.` : "User does not exist.",
				interaction: interaction
			})]
		})
		const user = (await droid.user({ uid: id, response: data }))!
		const recents = await droid.scores({ uid: id, response: data, type: "recent" })
		if (!recents?.length) return await interaction.editReply({
			embeds: [embed.response({
				type: "error",
				description: spanish ? `El usuario  :flag_${user.country.toLowerCase()}:  **${user.username}**  no ha subido ningún score.` :
					`The user  :flag_${user.country.toLowerCase()}:  **${user.username}**  has no submitted scores.`,
				interaction: interaction
			})]
		})

		var index = (interaction.options?.getInteger("index") || 1) - 1
		if (index > recents.length) index = recents.length - 1

		const unique = `${interaction.user.id}-${Math.floor(Math.random() * 10000000)}`
		const row = create_row(unique, index, recents.length);

		const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000 });
		collector.on("collect", async (i: ButtonInteraction) => {
			if (i.user.id == interaction.user.id) {
				switch (i.customId) {
					case (`backAll-${unique}`):
						index = 0
						break;
					case (`back-${unique}`):
						index--;
						if (index < 0) index = recents.length - 1
						break;
					case (`go-${unique}`):
						index++;
						if (index >= recents.length) index = 0
						break;
					case (`goAll-${unique}`):
						index = recents.length - 1;
						break;
				}
				row.components[0].setDisabled(index == 0 ? true : false)
				row.components[2].setLabel(`${index + 1}/${recents.length}`)
				row.components[4].setDisabled(index == recents.length - 1 ? true : false)
				await i.update({
					content: spanish ?
						`<:droid_simple:1021473577951821824>  **osu!droid・**Score reciente #${index + 1} de  :flag_${user.country.toLowerCase()}:  **${user.username}**:\n-# Los valores de DPP y PP pueden no ser 100% precisos.`
						: `<:droid_simple:1021473577951821824>  **osu!droid・**Recent score #${index + 1} from  :flag_${user.country.toLowerCase()}:  **${user.username}**:\n-# DPP and PP values may not be 100% accurate.`,
					embeds: [await droid.embed.score(recents[index])],
					components: [row]
				})
			}
		})

		collector.on("end", async () => {
			for (const button of row.components) {
				button.setDisabled(true)
			}
			interaction.editReply({ components: [row] })
		})
		const embed_score = await droid.embed.score(recents[index])
		await interaction.editReply({
			content: spanish ?
				`<:droid_simple:1021473577951821824>  **osu!droid・**Score reciente #${index + 1} de  :flag_${user.country.toLowerCase()}:  **${user.username}**:\n-# Las estadísticas pueden ser incorrectas.`
				: `<:droid_simple:1021473577951821824>  **osu!droid・**Recent score #${index + 1} from  :flag_${user.country.toLowerCase()}:  **${user.username}**:\n-# Score statistics may be inaccurate.`,
			embeds: [embed_score], components: [row]
		})
	},
}
