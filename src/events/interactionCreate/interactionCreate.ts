import { Event } from "@structures/core";
import { InteractionHelper } from "@utils/helpers";
import { InteractionEmbedBuilder } from "@utils/builders";
import { Config } from "@core/Config";
import { CooldownHandler } from "@handlers";


export const name = "interactionCreate";

export const run: Event<"interactionCreate">["run"] = async (client, interaction) => {

	// is a slash command!
	if (interaction.isChatInputCommand()) {
		const t = InteractionHelper.getLocale(interaction);
		const command = client.commands.get(interaction.commandName) || client.dev_commands.get(interaction.commandName);
		if (!command) return;
		CooldownHandler.addCommand(command);
		const time_left = CooldownHandler.timeLeft(command, interaction.user);
		if (time_left > 0) return await InteractionHelper.replyError(interaction, t.general.cooldown(time_left));

		try {
			await interaction.deferReply();
			await command.run(client, interaction);
		} catch (error: any) {
			await InteractionHelper.replyError(interaction, error);
		}
	}
}

