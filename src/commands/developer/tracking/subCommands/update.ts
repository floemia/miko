import { SlashCommand } from "@structures/core";
import { Embeds } from "@utils";
import { EmbedBuilder } from "discord.js";

export const update: SlashCommand["run"] = async (client, interaction) => {
	const embed_wait = new EmbedBuilder()
		.setColor(Number(`0xdedede`))
		.setDescription(`> Updating osu!droid tracking system's entries...`);
	await interaction.editReply({ embeds: [embed_wait] });
	const yeah = await client.tracking.refresh();
	if (yeah) {
		const embed = Embeds.response({ description: "The osu!droid tracking system's entries were updated.", user: interaction.user, color: "Green" });
		await interaction.editReply({ embeds: [embed] });
	}
}