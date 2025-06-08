import { SlashCommand } from "@structures/core";
import { Embeds } from "@utils";
import { en, es } from "@locales";

export const status: SlashCommand["run"] = async (client, interaction) => {
	const spanish = interaction.locale.includes("es");
	const str = spanish ? es : en;

	const enabled = interaction.options.getString("status", true) == "enabled";
	await client.db.guilds.setTrackingStatus(interaction.guild!.id, enabled);

	const embed = Embeds.response({ user: interaction.user, description: str.commands.config.track.enabled(enabled), color: enabled ? "Green" : "Red" });
	await interaction.editReply({ embeds: [embed] });


}