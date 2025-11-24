import { SlashCommand } from "@structures/core";
import { InteractionEmbedBuilder } from "@utils/builders";
import { DroidHelper, InteractionHelper } from "@utils/helpers";
import { TrackingManager } from "@utils/managers";

export const tracking_update: SlashCommand["run"] = async (client, interaction) => {


    const embed = new InteractionEmbedBuilder(interaction)
        .setMessage("Updating the osu!droid score tracking system...")

    await InteractionHelper.reply(interaction, { embeds: [embed] });
}