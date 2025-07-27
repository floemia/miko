import { SlashCommand } from "@structures/core";
import { status, channel } from "./subCommands";
export const tracking: SlashCommand["run"] = async (client, interaction, str) => {
	const command = interaction.options.getSubcommand();
	switch (command) {
		case "status":
			await status(client, interaction, str);
			break;
		case "channel":
			await channel(client, interaction, str);
			break;
	}
}