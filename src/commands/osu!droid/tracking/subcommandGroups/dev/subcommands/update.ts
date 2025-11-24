import { SlashCommand } from "@structures/core";
import { InteractionEmbedBuilder } from "@utils/builders";
import { InteractionHelper } from "@utils/helpers";
import { TrackingManager } from "@utils/managers";

export const tracking_update: SlashCommand["run"] = async (client, interaction) => {
    await InteractionHelper.replyProcess(interaction, "Updating the osu!droid score tracking system's entries...");
    await TrackingManager.update();

    await InteractionHelper.replySuccess(interaction, "The osu!droid score tracking system's entries have been updated.");
}