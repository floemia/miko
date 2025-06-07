import { SlashCommand } from "@structures/core";
import { Embeds } from "@utils";

export const debug: SlashCommand["run"] = async (client, interaction) => {
	const status = interaction.options.getString("status", true) == "enabled";
	client.config.debug = status;
	const embed = Embeds.response({ description: `\`client.config.debug\` => \`${status}\`.`, user: interaction.user, color: "Green" });
	await interaction.editReply({ embeds: [embed] });
}
