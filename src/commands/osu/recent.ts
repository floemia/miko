import { ButtonInteraction, ComponentType, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droid } from "../../functions/osu!droid/functions"
import { embed } from "../../functions/messages/embeds"
import { ButtonBuilder, ActionRowBuilder, ButtonStyle } from "discord.js"
export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("recent")
		.setDescription("osu!droid - Muestra tu score más reciente.")
		.addIntegerOption(opt => opt
			.setName("uid")
			.setDescription("UID del usuario")
			.setRequired(true)
		)
		.addIntegerOption(opt => opt
			.setName("index")
			.setDescription("Indice de la play")
			.setMaxValue(50).setMinValue(1)
		),

	async execute(client, interaction) {
		const response = await interaction.deferReply()
		const user = await droid.user({ uid: interaction.options.getInteger("uid", true), type: "with_recents"})
		if (!user) return await interaction.editReply({
			embeds: [await embed.interaction("error", `El usuario no existe.`, interaction)]
		})
		if (!user.scores.recent || user.scores.recent.length == 0) return await interaction.editReply({
			embeds: [await embed.interaction("error", `El usuario  :flag_${user.country.toLowerCase()}:  **${user.username}**  no ha subido ningún score.`, interaction)]
		})

		const recents = user.scores.recent
		var index = (interaction.options?.getInteger("index") || 1) - 1
		if (index > recents.length) index = recents.length - 1

		const unique = `${interaction.user.id}-${Math.floor(Math.random() * 10000000)}`
		const row = new ActionRowBuilder<ButtonBuilder>()
			.setComponents(
				new ButtonBuilder()
					.setCustomId(`backAll-${unique}`)
					.setDisabled(index == 0 ? true : false)
					.setEmoji('<:lastarrowleft:968284085363568721>')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setEmoji('<:arrowleft:968284085472616469>')
					.setCustomId(`back-${unique}`)
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setLabel(`${index + 1}/${recents.length}`)
					.setDisabled(true)
					.setCustomId('page')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setEmoji('<:arrowright:968284085342584912>')
					.setCustomId(`go-${unique}`)
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId(`goAll-${unique}`)
					.setDisabled(index == recents.length - 1 ? true : false)
					.setEmoji('<:lastarrowright:968284085652963368>')
					.setStyle(ButtonStyle.Primary),
			)

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
					content: `<:droid_simple:1021473577951821824>  **osu!droid・**Score #${index + 1} de  :flag_${user.country.toLowerCase()}:  **${user.username}**:\n-# Los valores de DPP y PP pueden no ser precisos.`,
					embeds: [await droid.embed.score(recents[index])],
					components: [row]
				})

			}
		})

		collector.on("end", async () => {
			for (const button of row.components) {
				button.setDisabled(true)
			}
			interaction.editReply({
				components: [row]
			})
		})
		const embed_score = await droid.embed.score(recents[index])
		await interaction.editReply({ content: `<:droid_simple:1021473577951821824>  **osu!droid・**Score #${index + 1} de  :flag_${user.country.toLowerCase()}:  **${user.username}**:\n-# Los valores de DPP y PP pueden no ser precisos.`, embeds: [embed_score], components: [row] })
	},
}
