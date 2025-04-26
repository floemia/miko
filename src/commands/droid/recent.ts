import { ButtonInteraction, ComponentType, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droid } from "../../functions/osu!droid/functions"
import { embed } from "../../functions/messages/embeds"
import { create_row } from "../../functions/utils"
import DroidUserBindModel from "../../schemas/DroidUserBindSchema"
import { DroidScoreExtended, miko, NewDroidUser } from "miko-modules"
import en from "../../locales/en"
import es from "../../locales/es"
const languages = { en, es };
export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("recent")
		.setDescription("osu!droid - Get recent scores from an osu!droid profile.")
		.setDescriptionLocalization("es-ES", "osu!droid - Obtener scores recientes de un perfil de osu!droid.")
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
		)
		.addIntegerOption(opt => opt
			.setName("index").setNameLocalization("es-ES", "indice")
			.setDescription("The n-th play to show (1 <= n <= 50). Defaults to 1.").setDescriptionLocalization("es-ES", "La n-ésima play a mostrar (1 <= n <= 50). 1 por defecto.")
			.setMaxValue(50).setMinValue(1)
		),

	async execute(client, interaction) {
		const spanish = ["es-ES", "es-419"].includes(interaction.locale)
		let response = spanish ? languages.es : languages.en
		const reply = await interaction.deferReply()
		let data = await droid.get_response(interaction)

		if ("error" in data) return await interaction.editReply({
			embeds: [embed.response({ type: "error", description: response.command.recent.error(data.error), interaction: interaction })]
		})
		let recents = await miko.scores({ type: "recent", response: data }) as DroidScoreExtended[]

		if (!recents.length) return await interaction.editReply({
			embeds: [embed.response({
				type: "error",
				description: response.command.recent.no_scores, 
				interaction: interaction
			})]
		})
		let user = recents[0].user!
		var index = (interaction.options?.getInteger("index") || 1) - 1
		if (index > recents.length) index = recents.length - 1

		const unique = `${interaction.user.id}-${Math.floor(Math.random() * 10000000)}`
		const row = create_row(unique, index, recents.length);

		const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button });
		let collector_timeout: NodeJS.Timeout
		const start_timeout = () => {
			collector_timeout = setTimeout(() => {
				collector.stop()
				for (const button of row.components) {
					button.setDisabled(true)
				}
				interaction.editReply({ components: [row] })
			}, 120000)
		}

		const reset_timeout = async () => {
			clearTimeout(collector_timeout)
			start_timeout()
		}

		start_timeout()
		collector.on("collect", async (i: ButtonInteraction) => {
			if (i.user.id == interaction.user.id) {
				await i.deferUpdate()
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
				reset_timeout()

				row.components[0].setDisabled(index == 0 ? true : false)
				row.components[2].setLabel(`${index + 1}/${recents.length}`)
				row.components[4].setDisabled(index == recents.length - 1 ? true : false)

				await miko.calculate(recents[index])
				await i.editReply({
					content: response.command.recent.score(user, index, recents[index].performance.penalty),
					embeds: [await droid.embed.score(recents[index])],
					components: [row]
				})
			}
		})
		await miko.calculate(recents[index])
		const embed_score = await droid.embed.score(recents[index])
		await interaction.editReply({
			content: response.command.recent.score(user, index, recents[index].performance.penalty),
			embeds: [embed_score], components: [row]
		})
	},
}
