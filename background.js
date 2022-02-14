
chrome.runtime.onInstalled.addListener(({reason}) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.storage.local.set({config: getDefaultConfig()})
  }
})

class WebRequestManager {
  attached = false 
  constructor() {
    chrome.storage.local.get("config", ({config = getDefaultConfig()}) => {
      this.config = config
      this.handleConfigChange()
    })
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "local") return 
      const newConfig = changes.config?.newValue
      if (!newConfig) return 
      this.config = newConfig
      this.handleConfigChange()
    })
  }
  release = () => {
    chrome.webRequest.onHeadersReceived.removeListener(this.handleHeadersReceived)
  }
  handleHeadersReceived = (details) => {
    let newHeaders = []
    let featurePolicies = []

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

    return {responseHeaders: newHeaders}
  }
  attach = () => {
    if (this.attached) return 
    speechSynthesis.speak(new SpeechSynthesisUtterance("YES"))
    this.attached = true 
    chrome.webRequest.onHeadersReceived.addListener(this.handleHeadersReceived, {
      urls: ["https://*/*", "http://*/*"],
      types: ['main_frame']
    }, ['blocking', 'responseHeaders'])
  }
  detach = () => {
    if (!this.attached) return 
    speechSynthesis.speak(new SpeechSynthesisUtterance("NO"))
    chrome.webRequest.onHeadersReceived.removeListener(this.handleHeadersReceived)
    this.attached = false 
  }
  handleConfigChange = () => {
    chrome.browserAction.setIcon({path: this.config.enabled ? {"128": "icon128.png"} : {"128": "icon128_grayscale.png"}})
    this.rules = this.config.rules.map(rule => ({
      ...rule,
      regex: rule.triggerType === "REGEX" ? new RegExp(rule.url, "i") : null  
    }))
    if (this.config.enabled && this.config.rules.filter(v => v.enabled).length) {
      this.attach()
    } else {
      this.detach()
    }
  }
}

function fpParser(value) {
  value = value.trim() 
  if (value.length === 0) return []
  return value.split(";").map(v => {
    let [feature, ...allowList] = v.trim().split(/\s+/)
    return {feature, allowList}
  })
}


window.mgr = new WebRequestManager()