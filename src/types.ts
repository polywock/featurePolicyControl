
export type Config = {
  version: number,
  enabled: boolean,
  darkTheme?: boolean,
  rules: Rule[]
}

export type Rule = {
  key: string,
  enabled: boolean,
  triggerType: "STARTS_WITH" | "REGEX" | "ALL",
  url: string,
  type: "OVERRIDE" | "CLEAR",
  feature: string,
  allowList?: "*" | "'none'" | "'self'"
}