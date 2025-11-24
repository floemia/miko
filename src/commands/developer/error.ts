import { SlashCommand } from "@structures/core";
import { SlashCommandBuilder } from "discord.js";

export const developer: SlashCommand["developer"] = true;

export const run: SlashCommand["run"] = async (client, interaction) => {
    throw new Error("this is an intentionally thrown error. boop");
}

export const data: SlashCommand["data"] =
    new SlashCommandBuilder()
        .setName("error")
        .setDescription("Throws an error.")

export const dirname = __dirname;