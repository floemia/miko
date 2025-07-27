import { SlashCommand } from "@structures/core";
import { PermissionFlagsBits, TextChannel } from "discord.js";
import { DBManager } from "@utils/managers";
import { ResponseEmbedBuilder } from "@utils/builders";

export const channel: SlashCommand["run"] = async (client, interaction, str) => {
	const channel = interaction.options.getChannel("channel", true) as TextChannel;
	const botMember = interaction.guild?.members.me!;
	const embed = new ResponseEmbedBuilder()
		.setUser(interaction.user)
		.setDescription(str.commands.config.track_channel.set(channel.name, channel.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages)))
	await interaction.editReply({ embeds: [embed] });

	await DBManager.setTrackChannel(interaction.guild!, channel);

}