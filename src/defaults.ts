
import { Config, Rule } from "./types"
import { uuidLowerAlpha } from "./utils/helper"

export function getDefaultConfig(): Config {
  return {
    version: 1,
    enabled: true,
    rules: [
      {
        type: "CLEAR",
        key: uuidLowerAlpha(16),
        enabled: true,
        triggerType: "STARTS_WITH",
        url: `https://tv.youtube.com`,
        feature: "picture-in-picture",
        allowList: "'none'"
      },
      {
        type: "OVERRIDE",
        key: uuidLowerAlpha(16),
        enabled: true,
        triggerType: "STARTS_WITH",
        url: `https://www.nytimes.com`,
        feature: "scripts",
        allowList: "'none'"
      }
    ]
  }
}

export function getDefaultRule(): Rule {
  return {
    type: "CLEAR",
    key: uuidLowerAlpha(16),
    enabled: true,
    triggerType: "STARTS_WITH",
    url: `https://tv.youtube.com`,
    feature: "picture-in-picture",
    allowList: "'none'"
  }
}

export const standardIcons = {
  "128": `icon128.png`
}

export const grayscaleIcons = {
  "128": `icon128_grayscale.png`
}