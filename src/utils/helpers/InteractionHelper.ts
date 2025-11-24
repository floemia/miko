import { InteractionEmbedBuilder } from "@utils/builders";
import { CacheType, ChatInputCommandInteraction, InteractionEditReplyOptions, InteractionReplyOptions, MessageFlags, MessagePayload } from "discord.js";
import { en, es } from "@locales";
import { EmojiHelper } from "./EmojiHelper";

export abstract class InteractionHelper {

    static async reply(interaction: ChatInputCommandInteraction, options: InteractionReplyOptions | InteractionEditReplyOptions) {
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

    /**
     * Replies to an interaction with a success message.
     * @param interaction The slash command interaction.
     * @param input The `string` to set as the success message.
     */
    static async replySuccess(interaction: ChatInputCommandInteraction<CacheType>, input: string) {
        const emoji = EmojiHelper.getResponseEmoji("success");
        const embed = new InteractionEmbedBuilder(interaction)
            .setMessage(emoji?.toString() + " " + input)
        return await this.reply(interaction, { embeds: [embed] });
    }

}