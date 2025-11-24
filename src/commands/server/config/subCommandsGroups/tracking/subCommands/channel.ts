import { SlashCommand } from "@structures/core";
import { PermissionFlagsBits, TextChannel } from "discord.js";
import { DatabaseManager } from "@utils/managers";
import { InteractionHelper } from "@utils/helpers";

export const channel: SlashCommand["run"] = async (client, interaction) => {
	const t = InteractionHelper.getLocale(interaction);
	const channel = interaction.options.getChannel("channel", true) as TextChannel;
	const botMember = interaction.guild?.members.me!;

	const can_send = channel.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages);
	await InteractionHelper.replySuccess(interaction, t.commands.config.track.channel.set(channel.name, can_send));

	await DatabaseManager.setTrackChannel(interaction.guild!, channel);

}