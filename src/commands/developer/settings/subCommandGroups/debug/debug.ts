import { SlashCommand } from "@structures/core";
import { ResponseEmbedBuilder } from "@utils/builders";

export const debug: SlashCommand["run"] = async (client, interaction, str) => {
	const status = interaction.options.getString("status", true) == "enabled";
	client.config.debug = status;
	const embed = new ResponseEmbedBuilder()
		.setUser(interaction.user)
		.setDescription(`client.config.debug => \`${client.config.debug}\``);
	
	await interaction.editReply({ embeds: [embed] });
}
