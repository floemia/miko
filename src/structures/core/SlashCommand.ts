import { ChatInputCommandInteraction, SharedSlashCommand, SlashCommandBuilder } from "discord.js";
import { Bot } from "@core";

export interface SlashCommand {
	run(client: Bot, interaction: ChatInputCommandInteraction): Promise<any>;
	cooldown?: number;
	disabled?: boolean;
	developer?: boolean;
	data: SharedSlashCommand;
}