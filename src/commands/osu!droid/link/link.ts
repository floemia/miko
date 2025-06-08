import { SlashCommand } from "@structures/core";
import { Embeds } from "@utils";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { DroidBanchoUser, DroidRXUser } from "miko-modules";
import { en, es } from "@locales";
export const run: SlashCommand["run"] = async (client, interaction) => {
	const spanish = interaction.locale.includes("es");
	const str = spanish ? es : en;

	await interaction.deferReply();
	const uid = interaction.options.getInteger("uid") || undefined;
	const username = interaction.options.getString("username") || undefined;
	const server = interaction.options.getString("server") || "ibancho";
	const iBancho = server == "ibancho";
	const Request = iBancho ? DroidBanchoUser : DroidRXUser;
	const user = await Request.get({ uid: uid, username: username });
	if (!user) return interaction.editReply({ embeds: [Embeds.error({ description: str.general.user_dne, user: interaction.user })] });
	await client.db.user.link(user, interaction.user.id);

	const sv = iBancho ? client.config.servers.ibancho : client.config.servers.rx;
	const embed = new EmbedBuilder()
		.setColor(Number(`0x${user.color.slice(1)}`))
		.setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
		.setDescription(`> ${str.commands.link.success(user)}`)
		.setFooter({ text: `Server: ${sv.name}`, iconURL: sv.iconURL })
		.setThumbnail(user.avatar_url)
		.setTimestamp();
	await interaction.editReply({ embeds: [embed] });
}

export const data: SlashCommand["data"] =
	new SlashCommandBuilder()
		.setName("link")
		.setDescription("🔘 Link your Discord account to an osu!droid user.")
		.setDescriptionLocalization("es-ES", "🔘 Vincula tu cuenta de Discord a un usuario de osu!droid.")
		.addIntegerOption(option => option.setName("uid")
			.setDescription("The UID of the player.")
			.setDescriptionLocalization("es-ES", "El UID del jugador."))
		.addStringOption(option => option.setName("username")
			.setDescription("The username of the player.")
			.setDescriptionLocalization("es-ES", "El username del jugador."))
		.addStringOption(option => option.setName("server")
			.setDescription("The server of the player.")
			.setDescriptionLocalization("es-ES", "El servidor del jugador.")
			.addChoices({ name: "iBancho", value: "ibancho" }, { name: "osudroid!relax", value: "rx" }))