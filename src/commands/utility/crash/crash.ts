import { SlashCommand } from "@structures/core";
import { SlashCommandBuilder } from "discord.js";

export const run: SlashCommand["run"] = async (client, interaction) => {
	await interaction.deferReply();
	throw new Error("Induced crash");
}

export const data: SlashCommand["data"] =
	new SlashCommandBuilder()
		.setName("crash")
		.setDescription("💣 Nuke the bot for testing purposes.")
		.setDescriptionLocalization("es-ES", "Nukear el bot para pruebas.")

export const developer: SlashCommand["developer"] = true;