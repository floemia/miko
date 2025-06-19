import { SlashCommand } from "@structures/core";
import { Droid, Embeds, PaginationRowBuilder } from "@utils";
import { SlashCommandBuilder } from "discord.js";
import { en, es } from "@locales";
import { DroidBanchoUser, DroidRXUser } from "miko-modules";
export const run: SlashCommand["run"] = async (client, interaction) => {
	await interaction.deferReply();
	const spanish = interaction.locale.includes("es");
	const str = spanish ? es : en;
	let page = 0;
	let user: DroidBanchoUser | DroidRXUser | undefined;
	try {
		user = await Droid.getUserFromInteraction(interaction);
	} catch (error: any) {
		return await interaction.editReply({ embeds: [Embeds.error({ description: `${error.message}`, user: interaction.user, title: str.general.error })] });
	}

	if (!user)
		return interaction.editReply({ embeds: [Embeds.error({ description: str.general.user_dne, user: interaction.user, title: str.general.error })] });

	const embed_wait = Embeds.process(str.commands.top.generating(user));
	const response = await interaction.editReply({ embeds: [embed_wait] });

	const scores = await user.scores.top();
	if (scores.length == 0)
		return interaction.editReply({ embeds: [Embeds.error({ description: str.general.no_scores(user), user: interaction.user })] });

	const max_pages = Math.ceil(scores.length / 5);
	const row = new PaginationRowBuilder(response)
		.setIndex(page)
		.setLength(max_pages)
		.startTimeout();
	const embed = await Embeds.top(user, scores, page);
	await response.edit({ embeds: [embed], components: [row] });
	row.collector.on("collect", async (i) => {
		await i.deferUpdate();
		if (i.user.id != interaction.user.id || !i.customId.includes(row.ID)) return
		const action = i.customId.split("-")[0] as "first" | "back" | "next" | "last";
		row.handleAction(action);
		const embed = await Embeds.top(user, scores, row.index);
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

export const dirname = __dirname;