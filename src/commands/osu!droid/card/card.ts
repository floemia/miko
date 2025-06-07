import { SlashCommand } from "@structures/core";
import { Droid, Embeds } from "@utils";
import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { en, es } from "@locales";
import { card } from "osu-droid-card";

export const run: SlashCommand["run"] = async (client, interaction) => {
	await interaction.deferReply();
	const spanish = interaction.locale.includes("es");
	const str = spanish ? es : en;

	const user = await Droid.getUserFromInteraction(interaction);
	if (!user)
		return interaction.editReply({ embeds: [Embeds.error({ description: str.general.user_dne, user: interaction.user })] });

	const embed_wait = Embeds.process(str.commands.card.generating(user));
	const response = await interaction.editReply({ embeds: [embed_wait] });
	const card_data = await card({ uid: user.id });
	const filename = `${user.username}-${user.id}.png`;
	const attachment = new AttachmentBuilder(card_data!, { name: filename });
	const embed = new EmbedBuilder()
		.setImage(`attachment://${filename}`)
		.setColor(Number(`0x${user.color.slice(1)}`))
		.setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
		.setTimestamp()
		.setFooter({ text: client.user?.displayName!, iconURL: client.user?.displayAvatarURL() });
	await response.edit({ embeds: [embed], files: [attachment] });
}
export const data: SlashCommand["data"] =
	new SlashCommandBuilder()
		.setName("card")
		.setDescription("🔘 (iBancho) Get a profile card from yourself or a player.")
		.setDescriptionLocalization("es-ES", "🔘 (iBancho) Obtener una tarjeta de perfil tuya o de un jugador.")
		.addUserOption(option => option.setName("user")
			.setDescription("The Discord user linked to the osu!droid account.")
			.setDescriptionLocalization("es-ES", "El usuario de Discord vinculado a la cuenta de osu!droid."))
		.addIntegerOption(option => option.setName("uid")
			.setDescription("The UID of the player.")
			.setDescriptionLocalization("es-ES", "El UID del jugador."))
		.addStringOption(option => option.setName("username")
			.setDescription("The username of the player.")
			.setDescriptionLocalization("es-ES", "El nombre de usuario del jugador."))
