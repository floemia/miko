import { Config } from "@core/Config";
import { ColorHelper } from "@utils/helpers";
import { EmbedBuilder, Interaction, User } from "discord.js";

/**
 * Utility class for creating interaction embeds.
 */
export class InteractionEmbedBuilder extends EmbedBuilder {
    /**
     * The interaction that the embed is created for.
     */
    private interaction: Interaction;

    /**
     * The author of the interaction.
     */
    private author: User;

    constructor(interaction: Interaction) {
        super();
        this.interaction = interaction;
        this.author = interaction.user;
        this.setAuthor({ name: this.author.username, iconURL: this.author.displayAvatarURL() });
        this.setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });
        this.setColor(ColorHelper.hexToNumber(Config.colors.default));
        this.setTimestamp();
    }

    /**
     * Sets a message in the embed.
     * @param message The message to set.
     * @returns The updated instance of the interaction embed builder.
     */
    setMessage(message: string): this {
        return this.setDescription(`>>> ${message}`);
    }

    /**
     * Sets an error message in the embed.
     * @param input Either a `string` or an `Error` instance.
     * @returns The updated instance of the interaction embed builder.
     */
    setError(input: string | Error): this {
        this.setColor(ColorHelper.hexToNumber(Config.colors.error));
        if (input instanceof Error) {
            return this.setMessage(`\`${input.stack}\``)
                .setTitle(`${input}`)
        }
        return this.setMessage(input)
    }





}