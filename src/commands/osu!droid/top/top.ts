import { SlashCommand } from "@structures/core";
import { PaginationRowBuilder, ScoreListEmbedBuilder, RowActions, ScoreListType, InteractionEmbedBuilder } from "@utils/builders";
import { SlashCommandBuilder } from "discord.js";
import { DroidHelper , InteractionHelper } from "@utils/helpers";

export const run: SlashCommand["run"] = async (client, interaction) => {
	const t = InteractionHelper.getLocale(interaction);
	const user = await DroidHelper.getUser(interaction);
	if (!user) return;

	const response = await InteractionHelper.replyProcess(interaction, t.commands.top.responses.process(user));
	const scores = await user.getTopScores();

	if (scores.length == 0) return await InteractionHelper.replyError(interaction, t.general.no_scores);

	const max_pages = Math.ceil(scores.length / 5);
	let page = 0;
	const row = new PaginationRowBuilder(response)
		.setIndex(page)
		.setLength(max_pages)
		.startTimeout();

	const embed_top = await new ScoreListEmbedBuilder()
		.setTitle(`**Top 50 plays**`)
		.setScores(scores)
		.setPage(page)
		.setPlayer(user);

	await InteractionHelper.reply(interaction, { embeds: [embed_top], components: [row] });
	row.collector.on("collect", async (i) => {
		await i.deferUpdate();
		if (i.user.id != interaction.user.id || !i.customId.includes(row.ID)) return
		const action = i.customId.split("-")[0] as RowActions;
		row.handleAction(action);
		embed_top.setPage(row.index);
		await InteractionHelper.reply(interaction, { embeds: [embed_top], components: [row] });
	})
}
export const data: SlashCommand["data"] =
	new SlashCommandBuilder()
		.setName("top")
		.setDescription("🟣 Get the top scores from an osu!droid player.")
		.setDescriptionLocalization("es-ES", "🟣 Obtener los mejores scores de un jugador de osu!droid.")
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