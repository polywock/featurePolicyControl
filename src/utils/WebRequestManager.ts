import { Config, Rule } from "../types"
import { StorageItems } from "./browserUtils"
import { getDefaultConfig } from "../defaults"

export class WebRequestManager {
  config: Config
  attached = false 
  rules: (Rule & {regex: RegExp})[]
  constructor() {
    window.memStorage.get().then(items => {
      this.handleStorageChange(items)
    })
    window.memStorage.listeners.add(this.handleStorageChange)
  }
  release = () => {
    chrome.webRequest.onHeadersReceived.removeListener(this.handleHeadersReceived)
  }
  handleHeadersReceived = (details: chrome.webRequest.WebResponseHeadersDetails) => {
    let newHeaders: chrome.webRequest.HttpHeader[] = []
    let featurePolicies: {feature: string, allowList: string[]}[] = []

    details.responseHeaders.forEach(header => {
      if (header.name.trim().toLowerCase() !== "feature-policy") {
        newHeaders.push({name: header.name, value: header.value, binaryValue: header.binaryValue})
      } else {
        featurePolicies = [...featurePolicies, ...fpParser(header.value.trim())]
      }
    })

    let flag = false 
    this.rules.filter(v => v.enabled).forEach(rule => {
      if (rule.triggerType === "STARTS_WITH") {
        if (!details.url.startsWith(rule.url)) return 
      } else if (rule.triggerType === "REGEX") {
        if (!rule.regex.test(details.url)) return 
      }

      let ogCount = featurePolicies.length

      featurePolicies = featurePolicies.filter(fp => fp.feature !== rule.feature)
      if (rule.type === "CLEAR") {
        if (featurePolicies.length < ogCount) {
          flag = true 
        }
      } else  {
        flag = true 
        featurePolicies.push({feature: rule.feature, allowList: [rule.allowList || "'none'"]})
      }
    })

    if (!flag) return 
    if (featurePolicies.length > 0) {
      newHeaders.push({
        name: "feature-policy",
        value: featurePolicies.map(f => [f.feature, ...f.allowList].join(" ")).join(";")
      })
    }

    return {
      responseHeaders: newHeaders
    } as chrome.webRequest.BlockingResponse
  }
  attach = () => {
    if (this.attached) return 
    this.attached = true 
    chrome.webRequest.onHeadersReceived.addListener(this.handleHeadersReceived, {
      urls: ["https://*/*", "http://*/*"],
      types: ['main_frame']
    }, ['blocking', 'responseHeaders'])
  }
  detach = () => {
    if (!this.attached) return 
    chrome.webRequest.onHeadersReceived.removeListener(this.handleHeadersReceived)
    this.attached = false 
  }
  handleStorageChange = (items: StorageItems) => {
    this.config = (items["config"] as Config) || getDefaultConfig()
    this.rules = this.config.rules.map(rule => ({
      ...rule,
      regex: rule.triggerType === "REGEX" ? new RegExp(rule.url, "i") : null  
    }))
    if (this.config.enabled && this.config.rules.length) {
      this.attach()
    } else {
      this.detach()
    }
  }
}

function fpParser(value: string) {
  value = value.trim() 
  if (value.length === 0) return []
  return value.split(";").map(v => {
    let [feature, ...allowList] = v.trim().split(/\s+/)
    return {feature, allowList}
  })
}