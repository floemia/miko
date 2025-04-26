import type { Event } from "../../types"

export const event: Event<"interactionCreate"> = {
	name: "interactionCreate",

	async execute(client, interaction) {
		if (interaction.isChatInputCommand()) {
			const command = client.commands.get(interaction.commandName)
			if (!command) return

			if (command.developer && interaction.user.id != process.env.DEV)
				return await interaction.reply({
					content: "Este comando solo lo puede ejecutar floemia.",
					ephemeral: true,
				})

				command.execute(client, interaction)
		}
	},
}
