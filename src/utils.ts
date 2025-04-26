import * as chalk from 'chalk';
import { Color, LogCreatorParameters } from './types';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import en from './locales/en';
import es from './locales/es';
import { client } from '.';
const languages = { en, es };


export const log = {
	out: (params: LogCreatorParameters) => {
		let date = formatDate(new Date());
		let reset = `\x1b[0m`;
		let color = chalk.hex(getHexColor(params.color));

		params.message.split("\n").forEach(line => {
			if (line.trim()) {
				if (!params.important) console.log(`${color('●')} ${date} ${color.bold(params.prefix)}${chalk.reset(' - ' + line)}`);
				else console.log(`${color('●')} ${date} ${color.bold(params.prefix + ' - ' + line)}${reset}`);
			}
		})
	},

	err: (params: { prefix: string, message: string }) => {
		let date = formatDate(new Date());
		let reset = `\x1b[0m`;
		let color = chalk.hex("#FF0000");
		params.message.split("\n").forEach(line => {
			if (line.trim()) {
				console.error(`${color('●')} ${date} ${color.bold(params.prefix + "[ERROR]")}${chalk.reset(' - ' + line)}`);
			}
		})
	}
}
const formatDate = (date: Date) => {
	const pad = (n: number) => n.toString().padStart(2, '0');

	const day = pad(date.getDate());
	const month = pad(date.getMonth() + 1); // months are 0-based
	const year = pad(date.getFullYear() % 100); // get last 2 digits
	const hours = date.getHours();
	const minutes = pad(date.getMinutes());
	const seconds = pad(date.getSeconds());

	return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const getCircleEmoji = (color: Color) => {
	switch (color.toLowerCase()) {
		case 'red':
			return '🔴';
		case 'orange':
			return '🟠';
		case 'yellow':
			return '🟡';
		case 'green':
			return '🟢';
		case 'blue':
			return '🔵';
		case 'purple':
			return '🟣';
		default:
			return '⚪';
	}
};

const getHexColor = (color: Color) => {
	switch (color.toLowerCase()) {
		case 'red':
			return '#FF0000';
		case 'orange':
			return '#FFA500';
		case 'yellow':
			return '#FFFF00';
		case 'green':
			return '#00FF00';
		case 'blue':
			return '#0000FF';
		case 'purple':
			return '#6C3BAA';
		default:
			return '#FFFFFF';
	}
};

const embeds = {
	error: (params: { description: string, interaction: ChatInputCommandInteraction, spanish: boolean }) => {
		return new EmbedBuilder()
			.setAuthor({ name: `${params.interaction.user.username}`, iconURL: params.interaction.user.displayAvatarURL() })
			.setDescription(`> ${getCircleEmoji("Red")}   ${params.description}`)
			.setFooter({ text: `${client.user.displayName}`, iconURL: client.user.displayAvatarURL() })
			.setColor("Red")
			.setTimestamp()
	},
	warning: (params: { description: string, interaction: ChatInputCommandInteraction, spanish: boolean }) => {
		return new EmbedBuilder()
			.setAuthor({ name: `${params.interaction.user.username}`, iconURL: params.interaction.user.displayAvatarURL() })
			.setDescription(`> ${getCircleEmoji("Yellow")}   ${params.description}`)
			.setFooter({ text: `${client.user.displayName}`, iconURL: client.user.displayAvatarURL() })
			.setColor("Yellow")
			.setTimestamp()
	},
	success: (params: { description: string, interaction: ChatInputCommandInteraction, spanish: boolean }) => {
		return new EmbedBuilder()
			.setAuthor({ name: `${params.interaction.user.username}`, iconURL: params.interaction.user.displayAvatarURL() })
			.setDescription(`> ${getCircleEmoji("Blue")}   ${params.description}`)
			.setFooter({ text: `${client.user.displayName}`, iconURL: client.user.displayAvatarURL() })
			.setColor("Blue")
			.setTimestamp()
	}
}
export const utils = { log, getCircleEmoji, getHexColor, embeds };