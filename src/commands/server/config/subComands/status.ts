import { SlashCommand } from "@structures/core";
import { Embeds } from "@utils";
import { en, es } from "@locales";
import GuildConfigModel from "@structures/mongoose/GuildConfigSchema";

export const status: SlashCommand["run"] = async (client, interaction) => {
	const spanish = interaction.locale.includes("es");
	const str = spanish ? es : en;

	const bool = interaction.options.getString("status", true);
	const enabled = bool == "enabled";
	const db = await GuildConfigModel.findOne({ id: interaction.guild!.id });
	await GuildConfigModel.findOneAndUpdate(
		{ id: interaction.guild!.id },
		{
			id: interaction.guild!.id,
			channel: {
				track: db?.channel.track
			},
			tracking_enabled: enabled
		},
		{ upsert: true, new: true }
	);

	const embed = Embeds.response({ user: interaction.user, description: str.commands.config.track.enabled(enabled), color: enabled ? "Green" : "Red" });
	await interaction.editReply({ embeds: [embed] });


}