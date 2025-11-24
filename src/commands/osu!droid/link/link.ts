import { SlashCommand } from "@structures/core";
import { SlashCommandBuilder } from "discord.js";
import { DroidBanchoUser } from "@floemia/osu-droid-utils";
import { ColorHelper, DroidHelper, InteractionHelper } from "@utils/helpers";
import { DatabaseManager } from "@utils/managers";
import { InteractionEmbedBuilder } from "@utils/builders";
import { Config } from "@core/Config";

export const run: SlashCommand["run"] = async (client, interaction) => {
	const t = InteractionHelper.getLocale(interaction);
	const user = await DroidHelper.getUser(interaction);
	if (!user) return

	const iBancho = user instanceof DroidBanchoUser;
	const server = iBancho ? Config.servers.ibancho : Config.servers.rx;
	const color = await ColorHelper.getAverageColor(user.avatar_url)

	const embed = new InteractionEmbedBuilder(interaction)
		.setMessage(t.commands.link.responses.ok(user))
		.setThumbnail(user.avatar_url)
		.setFooter({ text: server.name, iconURL: server.iconURL })
		.setColor(color);
	
	await InteractionHelper.reply(interaction, { embeds: [embed], ephemeral: true });
	await DatabaseManager.setLinkedUser(interaction.user, user);
}

export const data: SlashCommand["data"] =
	new SlashCommandBuilder()
		.setName("link")
		.setDescription("Link your Discord to an osu!droid account.")
		.setDescriptionLocalization("es-ES", "Vincula tu Discord a una cuenta de osu!droid.")
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