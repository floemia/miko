import { SlashCommand } from "@structures/core";
import { Embeds, Droid } from "@utils";
import { SlashCommandBuilder } from "discord.js";
import { en, es } from "@locales";
import { PaginationRowBuilder } from "@utils";
import { DroidBanchoUser, DroidRXUser } from "miko-modules";
export const run: SlashCommand["run"] = async (client, interaction) => {
	const spanish = interaction.locale.includes("es");
	const str = spanish ? es : en;
	await interaction.deferReply();
	let index = (interaction.options.getInteger("index") || 1) - 1;
	let user: DroidBanchoUser | DroidRXUser | undefined;
	try {
		user = await Droid.getUserFromInteraction(interaction);
	} catch (error: any) {
		return await interaction.editReply({ embeds: [Embeds.error({ description: `${error.message}`, user: interaction.user, title: str.general.error })] });
	}
	if (!user)
		return interaction.editReply({ embeds: [Embeds.error({ description: str.general.user_dne, user: interaction.user, title: str.general.error })] });

	const embed_wait = Embeds.process(str.commands.recent.generating(user));
	const response = await interaction.editReply({ embeds: [embed_wait] });

	const scores = await user.scores.recent();
	if (scores.length == 0)
		return response.edit({ embeds: [Embeds.error({ description: str.general.no_scores(user), user: interaction.user })] });

	const row = new PaginationRowBuilder(response)
		.setIndex(index)
		.setLength(scores.length)
		.startTimeout();

	const embed = await Embeds.score({ user: user, score: scores[0] });
	await response.edit({ content: str.commands.recent.message(user, index), embeds: [embed], components: [row] });
	row.collector.on("collect", async (i) => {
		await i.deferUpdate();
		if (i.user.id != interaction.user.id || !i.customId.includes(row.ID)) return
		const action = i.customId.split("-")[0] as "first" | "back" | "next" | "last";
		row.handleAction(action);

		const embed = await Embeds.score({ user: user, score: scores[row.index] });
		await response.edit({ content: str.commands.recent.message(user, row.index), embeds: [embed], components: [row] });
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