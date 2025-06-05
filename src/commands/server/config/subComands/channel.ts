import { SlashCommand } from "@structures/core";
import { Embeds } from "@utils";
import { en, es } from "@locales";
import GuildConfigModel from "@structures/mongoose/GuildConfigSchema";
import { PermissionFlagsBits, TextChannel } from "discord.js";
export const channel: SlashCommand["run"] = async (client, interaction) => {
	const spanish = interaction.locale.includes("es");
	const str = spanish ? es : en;

	const channel = interaction.options.getChannel("channel", true) as TextChannel;

	const db = await GuildConfigModel.findOne({ id: interaction.guild!.id });
	await GuildConfigModel.findOneAndUpdate(
		{ id: interaction.guild!.id },
		{
			id: interaction.guild!.id,
			channel: {
				track: channel.id
			},
			tracking_enabled: db ? db.tracking_enabled : true
		},
		{ upsert: true, new: true }
	);
	const botMember = interaction.guild?.members.me!;
	const embed = Embeds.response({
		description: str.commands.config.track_channel.set(channel.toString(), botMember.permissionsIn(channel).has(PermissionFlagsBits.SendMessages)
		), color: "Green"
	});
	await interaction.editReply({ embeds: [embed] });


}