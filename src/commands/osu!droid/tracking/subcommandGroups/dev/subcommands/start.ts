import { SlashCommand } from "@structures/core";
import { InteractionEmbedBuilder } from "@utils/builders";
import { InteractionHelper } from "@utils/helpers";
import { TrackingManager } from "@utils/managers";

export const tracking_start: SlashCommand["run"] = async (client, interaction) => {
    if (TrackingManager.running) return await InteractionHelper.replyError(interaction, "The osu!droid score tracking system is already running.");
    TrackingManager.start();

    await InteractionHelper.replySuccess(interaction, "The osu!droid score tracking system has been started.");

}