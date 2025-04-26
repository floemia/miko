import { ButtonInteraction, ComponentType, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droid } from "../../functions/osu!droid/functions"
import { create_row } from "../../functions/utils"
import { DroidScoreExtended, miko, NewDroidUser } from "miko-modules"
import en from "../../locales/en"
import es from "../../locales/es"
import { utils } from "../../utils"
const languages = { en, es };
export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("top")
		.setDescription("osu!droid - Get top plays from an osu!droid profile.")
		.setDescriptionLocalization("es-ES", "osu!droid - Obtener top plays de un perfil de osu!droid.")
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

		const reply = await interaction.deferReply()
		let data = await droid.get_response(interaction)
		if ("error" in data) return await interaction.editReply({
			embeds: [utils.embeds.error({ description: data.error, interaction: interaction, spanish: spanish })]
		})
		let user = await miko.user({ response: data }) as NewDroidUser
		let top = await miko.scores({ type: "top", response: data }) as DroidScoreExtended[]

		if (!top.length) return await interaction.editReply({
			embeds: [utils.embeds.error({ description: response.command.top.no_scores(user), interaction: interaction, spanish: spanish })]
		})

		const unique = `${interaction.user.id}-${Math.floor(Math.random() * 10000000)}`
		let index = 0
		let max_pages = Math.ceil(top.length / 5)
		const row = create_row(unique, index, max_pages);

		const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button });
		let collector_timeout: NodeJS.Timeout
		let scores = await miko.score_pagination({ scores: top, page: index, scores_per_page: 5 })
		let embed_top = await droid.embed.top(user, scores, index)
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
						if (index < 0) index = max_pages - 1
						break;
					case (`go-${unique}`):
						index++;
						if (index >= max_pages) index = 0
						break;
					case (`goAll-${unique}`):
						index = max_pages - 1;
						break;
				}
				reset_timeout()

				row.components[0].setDisabled(index == 0 ? true : false)
				row.components[2].setLabel(`${index + 1}/${max_pages}`)
				row.components[4].setDisabled(index == max_pages - 1 ? true : false)

				scores = await miko.score_pagination({ scores: top, page: index, scores_per_page: 5 })
				embed_top = await droid.embed.top(user, scores, index)

				await i.editReply({
					embeds: [embed_top],
					components: [row]
				})
			}
		})
		await interaction.editReply({
			embeds: [embed_top], components: [row]
		})
	},
}	