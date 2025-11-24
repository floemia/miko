import { SlashCommand } from "@structures/core";
import { ColorHelper, DroidHelper, InteractionHelper } from "@utils/helpers";
import { InteractionEmbedBuilder } from "@utils/builders";
import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";

export const run: SlashCommand["run"] = async (client, interaction) => {
    const t = InteractionHelper.getLocale(interaction);
    const user = await DroidHelper.getUser(interaction);
    if (!user) return;
    await InteractionHelper.replyProcess(interaction, t.commands.card.responses.generating(user));
    const card = await DroidHelper.getCard(user);
    const filename = `${user.username}-${user.id}.png`;
    const attachment = new AttachmentBuilder(card, { name: filename });
    const color = await ColorHelper.getAverageColor(card);
    const embed = new InteractionEmbedBuilder(interaction)
        .setColor(color)
        .setImage(`attachment://${filename}`)
        .setAuthor({ name: DroidHelper.userToString(user, "rank"), iconURL: user.avatar_url, url: user.url });

    await InteractionHelper.reply(interaction, { embeds: [embed], files: [attachment] });

}

export const data: SlashCommand["data"] = new SlashCommandBuilder()
    .setName("card")
    .setDescription(" Get a profile card of an osu!droid player.")
    .setDescriptionLocalization("es-ES", " Obtener una tarjeta de perfil de un jugador de osu!droid.")
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
        .setDescription("The server to fetch the player from.")
        .setDescriptionLocalization("es-ES", "El servidor desde el cual obtener al jugador.")
        .addChoices({ name: "iBancho", value: "ibancho" }, { name: "osudroid!relax", value: "rx" }))
export const dirname = __dirname;
