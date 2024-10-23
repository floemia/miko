import { getAverageColor } from "fast-average-color-node"

export const average_color = async (url: string) => {
	try {
        const average = await getAverageColor(url)
        return average
    } catch(error) {
        return{
			rgb: "rgb(222,222,222)",
			rgba: "rgba(222,222,222,1)",
			hex: "#dedede",
			hexa: "#dededeff",
			value: [222,222,222,1],
			isDark: false,
			isLight: true,
		}
	}
}