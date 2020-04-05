import { Config } from "../types";
import { getDefaultConfig, standardIcons, grayscaleIcons } from "../defaults";
import { getMemStorage } from "./MemStorage";

export async function getConfig(): Promise<Config> {
  const items = await getMemStorage()
  return items["config"]
}

export async function getConfigOrDefault(): Promise<Config> {
  return (await getConfig()) || getDefaultConfig()
}

let previousEnabled: boolean
export async function updateBadges(config?: Config) {
  config = config || (await getConfigOrDefault())
  if (previousEnabled === config.enabled) return 
  previousEnabled = config.enabled

  return new Promise(res => {
    chrome.browserAction.setIcon({
      path: config.enabled ? standardIcons : grayscaleIcons
    }, () => {
      res()
    })
  })
}