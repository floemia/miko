import { SlashCommand } from "@structures/core";
import { DBManager } from "@utils/managers";
import { ResponseEmbedBuilder } from "@utils/builders";

export const status: SlashCommand["run"] = async (client, interaction, str) => {
	const enabled = interaction.options.getString("status", true) == "enabled";
	const embed = new ResponseEmbedBuilder()
		.setUser(interaction.user)
		.setDescription(str.commands.config.track.enabled(enabled));
	await interaction.editReply({ embeds: [embed] });
	await DBManager.setTrackingStatus(interaction.guild!, enabled);
}