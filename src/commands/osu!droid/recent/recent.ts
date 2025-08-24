import { SlashCommand } from "@structures/core";
import { SlashCommandBuilder } from "discord.js";
import { DroidHelper } from "@utils/helpers";
import { ScoreEmbedBuilder, PaginationRowBuilder, ResponseEmbedBuilder, ResponseType, RowActions } from "@utils/builders";
import { DroidUserNotFound } from "@structures/errors";
import { NoDroidScores } from "@structures/errors/NoDroidScores";
import { DroidRXUser } from "@floemia/osu-droid-utils";

export const run: SlashCommand["run"] = async (client, interaction, str) => {
	let index = (interaction.options.getInteger("index") || 1) - 1;
	const user = await DroidHelper.getUser(interaction);
	if (!user) throw new DroidUserNotFound(str.general.user_dne);
	const embed = new ResponseEmbedBuilder()
		.setType(ResponseType.PROCESS)
		.setDescription(str.commands.recent.generating(user));
	const response = await interaction.editReply({ embeds: [embed] });

	const scores = await user.getRecentScores();
	
	if (scores.length == 0) throw new NoDroidScores(str.general.no_scores(user));

	const row = new PaginationRowBuilder(response)
		.setIndex(index)
		.setLength(scores.length)
		.startTimeout();

	const score_embed = await new ScoreEmbedBuilder()
		.setPlayer(user)
		.setScore(scores[row.index])

	await response.edit({ content: str.commands.recent.message(user, index), embeds: [score_embed], components: [row] });
	row.collector.on("collect", async (i) => {
		await i.deferUpdate();
		if (i.user.id != interaction.user.id || !i.customId.includes(row.ID)) return

		const action = i.customId.split("-")[0] as RowActions;
		row.handleAction(action);
		await score_embed.setScore(scores[row.index])
		await response.edit({ content: str.commands.recent.message(user, row.index), embeds: [score_embed], components: [row] });
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

export const dirname = __dirname;