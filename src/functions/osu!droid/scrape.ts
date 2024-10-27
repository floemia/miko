import axios from "axios"
import { DroidScore, DroidUser } from "./types"
import { average_color } from "../utils"


const user = async (params: {uid: number, html_data?: any, type?: "basic" | "with_recents" | "with_top_plays", limit?: number}): Promise<DroidUser | undefined> => {
    var html: string
	if (!params.type) params.type = "basic"

    if (!params.html_data){
        const get = await axios.get(`https://osudroid.moe/profile.php?uid=${params.uid}`)
        if (!get.data) return undefined
        html = get.data
    } else {
        html = params.html_data
    }
	if (html.includes("User not found")) return undefined

	if (!params.limit) params.limit = 50
	if (params.limit < 1) params.limit = 1

	const avatar_url = `https://osudroid.moe/user/avatar/${html.match(/(?<=src=".\/user\/avatar\/)(.*?)(?=")/g)![0]}`
    const color = await average_color(avatar_url)
	html = html.replace(/\n/g, '').replace(/ +(?= )/g, '').replace(/> </g, '><')
	const ranks = html.match(/(?<=<a>)(.*?)(?=<\/a>)/g)
	const technical_data = html.match(/(?<=<td>)(.*?)(?=<\/td>)/g)
    return {
        username: html.match(/(?<=<a style="margin-top: 15px; color: #EB2F96;">)(.*?)(?=<\/a>)/g)![0],
        avatar_url: avatar_url,
        color: color.hex,
        id: params.uid,
		country: ranks![0],
        rank: {
            score: Number(ranks![1].replace("#", "")),
            dpp: Number(ranks![2].replace("#", ""))
        },
		total_score: Number(technical_data![1].replace(/,/g, '')),
        dpp: Number(technical_data![3].replace(",", '').replace("pp", '')),
        accuracy: Number(technical_data![5].slice(0, -1)) / 1000,
        playcount: Number(technical_data![7]),
		scores: ["with_top_plays", "with_recents"].includes(params.type) ? await scrape.scores({uid: params.uid, type: params.type == "with_recents" ? "recent" : "best", limit: params.limit}) : undefined
    }
}

const scores = async (params: {uid: number, type: "recent" | "best", html_data?: string, limit?: number}): Promise<DroidScore[] | undefined> => {
	let html: string
	if (!params.html_data){
        const get = await axios.get(`https://osudroid.moe/profile.php?uid=${params.uid}`)
        if (!get.data) return undefined
        html = get.data
    } else {
        html = params.html_data
    }
    const user = await scrape.user({uid: params.uid, html_data: html})
    if (!user) return undefined
	if (!params.limit) params.limit = 50
	if (params.limit < 1) params.limit = 1
	
    
    html = html.replace(/\n/g, '').replace(/ +(?= )/g, '').replace(/> </g, '><')
	.split("Recent Plays</b>")[params.type == "recent" ? 1 : 0]

    const scores = html.match(/(?<=<a class="">)(.*?)(?=<\/span>)/g)
	if (!scores) return []
	if (scores.length > params.limit) scores.length = params.limit

    const scores_arr: DroidScore[] = []
	
    for await (const score of scores) {
        const hash = score.match(/(?<="hash":)(.*?)(?=})/g)![0]
        scores_arr.push({
            fallback_title: score.match(/(?<=<strong class="">)(.*?)(?=<\/strong>)/g)![0],
            rank: score.match(/(?<=\/assets\/img\/ranking-)(.*?)(?=.png")/g)![0],
            score: Number(score.match(/(?<=score: )(.*?)(?= \/ )/g)![0].replace(/,/g, '')),
            embed_color: "#dedede",
            timestamp : new Date(score.match(/(?<=style="margin-left: 50px;">)(.*?)(?= \/)/g)![0]).getTime(),
            scraped_dpp: Number(score.match(/(?<=pp:)(.*?)(?=\/)/g)![0].replace(/ /g, "")),
            mods: score.match(/(?<=mod:)(.*?)(?=\/)/g)![0].replace(/ /g, "").replace("x", '').split(","),
            accuracy: Number(score.match(/(?<=accuracy: )(.*?)(?=%)/g)![0]),
            combo: Number(score.match(/(?<=combo: )(.*?)(?= x)/g)![0]),
            misses: Number(score.match(/(?<=miss: )(.*?)(?=<)/g)![0]),
            hash: hash,
            beatmap: undefined,
			user: user
        })
    }
    return scores_arr
}

export const scrape = { user, scores }