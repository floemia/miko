import { SlashCommand } from "@structures/core";
import { Embeds, Droid, Misc } from "@utils";
import { ComponentType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { DroidBanchoUser, DroidRXUser } from "miko-modules";
import { en, es } from "@locales";
export const run: SlashCommand["run"] = async (client, interaction) => {
	const spanish = interaction.locale.includes("es");
	const str = spanish ? es : en;
	await interaction.deferReply();
	let index = interaction.options.getInteger("index") || 0;
	const user = await Droid.getUserFromInteraction(interaction);
	if (!user)
		return interaction.editReply({ embeds: [Embeds.error({ description: str.general.user_dne, user: interaction.user })] });

	const embed_wait = new EmbedBuilder()
		.setColor("LightGrey")
		.setDescription(`> <:droid_simple:1021473577951821824>  **osu!droid・**${str.commands.recent.generating(user)}`);
	const response = await interaction.editReply({ embeds: [embed_wait] });

	const scores = await user.scores.recent();
	if (scores.length == 0)
		return response.edit({ embeds: [Embeds.error({ description: str.general.no_scores(user), user: interaction.user })] });

	const unique = Misc.getUniqueID();
	const row = Misc.createRow(index, unique, scores.length);

	const embed = await Embeds.score({ user: user, score: scores[0] });
	await response.edit({ content: str.commands.recent.message(user, index), embeds: [embed], components: [row] });

	const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button });
	let collector_timeout = Misc.rowTimeout(row, collector, response);

	collector.on("collect", async (i) => {
		await i.deferUpdate();
		if (i.user.id != interaction.user.id) return;
		switch (i.customId) {
			case `backAll-${unique}`:
				index = 0;
				break;
			case `back-${unique}`:
				index--;
				break;
			case `go-${unique}`:
				index++;
				break;
			case `goAll-${unique}`:
				index = scores.length - 1;
				break;
		}
		clearTimeout(collector_timeout);
		collector_timeout = Misc.rowTimeout(row, collector, response);
		if (index < 0) index = scores.length - 1;
		if (index > scores.length - 1) index = 0;
		row.components[0].setDisabled(index == 0 ? true : false)
		row.components[2].setLabel(`${index + 1}/${scores.length}`)
		row.components[4].setDisabled(index == scores.length - 1 ? true : false)
		const embed = await Embeds.score({ user: user, score: scores[index] });
		await response.edit({ content: str.commands.recent.message(user, index), embeds: [embed], components: [row] });
	})
}
export const data: SlashCommand["data"] =
	new SlashCommandBuilder()
		.setName("recent")
		.setDescription("🔘 Get the most recent scores from yourself or a player.")
		.setDescriptionLocalization("es-ES", "🔘 Obtener los úlimos scores tuyos o de un jugador.")
		.addUserOption(option => option.setName("user")
			.setDescription("The Discord user linked to the osu!droid account.")
			.setDescriptionLocalization("es-ES", "El usuario de Discord vinculado a la cuenta de osu!droid."))
		.addIntegerOption(option => option.setName("uid")
			.setDescription("The UID of the player.")
			.setDescriptionLocalization("es-ES", "El UID del jugador."))
		.addStringOption(option => option.setName("username")
			.setDescription("The username of the player.")
			.setDescriptionLocalization("es-ES", "El nombre de usuario del jugador."))
		.addIntegerOption(option => option.setName("index")
			.setDescription("The n-th score to show (1 - 50). Defaults to the most recent score.")
			.setDescriptionLocalization("es-ES", "El n-ésimo score a mostrar (1 - 50). Por defecto, el último score.")
			.setMinValue(1)
			.setMaxValue(50))
		.addStringOption(option => option.setName("server")
			.setDescription("The server to fetch scores from.")
			.setDescriptionLocalization("es-ES", "El servidor desde el cual obtener los scores.")
			.addChoices({ name: "iBancho", value: "ibancho" }, { name: "osudroid!relax", value: "rx" }))
