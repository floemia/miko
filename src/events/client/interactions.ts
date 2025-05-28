import type { Event } from "../../types"
import { utils } from "../../utils"

export const event: Event<"interactionCreate"> = {
	name: "interactionCreate",

	async execute(client, interaction) {
		if (interaction.isChatInputCommand()) {
			const command = client.commands.get(interaction.commandName)
			if (!command) return

			if (command.disabled) {
				const embed = utils.embeds.error({ description: "This command is disabled.", interaction, spanish: interaction.locale == "es-ES" })
				return await interaction.reply({ embeds: [embed] })
			}
			if (command.developer && interaction.user.id != process.env.DEV)
				return await interaction.reply({
					content: "This is a developer-only command.",
					ephemeral: true,
				})
				command.execute(client, interaction)
		}
	},
}
