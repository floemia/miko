import { SlashCommand } from "@structures/core";
import { Embeds } from "@utils";

export const tracking: SlashCommand["run"] = async (client, interaction) => {
	const status = interaction.options.getString("status", true) == "enabled";
	if (status) client.tracking.start();
	else client.tracking.stop();
	const embed = Embeds.response({ description: `\`client.config.tracking.droid.enabled\` => \`${status}\`.`, user: interaction.user, color: "Green" });
	await interaction.editReply({ embeds: [embed] });
}