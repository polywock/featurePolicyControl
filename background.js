chrome.dnr = chrome.declarativeNetRequest


chrome.runtime.onInstalled.addListener(async ({reason}) => {
  const config = await migrate()
  chrome.storage.local.set({config})
  update(config)
})

let timeoutId
chrome.storage.onChanged.addListener(() => {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(async () => {
    update((await chrome.storage.local.get('config'))['config'] ?? getDefaultConfig())
  }, 1000)
})


async function update(config) {
  const existing = await chrome.dnr.getDynamicRules()
  await chrome.dnr.updateDynamicRules({
    removeRuleIds: existing.map(r => r.id)
  })

  if (!config.enabled) return 
  let groups = groupRulesByTarget((config.rules ?? []).filter(rule => rule.enabled)) 



  const dyno = groups.map((group, i) => ({
    id: i + 1, 
    priority: group.priority,
    condition: {
      urlFilter: group.filter,
      resourceTypes: [chrome.dnr.ResourceType.MAIN_FRAME, chrome.dnr.ResourceType.SUB_FRAME]
    },
    action: {
      type: chrome.dnr.RuleActionType.MODIFY_HEADERS,
      responseHeaders: group.headers 
    }
  }))


  chrome.dnr.updateDynamicRules({
    addRules: dyno
  })
}

function ruleToUrlFilter(rule) {
  return rule.triggerType === "CONTAINS" ? `*${rule.url}*` : (rule.triggerType === "ALL" ? `*` : `${rule.url}*`)
}


function randomId() {
  return Math.floor(Math.random() * 10000000000).toString()
}

function getDefaultConfig() {
  return {
    version: 2,
    enabled: true,
    rules: [
      getDefaultRule()
    ]
  }
}

function getDefaultRule() {
  return {
    type: "CLEAR",
    key: randomId(),
    enabled: true,
    triggerType: "CONTAINS",
    url: `tv.youtube.com`,
    feature: "picture-in-picture"
  }
}

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg.type === "GET_DEFAULT_RULE") {
    reply(getDefaultRule())
  } else if (msg.type === "GET_DEFAULT_CONFIG") {
    reply(getDefaultConfig() )
  }
})

async function migrate() {
  let config = (await chrome.storage.local.get('config'))["config"] ?? getDefaultConfig()
  if (config.version === 1) {
    config.version = 2 
    config.rules = (config.rules ?? []).filter(rule => rule.triggerType !== "REGEX")

    config.rules.forEach(rule => {
      delete rule.allowList
    })
  }
  const defaultConfig = getDefaultConfig()
  if (config.version !== defaultConfig.version) {
    config = defaultConfig
  }

  return config 
}

function groupRulesByTarget(rules) {
  let ruleMap = {}
  for (let rule of rules) {
    let lowPriority = rule.type === "HEADER_APPEND" || rule.type === "OVERRIDE"
    const key = `${rule.url}--${rule.triggerType}`
    ruleMap[key] = ruleMap[key] ?? {
      headers: [], 
      priority: lowPriority ? 1 : 2,
      filter: ruleToUrlFilter(rule),
    }
    const h = ruleMap[key].headers 
    if (rule.type === "OVERRIDE") {
      h.push({
        header: 'Permissions-Policy',
        operation: chrome.dnr.HeaderOperation.APPEND,
        value: `${rule.feature}=()`
      })
    } else if (rule.type === "CLEAR") {
      h.push(
        {
          header: 'Permissions-Policy',
          operation: chrome.dnr.HeaderOperation.REMOVE,
        },
        {
          header: 'Feature-Policy',
          operation: chrome.dnr.HeaderOperation.REMOVE,
        }
      )
    } else if (rule.type === "HEADER_REMOVE" && rule.headerName) {
      h.push(
        {
          header: rule.headerName,
          operation: chrome.dnr.HeaderOperation.REMOVE,
        }
      )
    } else if (rule.type === "HEADER_SET" && rule.headerName) {
      h.push(
        {
          header: rule.headerName,
          operation: chrome.dnr.HeaderOperation.SET,
          value: rule.headerValue || ""
        }
      )
    } else if (rule.type === "HEADER_APPEND" && rule.headerName) {
      h.push(
        {
          header: rule.headerName,
          operation: chrome.dnr.HeaderOperation.APPEND,
          value: rule.headerValue || "" 
        }
      )
    } 

    if (!h.length) delete ruleMap[key]
  }

  return Object.values(ruleMap)
}