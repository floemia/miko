import { SlashCommand } from "@structures/core";
import { Embeds } from "@utils";

export const tracking: SlashCommand["run"] = async (client, interaction) => {
	const status = interaction.options.getString("status", true) == "enabled";
	client.config.tracking.droid.enabled = status;
	const embed = Embeds.response({ description: `\`client.config.tracking.droid.enabled\` => \`${status}\`.`, user: interaction.user, color: "Green" });
	await interaction.editReply({ embeds: [embed] });
}