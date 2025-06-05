import { SlashCommand } from "@structures/core";
import { Droid, Embeds, Misc } from "@utils";
import { ComponentType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { en, es } from "@locales";
export const run: SlashCommand["run"] = async (client, interaction) => {
	await interaction.deferReply();
	const spanish = interaction.locale.includes("es");
	const str = spanish ? es : en;
	let page = 0;
	const user = await Droid.getUserFromInteraction(interaction);
	if (!user)
		return interaction.editReply({ embeds: [Embeds.error({ description: str.general.user_dne, user: interaction.user })] });

	const embed_wait = new EmbedBuilder()
		.setColor("LightGrey")
		.setDescription(`> <:droid_simple:1021473577951821824>  **osu!droid・**${str.commands.top.generating(user)}`);
	const response = await interaction.editReply({ embeds: [embed_wait] });

	const scores = await user.scores.top();
	if (scores.length == 0)
		return interaction.editReply({ embeds: [Embeds.error({ description: str.general.no_scores(user), user: interaction.user })] });

	const unique = Misc.getUniqueID();
	const max_pages = Math.ceil(scores.length / 5);
	const row = Misc.createRow(page, unique, max_pages);
	const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button });
	let collector_timeout = Misc.rowTimeout(row, collector, response);
	const embed = await Embeds.top(user, scores, page);
	await response.edit({ embeds: [embed], components: [row] });
	collector.on("collect", async (i) => {
		await i.deferUpdate();
		if (i.user.id != interaction.user.id) return;
		switch (i.customId) {
			case `backAll-${unique}`:
				page = 0;
				break;
			case `back-${unique}`:
				page--;
				break;
			case `go-${unique}`:
				page++;
				break;
			case `goAll-${unique}`:
				page = max_pages - 1;
				break;
		}
		clearTimeout(collector_timeout);
		collector_timeout = Misc.rowTimeout(row, collector, response);
		if (page < 0) page = max_pages - 1;
		if (page == max_pages) page = 0;
		row.components[0].setDisabled(page == 0 ? true : false);
		row.components[2].setLabel(`${page + 1}/${max_pages}`);
		row.components[4].setDisabled(page == max_pages - 1? true : false);
		const embed = await Embeds.top(user, scores, page);
		await response.edit({ embeds: [embed], components: [row] });
	})
}
export const data: SlashCommand["data"] =
	new SlashCommandBuilder()
		.setName("top")
		.setDescription("🔘 Get the top scores from yourself or a player.")
		.setDescriptionLocalization("es-ES", "🔘 Obtener los mejores scores tuyos o de un jugador.")
		.addUserOption(option => option.setName("user")
			.setDescription("The Discord user linked to the osu!droid account.")
			.setDescriptionLocalization("es-ES", "El usuario de Discord vinculado a la cuenta de osu!droid."))
		.addIntegerOption(option => option.setName("uid")
			.setDescription("The UID of the player.")
			.setDescriptionLocalization("es-ES", "El UID del jugador."))
		.addStringOption(option => option.setName("username")
			.setDescription("The username of the player.")
			.setDescriptionLocalization("es-ES", "El nombre de usuario del jugador."))
		.addStringOption(option => option.setName("server")
			.setDescription("The server to fetch scores from.")
			.setDescriptionLocalization("es-ES", "El servidor desde el cual obtener los scores.")
			.addChoices({ name: "iBancho", value: "ibancho" }, { name: "osudroid!relax", value: "rx" }))