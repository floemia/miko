import { SlashCommand } from "@structures/core";
import { PaginationRowBuilder, ResponseEmbedBuilder, ResponseType, RowActions } from "@utils/builders";
import { SlashCommandBuilder } from "discord.js";
import { ColorHelper, DroidHelper } from "@utils/helpers";
import { DroidUserNotFound } from "@structures/errors";
import { NoDroidScores } from "@structures/errors/NoDroidScores";
import { DroidRXUser } from "@floemia/osu-droid-utils";
import { ScoreListEmbedBuilder } from "@utils/builders/ScoreListEmbedBuilder";

export const run: SlashCommand["run"] = async (client, interaction, str) => {
	const user = await DroidHelper.getUser(interaction);
	if (!user) throw new DroidUserNotFound(str.general.user_dne);

	const embed = new ResponseEmbedBuilder()
		.setUser(interaction.user)
		.setDescription(str.commands.top.generating(user))
		.setType(ResponseType.PROCESS);
	const response = await interaction.editReply({ embeds: [embed] });
	if (user instanceof DroidRXUser) await user.getTopScores();
	const scores = user.scores.top;
	if (scores.length == 0) throw new NoDroidScores(str.general.no_scores(user));

	const max_pages = Math.ceil(scores.length / 5);
	let page = 0;
	const row = new PaginationRowBuilder(response)
		.setIndex(page)
		.setLength(max_pages)
		.startTimeout();

	const color = await ColorHelper.getAverageColor(user.avatar_url);
	const embed_top = new ScoreListEmbedBuilder()
		.setPlayer(user)
		.setScores(scores)
		.setColor(Number(`0x${color.hex.slice(1)}`))
		.setPage(page)

	await response.edit({ embeds: [embed_top], components: [row] });
	row.collector.on("collect", async (i) => {
		await i.deferUpdate();
		if (i.user.id != interaction.user.id || !i.customId.includes(row.ID)) return
		const action = i.customId.split("-")[0] as RowActions;
		row.handleAction(action);
		embed_top.setPage(row.index);
		await response.edit({ embeds: [embed_top], components: [row] });
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

export const dirname = __dirname;