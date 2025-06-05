import { SlashCommand } from "@structures/core";
import { Embeds } from "@utils";

export const start: SlashCommand["run"] = async (client, interaction) => {
	client.tracking.start();
	if (!client.config.tracking.droid.enabled) client.config.tracking.droid.enabled = true;
	const embed = Embeds.response({ description: "The osu!droid tracking system was started.", user: interaction.user, color: "Green" });
	await interaction.editReply({ embeds: [embed] });
}