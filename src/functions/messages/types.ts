export type ColorType = "text" | "variable" | "error"
export type EmbedType = "success" | "neutral" | "error" | "warn"


export const ThemeColors = {
    text: "#ff8e4d",
    variable: "#ff624d",
    error: "#f5426c"
}

export const EmbedColors = {
    success: {
        color: "43B581",
        emoji: "<:greencheck:900148615677358090>"
    },
    neutral: {
        color: "dedede",
        emoji: "<:graycheck:903741976061567027>"
    },
    error: {
        color: "f5426c",
        emoji: "<:redx:900142062568079460>"
    },
    warn: {
        color: "f5426c",
        emoji: "<:redwarn:903008123550335046>"
    }
}