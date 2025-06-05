import { SlashCommand } from "@structures/core";
import { Embeds } from "@utils";

export const stop: SlashCommand["run"] = async (client, interaction) => {
	client.tracking.stop();
	const embed = Embeds.response({ description: "The osu!droid tracking system was stopped.", user: interaction.user, color: "Red" });
	await interaction.editReply({ embeds: [embed] });
}