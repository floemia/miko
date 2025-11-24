import { DroidBanchoUser } from "@floemia/osu-droid-utils";
import { SlashCommand } from "@structures/core";
import { InteractionEmbedBuilder } from "@utils/builders";
import { DroidHelper, InteractionHelper } from "@utils/helpers";
import { TrackingManager } from "@utils/managers";

export const tracking_add: SlashCommand["run"] = async (client, interaction) => {
    const t = InteractionHelper.getLocale(interaction);

    const user = await DroidHelper.getUser(interaction, "ibancho") as DroidBanchoUser;
    if (!user) return;

    const added = await TrackingManager.addUser(user, interaction.guild!);
    if (!added) return await InteractionHelper.replyError(interaction, t.commands.tracking.add.responses.already_in);

    const embed = new InteractionEmbedBuilder(interaction)
        .setMessage(t.commands.tracking.add.responses.ok(user))
        .setThumbnail(user.avatar_url);

    await InteractionHelper.reply(interaction, { embeds: [embed] });
}