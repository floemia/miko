import { SlashCommand } from "@structures/core";
import { DatabaseManager } from "@utils/managers";
import { InteractionHelper } from "@utils/helpers";

export const status: SlashCommand["run"] = async (client, interaction) => {
	const t = InteractionHelper.getLocale(interaction);
	const enabled = interaction.options.getString("status", true) == "enabled";
	await DatabaseManager.setTrackingStatus(interaction.guild!, enabled);
	await InteractionHelper.replySuccess(interaction, t.commands.config.track.status(enabled));
}