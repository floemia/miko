import { SlashCommand } from "@structures/core";
import { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { tracking_add, tracking_delete } from "./subcommands/";
import { tracking_dev } from "./subcommandGroups/dev/dev";
export const run: SlashCommand["run"] = async (client, interaction) => {
    if (interaction.options.getSubcommandGroup() == "dev") return await tracking_dev(client, interaction);
    switch (interaction.options.getSubcommand()) {
        case "add":
            await tracking_add(client, interaction);
            break;
        case "delete":
            await tracking_delete(client, interaction);
            break;
    }
}

export const data: SlashCommand["data"] =
    new SlashCommandBuilder()
        .setName("tracking")
        .setDescription("this text is unreachable")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(subcommand =>
            subcommand.setName("add")
                .setDescription("Adds an user to the osu!droid score tracking system.")
                .setDescriptionLocalization("es-ES", "Añade un usuario al sistema de tracking de scores de osu!droid.")
                .addUserOption(option => option.setName("user")
                    .setDescription("The Discord user linked to the osu!droid account.")
                    .setDescriptionLocalization("es-ES", "El usuario de Discord vinculado a la cuenta de osu!droid."))
                .addIntegerOption(option => option.setName("uid")
                    .setDescription("The UID of the player.")
                    .setDescriptionLocalization("es-ES", "El UID del jugador."))
                .addStringOption(option => option.setName("username")
                    .setDescription("The username of the player.")
                    .setDescriptionLocalization("es-ES", "El nombre de usuario del jugador."))
        )
        .addSubcommand(subcommand =>
            subcommand.setName("delete")
                .setDescription("Deletes an user from the osu!droid score tracking system.")
                .setDescriptionLocalization("es-ES", "Elimina un usuario del sistema de tracking de scores de osu!droid.")
                .addUserOption(option => option.setName("user")
                    .setDescription("The Discord user linked to the osu!droid account.")
                    .setDescriptionLocalization("es-ES", "El usuario de Discord vinculado a la cuenta de osu!droid."))
                .addIntegerOption(option => option.setName("uid")
                    .setDescription("The UID of the player.")
                    .setDescriptionLocalization("es-ES", "El UID del jugador."))
                .addStringOption(option => option.setName("username")
                    .setDescription("The username of the player.")
                    .setDescriptionLocalization("es-ES", "El nombre de usuario del jugador."))
        )
        .addSubcommandGroup(subcommand =>
            subcommand.setName("dev")
                .setDescription("sdasfg")
                .addSubcommand(subcommand =>
                    subcommand.setName("start")
                        .setDescription("(DEV) Starts the osu!droid score tracking system.")
                        .setDescriptionLocalization("es-ES", "(DEV) Inicia el sistema de tracking de scores de osu!droid.")
                )
                .addSubcommand(subcommand =>
                    subcommand.setName("stop")
                        .setDescription("(DEV) Stops the osu!droid score tracking system.")
                        .setDescriptionLocalization("es-ES", "(DEV) Detiene el sistema de tracking de scores de osu!droid.")
                )
                .addSubcommand(subcommand =>
                    subcommand.setName("update")
                        .setDescription("(DEV) Updates all of the osu!droid score tracking system's entries.")
                        .setDescriptionLocalization("es-ES", "(DEV) Actualiza todas las entradas del sistema de tracking de scores de osu!droid.")
                )
        )



export const dirname = __dirname;