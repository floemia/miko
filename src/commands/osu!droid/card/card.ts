import { SlashCommand } from "@structures/core";
import { ResponseEmbedBuilder, ResponseType } from "@utils/builders";
import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import { DroidCard } from "@floemia/osu-droid-card";
import { ColorHelper, DroidHelper } from "@utils/helpers";
import { CacheManager } from "@utils/managers";
import { DroidUserNotFound } from "@structures/errors";

// export const disabled: SlashCommand["disabled"] = true;

export const run: SlashCommand["run"] = async (client, interaction, str) => {
	const user = await DroidHelper.getUser(interaction);
	if (!user) throw new DroidUserNotFound(str.general.user_dne);
	
	const embed = new ResponseEmbedBuilder()
		.setUser(interaction.user)
		.setType(ResponseType.PROCESS)
		.setDescription(str.commands.card.generating(user));
	const response = await interaction.editReply({ embeds: [embed] });

	const inCache = CacheManager.getDroidCard(user);
	let cardBuffer = inCache ?? await DroidCard.create(user);

	const filename = `${user.username}-${user.id}.png`;
	const attachment = new AttachmentBuilder(cardBuffer, { name: filename });
	const color = await ColorHelper.getAverageColor(cardBuffer);
	embed.setType(ResponseType.SUCCESS)
		.setDescription(null)
		.setImage(`attachment://${filename}`)
		.setColor(Number(`0x${color.slice(1)}`))
		.setTimestamp()
		.setFooter({ iconURL: client.user?.displayAvatarURL(), text: `${client.user?.displayName} - beta! May contain errors.`});

	await response.edit({ embeds: [embed], files: [attachment] });
	CacheManager.setDroidCard(user, cardBuffer);
}
export const data: SlashCommand["data"] =
	new SlashCommandBuilder()
		.setName("card")
		.setDescription("🔘 (BETA!) Get a profile card from yourself or a player.")
		.setDescriptionLocalization("es-ES", "🔘 (BETA!) Obtener una tarjeta de perfil tuya o de un jugador.")
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
			.setDescription("The desired server.")
			.setDescriptionLocalization("es-ES", "El servidor deseado.")
			.addChoices({ name: "iBancho", value: "ibancho" }, { name: "osudroid!relax", value: "rx" }))

export const dirname = __dirname;