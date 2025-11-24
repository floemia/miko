import { DroidBanchoUser } from "@floemia/osu-droid-utils";
import { Modes } from "@rian8337/osu-base";
import { SlashCommand } from "@structures/core";
import { ScoreEmbedBuilder } from "@utils/builders/ScoreEmbedBuilder";
import { SlashCommandBuilder } from "discord.js";

export const developer: SlashCommand["developer"] = true;

export const run: SlashCommand["run"] = async (client, interaction) => {
    const user = await DroidBanchoUser.get({ uid: 177955 })!;
    const score = user!.getRecentScores()[0];
    await score?.calculate(Modes.droid);
    if (!score) return;
    const embed = await new ScoreEmbedBuilder()
        .setUser(user!)
        .setScore(score)

    await interaction.editReply({ embeds: [embed] });
}

export const data: SlashCommand["data"] =
    new SlashCommandBuilder()
        .setName("test")
        .setDescription("📶 Get Miko's ping.")
        .setDescriptionLocalization("es-ES", "📶 Obtener el ping de Miko.")

export const dirname = __dirname;