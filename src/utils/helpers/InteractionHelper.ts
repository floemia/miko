import { InteractionEmbedBuilder } from "@utils/builders";
import { CacheType, ChatInputCommandInteraction, InteractionEditReplyOptions, InteractionReplyOptions, MessageFlags, MessagePayload } from "discord.js";
import { en, es } from "@locales";

export abstract class InteractionHelper {

    static async reply(interaction: ChatInputCommandInteraction, options: InteractionReplyOptions | InteractionEditReplyOptions) {
        if (!interaction.deferred && !interaction.replied) return await interaction.reply(options as InteractionReplyOptions);
        return await interaction.editReply(options as InteractionEditReplyOptions);
    }

    static getLocale(interaction: ChatInputCommandInteraction<CacheType>) {
        const responses = interaction.locale.includes("es") ? es : en;
        return responses;
    }
    /**
     * Replies to an interaction with an error.
     * @param interaction The slash command interaction.
     * @param input The `string` or `Error` to set as the error.
     */
    static async replyError(interaction: ChatInputCommandInteraction<CacheType>, input: string | Error) {
        const embed = new InteractionEmbedBuilder(interaction)
            .setError(input);
        return await this.reply(interaction, { embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    /**
     * Replies to an interaction with a process message.
     * @param interaction The slash command interaction.
     * @param input 
     */
    static async replyProcess(interaction: ChatInputCommandInteraction<CacheType>, input: string) {
        const embed = new InteractionEmbedBuilder(interaction)
            .setFooter(null)
            .setTimestamp(null)
            .setMessage(input)
            .setAuthor(null);
             
        return await this.reply(interaction, { embeds: [embed] });
    }

}