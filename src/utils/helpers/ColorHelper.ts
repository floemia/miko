import { getAverageColor } from "fast-average-color-node";

export type Color = | 'Red' | 'Orange' | 'Yellow' | 'Green' | 'Blue' | 'Purple' | 'White'

export abstract class ColorHelper {
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

	public static async getAverageColor(imageURL: string | Buffer) {
		try {
			const averageColor = await getAverageColor(imageURL, { defaultColor: [255, 255, 255, 255] });
			return averageColor.hex;
		} catch (error) {
			return "#dedede";

		}
	}
}