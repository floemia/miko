import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, InteractionCollector, Message } from "discord.js";
import { Color } from "@utils/Misc";

export abstract class Misc {
	public static getHexColor(color: Color): string {
		switch (color) {
			case "Red":
				return "#FF0000";
			case "Orange":
				return "#FFA500";
			case "Yellow":
				return "#FFFF00";
			case "Green":
				return "#00FF00";
			case "Blue":
				return "#0000FF";
			case "Purple":
				return "#800080";
			case "White":
				return "#FFFFFF";
			default:
				return "#FFFFFF";
		}
	}

	public static getCircleEmoji(color: Color) {
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

	public static formatDate(date: Date): string {
		return date.toLocaleString("es-ES", {
			month: "numeric",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "numeric",
			second: "numeric"
		});
	}

	public static createTimer() {
		const start = Date.now();
		return () => ((Date.now() - start) / 1000);
	};

	public static msToTime(ms: number) {
		let str = ""
		const seconds = Math.floor((ms / 1000) % 60);
		const minutes = Math.floor((ms / (1000 * 60)) % 60);
		const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
		const days = Math.floor(ms / (1000 * 60 * 60 * 24));
		if (days > 0) str += `${days}d `;
		if (hours > 0) str += `${hours}h `;
		if (minutes > 0) str += `${minutes}m `;
		if (seconds > 0) str += `${seconds}s `;
		return str.trim();
	}
	
	public static formatFloat(number?: number | null) {
		if (!number) return "";
		return number.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	public static formatInteger(number?: number | null) {
		if (!number) return "";
		return number.toLocaleString("en-US");
	}

	public static to2Dec(number: number) {
		return number.toLocaleString("en-US", { maximumFractionDigits: 2 });
	}

	public static pagination(list: any[], page: number, elements_per_page: number) {
		if (!list.length) return []
		const start = elements_per_page * page;
		const end = start + elements_per_page;
		return list.slice(start, end);
	}
}