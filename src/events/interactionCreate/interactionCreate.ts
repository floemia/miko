import { Event } from "@structures/core";
import { InteractionHelper } from "@utils/helpers";
import { ResponseEmbedBuilder, ResponseType } from "@utils/builders";
import { Logger } from "@utils/logger";
import { MikoError } from "@structures/errors";
export const name = "interactionCreate";
export const run: Event<"interactionCreate">["run"] = async (client, interaction) => {
	if (interaction.isChatInputCommand()) {
		const str = InteractionHelper.getLocaleResponses(interaction);
		const embed = new ResponseEmbedBuilder()
			.setUser(interaction.user);

		const cooldowns = client.cooldowns;
		const now = new Date();
		const command = client.commands.get(interaction.commandName) || client.dev_commands.get(interaction.commandName);
		if (!command) return;
		if (command.disabled) {
			embed.setType(ResponseType.ERROR)
				.setDescription(str.general.disabled);
			return interaction.reply({ embeds: [embed] });
		}
		if (command.developer && !client.config.developers.includes(interaction.user.id)) {
			embed.setType(ResponseType.ERROR)
				.setDescription(str.general.dev_only);
			return interaction.reply({ embeds: [embed] });
		}
		const cd = command.cooldown ?? 5;
		if (!cooldowns.has(command.data.name)) {
			client.cooldowns.set(command.data.name, []);
		}

		const cdList = cooldowns.get(command.data.name)!;
		const userCD = cdList.find(cd => cd.user_id === interaction.user.id);
		if (userCD) {
			const expiresAt = new Date(userCD.executed_at.getTime() + cd * 1000);
			if (expiresAt > now) {
				const timeLeft = (expiresAt.getTime() - now.getTime()) / 1000;
				embed.setType(ResponseType.ERROR).setDescription(str.general.cooldown(timeLeft));
				return interaction.reply({
					embeds: [embed],
					flags: "Ephemeral",
				});
			} else {
				userCD.executed_at = now;
			}
		} else {
			cdList.push({
				user_id: interaction.user.id,
				executed_at: now
			});
		}
		try {
			await interaction.deferReply();
			await command.run(client, interaction, str);
		} catch (error: any) {
			if (error instanceof MikoError) {
				embed.setType(ResponseType.ERROR).setDescription(`\`${error.message}\``);
			}
			else {
				Logger.err({ prefix: "[SC]", message: `An error has occurred while running the command /${command.data.name}.`, color: "Red", important: true });
				Logger.err({ prefix: "[SC]", message: `${error.stack}`, color: "Red" });
				embed.setType(ResponseType.ERROR).setDescription(str.general.error);
			}
			if (interaction.replied || interaction.deferred) {
				await interaction.editReply({ embeds: [embed] });
			} else {
				await interaction.reply({ embeds: [embed] });
			}
		}
	}
}

