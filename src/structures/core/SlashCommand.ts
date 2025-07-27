import { ChatInputCommandInteraction, SharedSlashCommand } from "discord.js";
import { Bot } from "@core";
import { Localization } from "locales/Localization";
export interface SlashCommand {
	run(client: Bot, interaction: ChatInputCommandInteraction, str: Localization): Promise<any>;
	dirname: string;
	cooldown?: number;
	disabled?: boolean;
	developer?: boolean;
	data: SharedSlashCommand;
}