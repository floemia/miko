import { client } from "../..";

export const int_short_gamemode = (int: number) =>  {
    switch (int) {
        case 1: return "osu"; break
        case 2: return "taiko"; break
        case 3: return "fruits"; break
        case 4: return "mania"; break
        default: return "osu"; break
    }
}
export const int_long_gamemode = (int: number) =>  {
    switch (int) {
        case 0: return "osu!droid"
        case 1: return "osu!";
        case 2: return "osu!taiko"; 
        case 3: return "osu!catch";
        case 4: return "osu!mania";
        default: return "osu";
    }
}

export const difficulty_emoji = (mode: "osu" | "taiko" | "fruits" | "mania", SR: number) => {
    var rank = 1
    if (SR < 1.70) {
        rank = 1
    } else if (SR < 2.7) {
        rank = 2
    } else if (SR < 3.7) {
        rank = 3
    } else if (SR < 4.7) {
        rank = 4
    } else if (SR < 5.7) {
        rank = 5
    } else if (SR < 6.7) {
        rank = 6
    } else if (SR < 7.7) {
        rank = 7
    } else if (SR < 8.7) {
        rank = 8
    } else {
        rank = 9
    }
    const emoji = client.emojis.cache.find(emoji => emoji.name === `${mode}${rank}`)
    return emoji;
}

export const rank_emoji = (rank: string) => {
    switch (rank) {
        case 'A':
            rank = '<:a:954909322503155722>'
            break
        case 'B':
            rank = '<:b_:954909322540879892>'
            break
        case 'C':
            rank = '<:c_:954909322515738654>'
            break
        case 'D':
            rank = '<:d_:954909322117275719>'
            break
        case 'S':
            rank = '<:s_:954909322167599125>'
            break
        case 'SH':
            rank = '<:sh:954909322515738624>'
            break
        case 'X':
            rank = '<:x_:954909954995798066>'
            break
        case 'XH':
            rank = '<:xh:954909954966425631>'
            break
        case 'F':
            rank = '<:F_:966098768908914778>'
            break
    }
    return rank
}