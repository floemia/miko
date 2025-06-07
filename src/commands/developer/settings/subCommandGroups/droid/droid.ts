import { SlashCommand } from "@structures/core";
import { Embeds } from "@utils";

export const droid: SlashCommand["run"] = async (client, interaction) => {
	const method = interaction.options.getString("method", true);
	client.config.scraping = method == "scraping";
	const embed = Embeds.response({ description: `\`client.config.scraping\` => \`${client.config.scraping}\`.`, user: interaction.user, color: "Green" });
	await interaction.editReply({ embeds: [embed] });
}