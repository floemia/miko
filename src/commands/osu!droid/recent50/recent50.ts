import { SlashCommand } from "@structures/core";
import { PaginationRowBuilder, ResponseEmbedBuilder, ScoreListEmbedBuilder, ResponseType, RowActions, ScoreListType } from "@utils/builders";
import { SlashCommandBuilder } from "discord.js";
import { DroidHelper } from "@utils/helpers";
import { DroidUserNotFound, NoDroidScores } from "@structures/errors";

export const run: SlashCommand["run"] = async (client, interaction, str) => {
    const user = await DroidHelper.getUser(interaction);
    if (!user) throw new DroidUserNotFound(str.general.user_dne);

    const embed = new ResponseEmbedBuilder()
        .setUser(interaction.user)
        .setDescription(str.commands.recent50.generating(user))
        .setType(ResponseType.PROCESS);
        
    const response = await interaction.editReply({ embeds: [embed] });
    const scores = await user.getRecentScores();

    if (scores.length == 0) throw new NoDroidScores(str.general.no_scores(user));

    const max_pages = Math.ceil(scores.length / 5);
    let page = 0;
    const row = new PaginationRowBuilder(response)
        .setIndex(page)
        .setLength(max_pages)
        .startTimeout();

    const embed_recents = await new ScoreListEmbedBuilder()
        .setType(ScoreListType.RECENT)
        .setScores(scores)
        .setPage(page)
        .setPlayer(user);

    await response.edit({ embeds: [embed_recents], components: [row] });

    row.collector.on("collect", async (i) => {
        await i.deferUpdate();
        if (i.user.id != interaction.user.id || !i.customId.includes(row.ID)) return
        const action = i.customId.split("-")[0] as RowActions;
        row.handleAction(action);
        embed_recents.setPage(row.index);
        await response.edit({ embeds: [embed_recents], components: [row] });
    })
}
export const data: SlashCommand["data"] =
    new SlashCommandBuilder()
        .setName("recent50")
        .setDescription("🔘 Get a list of the most recent 50 scores from yourself or a player.")
        .setDescriptionLocalization("es-ES", "🔘 Obtener una lista de los últimos 50 scores tuyos o de un jugador.")
        .addUserOption(option => option.setName("user")
            .setDescription("The Discord user linked to the osu!droid account.")
            .setDescriptionLocalization("es-ES", "El usuario de Discord vinculado a la cuenta de osu!droid."))
        .addIntegerOption(option => option.setName("uid")
            .setDescription("The UID of the player.")
            .setDescriptionLocalization("es-ES", "El UID del jugador."))
        .addStringOption(option => option.setName("username")
            .setDescription("The username of the player.")
            .setDescriptionLocalization("es-ES", "El nombre de usuario del jugador."))
        .addStringOption(option => option.setName("server")
            .setDescription("The server to fetch scores from.")
            .setDescriptionLocalization("es-ES", "El servidor desde el cual obtener los scores.")
            .addChoices({ name: "iBancho", value: "ibancho" }, { name: "osudroid!relax", value: "rx" }))

export const dirname = __dirname;