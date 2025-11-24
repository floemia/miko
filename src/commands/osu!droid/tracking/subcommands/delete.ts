import { DroidBanchoUser } from "@floemia/osu-droid-utils";
import { SlashCommand } from "@structures/core";
import { InteractionEmbedBuilder } from "@utils/builders";
import { DroidHelper, InteractionHelper } from "@utils/helpers";
import { TrackingManager } from "@utils/managers";

export const tracking_delete: SlashCommand["run"] = async (client, interaction) => {
    const t = InteractionHelper.getLocale(interaction);

    const user = await DroidHelper.getUser(interaction, "ibancho") as DroidBanchoUser;
    if (!user) return;

    const deleted = await TrackingManager.deleteUser(user, interaction.guild!);
    if (!deleted) return await InteractionHelper.replyError(interaction, t.commands.tracking.delete.responses.not_in);

    const embed = new InteractionEmbedBuilder(interaction)
        .setMessage(t.commands.tracking.delete.responses.ok(user))
        .setThumbnail(user.avatar_url);

    await InteractionHelper.reply(interaction, { embeds: [embed] });
}