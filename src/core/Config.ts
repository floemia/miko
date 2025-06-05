import config from "../../config.json";
import { ConfigFile } from "@core";
export abstract class Config {
	public config: ConfigFile = config;
}