import { RGBColor } from "@rian8337/osu-base";
import { getAverageColor } from "fast-average-color-node";
/**
 * Utility class for color operations.
 */
export abstract class ColorHelper {
    /**
     * Converts a hex color to a number.
     * @param hex The hex color.
     * @returns The number representation of the hex color.
    */
    static hexToNumber(hex: string): number {
        return parseInt(hex.replace("#", ""), 16);
    }

    static async getAverageColor(source: string | Buffer<ArrayBufferLike>): Promise<number> {
        try {
            const color = await getAverageColor(source);
            return this.hexToNumber(color.hex);
        } catch (error: any) {
            return 0xFFFFFF;
        }
    }

    static rgbToNumber(color: RGBColor): number {
        return (color.r << 16) + (color.g << 8) + color.b;
    }

}