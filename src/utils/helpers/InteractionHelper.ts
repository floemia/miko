import { Interaction } from "discord.js";
import { en, es } from "@locales";
export abstract class InteractionHelper {
    static getLocaleResponses(interaction: Interaction) {
        return interaction.locale.includes("es") ? es : en ;
    }
}