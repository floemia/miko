import { SlashCommand } from "@structures/core";
import { InteractionEmbedBuilder } from "@utils/builders";
import { InteractionHelper } from "@utils/helpers";
import { TrackingManager } from "@utils/managers";

export const tracking_stop: SlashCommand["run"] = async (client, interaction) => {
    if (!TrackingManager.running) return await InteractionHelper.replyError(interaction, "The osu!droid score tracking system is not running.");
    TrackingManager.stop();
    const embed = new InteractionEmbedBuilder(interaction)
        .setMessage("The osu!droid score tracking system has been stopped.")
    
    await InteractionHelper.reply(interaction, { embeds: [embed] });
}