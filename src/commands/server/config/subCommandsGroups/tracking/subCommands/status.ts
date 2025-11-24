import { SlashCommand } from "@structures/core";
import { DatabaseManager } from "@utils/managers";
import { InteractionEmbedBuilder } from "@utils/builders";
import { InteractionHelper } from "@utils/helpers";

export const status: SlashCommand["run"] = async (client, interaction) => {
	const t = InteractionHelper.getLocale(interaction);
	const enabled = interaction.options.getString("status", true) == "enabled";
	const embed = new InteractionEmbedBuilder(interaction)
		.setDescription(t.commands.config.track.status(enabled));
	await interaction.editReply({ embeds: [embed] });
	await DatabaseManager.setTrackingStatus(interaction.guild!, enabled);
}