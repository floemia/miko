import { SlashCommand } from "@structures/core";
import { Embeds } from "@utils";
import { en, es } from "@locales";
import { PermissionFlagsBits, TextChannel } from "discord.js";

export const channel: SlashCommand["run"] = async (client, interaction) => {
	const spanish = interaction.locale.includes("es");
	const str = spanish ? es : en;

	const channel = interaction.options.getChannel("channel", true) as TextChannel;
	await client.db.guilds.setTrackChannel(interaction.guild!.id, channel.id);

	const botMember = interaction.guild?.members.me!;
	const embed = Embeds.response({
		description: str.commands.config.track_channel.set(channel.toString(), botMember.permissionsIn(channel).has(PermissionFlagsBits.SendMessages)), 
		color: "Green",
		user: interaction.user
	});
	await interaction.editReply({ embeds: [embed] });


}