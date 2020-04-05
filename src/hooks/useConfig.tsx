import { useState, useEffect, useCallback, useMemo } from "react"
import { getDefaultConfig } from "../defaults"
import { getConfigOrDefault } from "../utils/configUtils"
import { Config } from "../types"
import { setMemStorage } from "../utils/MemStorage"

export function useConfig(): [Config, (config: Config) => void] {
  const [config, _setConfig] = useState(null as Config)
  const env = useMemo(() => ({} as {latestSet?: number}), [])

  useEffect(() => {
    getConfigOrDefault().then(config => {
      _setConfig(config)
    })

    chrome.runtime.onMessage.addListener((msg, sender, reply) => {
      if (msg.type === "MS_UPDATE") {
        if (new Date().getTime() - env.latestSet < 250) return 
        _setConfig(msg.items["config"] || getDefaultConfig())
      }
    })
  }, [])

  let setConfig = useCallback((config: Config) => {
    _setConfig(config)
    env.latestSet = new Date().getTime()
    setMemStorage({config})
  }, [])

  return [config, setConfig] 
}