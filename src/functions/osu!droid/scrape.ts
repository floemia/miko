import axios from "axios"
import { getAverageColor } from "fast-average-color-node"
import { DroidScoreScraped, DroidUser } from "./types"


const user = async (uid: number, data?: any): Promise<DroidUser | undefined> => {
    var html
    if (!data){
        const get = await axios.get(`https://osudroid.moe/profile.php?uid=${uid}`)
        if (!get.data) return undefined
        html = get.data
    } else {
        html = data
    }

    const part1 = html.match(/(?<=<a>)(.*?)(?=<\/a>)/g)
    const part2 = html.match(/(?<=<td>)(.*?)(?=<\/td>)/g)
    const part3 = html.match(/(?<=#EB2F96;">)(.*?)(?=<\/a>)/g)

    if (!part1 || !part2 || !part3 || !part3[0]) return undefined
    var color
    try{
        const average = await getAverageColor(`https://osudroid.moe/user/avatar/${uid}.png`)
        color = average.hex
    } catch {
        color = `#dedede`
    }

    return {
        username: part3[0],
        avatar_url: `https://osudroid.moe/user/avatar/${uid}.png`,
        color: color,
        id: uid,
        rank: {
            score: Number(part1[1].substring(1)),
            pp: Number(part1[2].substring(1))
        },
        country: part1[0],
        score: Number(part2[1].replace(/,/g, '')),
        pp: Number(part2[3].slice(0, -2).replace(/,/g, '')),
        accuracy: Number(part2[5].slice(0, -1)) / 1000,
        playcount: Number(part2[7]),
    }
}

const scores = async (params: {uid: number, type: "recent" | "best"}): Promise<DroidScoreScraped[] | undefined> => {
	const uid = params.uid
    const get = await axios.get(`https://osudroid.moe/profile.php?uid=${uid}`)
    if (!get.data) return undefined
    const user = await scrape.user(uid, get.data)
    if (!user) return undefined
    
    const html = get.data.replace(/\n/g, '').split("Recent Plays</b>")[params.type == "recent" ? 1 : 0]
    const scores = html.match(/(?<=class>)(.*?)(?=<\/span>)/g)
	if (!scores) return []
    const scores_arr: DroidScoreScraped[] = []

    for await (const score of scores) {
        const hash = score.match(/(?<="hash":)(.*?)(?=})/g)![0]
        scores_arr.push({
            fallback_title: score.match(/(?<=<strong class>)(.*?)(?=<\/strong>)/g)![0],
            rank: score.match(/(?<=\/assets\/img\/ranking-)(.*?)(?=.png")/g)![0],
            score: Number(score.match(/(?<=score: )(.*?)(?= \/ )/g)![0].replace(/,/g, '')),
            embed_color: "#dedede",
            timestamp : new Date(score.match(/(?<=style="margin-left: 50px;">)(.*?)(?= \/)/g)![0]).getTime(),
            performance:{
                pp: undefined,
                dpp: undefined,
                stars_dr: undefined,
                stars_pc: undefined
            },
            performance_fc :{
                pp: undefined,
                dpp: undefined,
                accuracy: undefined
            },
            scraped_pp: Number(score.match(/(?<=pp:)(.*?)(?=\/)/g)![0].replace(/ /g, "")),
            mods: score.match(/(?<=mod:)(.*?)(?=\/)/g)![0].replace(/ /g, "").replace("x", '').split(","),
            accuracy: Number(score.match(/(?<=accuracy: )(.*?)(?=%)/g)![0]),
            combo: Number(score.match(/(?<=combo: )(.*?)(?= x)/g)![0]),
            misses: Number(score.match(/(?<=miss: )(.*?)(?=<)/g)![0]),
            hash: hash,
            user: user,
            beatmap: undefined
        })
    }
    return scores_arr
}

export const scrape = { user, scores }