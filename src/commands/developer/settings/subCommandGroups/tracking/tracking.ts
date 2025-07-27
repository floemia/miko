import { SlashCommand } from "@structures/core";
import { ResponseEmbedBuilder } from "@utils/builders";

export const tracking: SlashCommand["run"] = async (client, interaction, str) => {
	const status = interaction.options.getString("status", true) == "enabled";
	if (status) await client.tracking.start();
	else client.tracking.stop();
	
	const embed = new ResponseEmbedBuilder()
		.setUser(interaction.user)
		.setDescription(`client.config.tracking.enabled => \`${status}\``);
	await interaction.editReply({ embeds: [embed] });
}