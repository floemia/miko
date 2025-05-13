import { UsersDetailsResponse } from "osu-api-extended/dist/types/v2/users_details";
import { osu } from "./functions"
import { Modes_names } from "osu-api-extended";
import { EmbedBuilder } from "discord.js";
import { average_color } from "../utils";
import { client } from "../..";

export const card = async (user: UsersDetailsResponse, mode: Modes_names) => {
	const gamemode_emoji = osu.emoji.mode(mode);
	const color = await average_color(user.avatar_url);
	return new EmbedBuilder()
		.setColor(Number(`0x${color.hex.slice(1)}`))
		.setAuthor({ name: `${user.username}`, iconURL: gamemode_emoji.imageURL() })
		.setImage(`attachment://${user.id}.png`)
		.setTimestamp()
		.setFooter({ text: `${client.user.username} - Design isn't final`, iconURL: client.user.displayAvatarURL({ extension: "png" }) })
}