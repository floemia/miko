import { SlashCommand } from "@structures/core";
import { PermissionFlagsBits, TextChannel } from "discord.js";
import { DatabaseManager } from "@utils/managers";
import { InteractionEmbedBuilder } from "@utils/builders";
import { InteractionHelper } from "@utils/helpers";

export const channel: SlashCommand["run"] = async (client, interaction) => {
	const t = InteractionHelper.getLocale(interaction);
	const channel = interaction.options.getChannel("channel", true) as TextChannel;
	const botMember = interaction.guild?.members.me!;
	const embed = new InteractionEmbedBuilder(interaction)
		.setMessage(t.commands.config.track.channel.set(channel.name, channel.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages)))
	await interaction.editReply({ embeds: [embed] });

	await DatabaseManager.setTrackChannel(interaction.guild!, channel);

}