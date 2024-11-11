import axios from "axios"
import { DroidPPBoardUser } from "./types"

const url = "https://droidpp.osudroid.moe/api/ppboard"

export const user = async (uid: number): Promise<DroidPPBoardUser> => {
	const request = await axios.get(`${url}/getuserprofile?uid=${uid}`)
	const user: DroidPPBoardUser = request.data
	console.log(user)
	return user
}

export const droidppboard = { user }