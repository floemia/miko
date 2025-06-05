import { Event } from "@structures/core";
import { Embeds, Logger } from "@utils";
import { en, es } from "@locales";
export const name = "interactionCreate";
export const run: Event<"interactionCreate">["run"] = async (client, interaction) => {
	if (interaction.isChatInputCommand()) {
		const spanish = interaction.locale.includes("es");
		const str = spanish ? es : en;
		const cooldowns = client.cooldowns;
		const now = new Date();
		const command = client.commands.get(interaction.commandName);
		if (!command) return;
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
				const embed = Embeds.error({
					description: str.general.cooldown(timeLeft),
					user: interaction.user
				});
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
			await command.run(client, interaction);
		} catch (error: any) {
			Logger.err({ prefix: "[SC]", message: `An error has occurred while running the command /${command.data.name}.`, color: "Red", important: true });
			Logger.err({ prefix: "[SC]", message: `${error.stack}`, color: "Red" });

			const embed = Embeds.error({
				title: str.general.error,
				description: `\`${error}\``,
				user: interaction.user
			});
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ embeds: [embed] });
			} else {
				await interaction.reply({ embeds: [embed] });
			}
		}
	}
}

