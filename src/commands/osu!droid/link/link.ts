import { SlashCommand } from "@structures/core";
import { SlashCommandBuilder } from "discord.js";
import { DroidBanchoUser } from "@floemia/osu-droid-utils";
import { ColorHelper, DroidHelper, InteractionHelper } from "@utils/helpers";
import { DBManager } from "@utils/managers";
import { ResponseEmbedBuilder, ResponseType } from "@utils/builders";

export const run: SlashCommand["run"] = async (client, interaction, str) => {
	const embed = new ResponseEmbedBuilder()
		.setUser(interaction.user);
		
	const user = await DroidHelper.getUser(interaction);
	if (!user) return interaction.editReply({ embeds: [embed.setType(ResponseType.ERROR).setDescription(str.general.user_dne)] });
	
	const iBancho = user instanceof DroidBanchoUser;
	const sv = iBancho ? client.config.servers.ibancho : client.config.servers.rx;
	const color = await ColorHelper.getAverageColor(user.avatar_url);
	embed.setColor(Number(`0x${color.slice(1)}`))
	.setDescription(str.commands.link.success(user))
	.setFooter({ text: `Server: ${sv.name}`, iconURL: sv.iconURL })
	.setThumbnail(user.avatar_url);
	
	await interaction.editReply({ embeds: [embed] });
	await DBManager.setLinkedUser(interaction.user, user);
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

export const dirname = __dirname;