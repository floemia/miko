import { SlashCommand } from "@structures/core";
import { ResponseEmbedBuilder } from "@utils/builders";
import { TrackingManager } from "@utils/managers";

export const tracking: SlashCommand["run"] = async (client, interaction, str) => {
	const status = interaction.options.getString("status", true) == "enabled";
	if (status) await TrackingManager.start();
	else TrackingManager.stop();
	
	const embed = new ResponseEmbedBuilder()
		.setUser(interaction.user)
		.setDescription(`client.config.tracking.enabled => \`${status}\``);
	await interaction.editReply({ embeds: [embed] });
}