import { Color } from "@utils/Misc";
import { ColorResolvable, User } from "discord.js";

export interface EmbedResponseParameters {
	description: string;
	color?: Color;
	user?: User;
	title?: string;
}