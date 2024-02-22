let gvar = {}

function getDefaultConfig() {
  return chrome.runtime.sendMessage({type: "GET_DEFAULT_CONFIG"})
}

function getDefaultRule() {
  return chrome.runtime.sendMessage({type: "GET_DEFAULT_RULE"})
}

window.add.addEventListener("click", async () => {
  addRule(await getDefaultRule())
  persist()
})

window.reset.addEventListener("click", async () => {
  chrome.storage.local.set({config: await getDefaultConfig()}, () => {
    reload()
  })
})

function reload() {
  window.rules.innerHTML = ""
  chrome.storage.local.get("config", ({config}) => {
    config.rules.forEach(data => {
      addRule(data)
    })
  })
}

reload()


const featureTemplate = document.createElement("select")
document.featurePolicy.features().forEach(v => {
  const option = document.createElement("option")
  option.value = v 
  option.textContent = v 
  featureTemplate.appendChild(option)
})

function addRule(data) {
  const rule = document.createElement("div")
  rule.dataset.key = data.key

  const stateCheckbox = document.createElement("input")
  stateCheckbox.classList.add("v-state")
  stateCheckbox.type = "checkbox"
  stateCheckbox.checked = data.enabled 
  stateCheckbox.addEventListener("change", persist, true)

  const urlInput = document.createElement("input")
  urlInput.classList.add("v-url")
  urlInput.type = "text"
  urlInput.value = data.url 
  stateCheckbox.addEventListener("change", persist, true)

  const matchSelect = document.createElement("select")
  matchSelect.classList.add("v-match")
  matchSelect.innerHTML = `
    <option value="ALL">all urls</option>
    <option value="CONTAINS">contains</option>
    <option value="STARTS_WITH">starts with</option>`
  matchSelect.value = data.triggerType
  matchSelect.sync = () => {
    if (matchSelect.value === "ALL") {
      urlInput.style.visibility = "hidden"
    } else {
      urlInput.style.visibility = "initial"
    }
  }

  matchSelect.addEventListener("change", () => {
    matchSelect.sync() 
    persist()
  }, true)

  const actionSelect = document.createElement("select")
  actionSelect.classList.add("v-action")
  actionSelect.innerHTML = `
    <option value="CLEAR">unblock all</option>
    <option value="OVERRIDE">block feature</option>
    <option value="HEADER_REMOVE">remove header</option>
    <option value="HEADER_SET">override header</option>
    <option value="HEADER_APPEND">add header</option>
  `
  actionSelect.value = data.type 
  actionSelect.sync = () => {
    let flagHeaderName = false
    let flagHeaderValue = false
    let flagFeatureSelect = false 
    

    if (actionSelect.value === "OVERRIDE") {
      flagFeatureSelect = true 
    } else if (actionSelect.value === "HEADER_REMOVE") {
      flagHeaderName = true 
    } else if (actionSelect.value === "HEADER_SET" || actionSelect.value === "HEADER_APPEND") {
      flagHeaderName = true
      flagHeaderValue = true 
    } 

    featureSelect.style.display = flagFeatureSelect ? "initial" : "none"
    headerNameInput.style.display = flagHeaderName ? "initial" : "none"
    headerValueInput.style.display = flagHeaderValue ? "initial" : "none"
  }
  
  actionSelect,addEventListener("change", () => {
    actionSelect.sync()
    persist()
  })


  const featureSelect = featureTemplate.cloneNode(true)
  featureSelect.classList.add("v-feature")
  featureSelect.value = data.feature
  featureSelect.addEventListener("change", persist, true)

  const headerNameInput = document.createElement("input")
  headerNameInput.classList.add(`v-headerName`)
  headerNameInput.type = "text"
  headerNameInput.placeholder = "header name"
  headerNameInput.value = data.headerName ?? ""
  headerNameInput.addEventListener("change", persist, true)

  const headerValueInput = document.createElement("input")
  headerValueInput.classList.add(`v-headerValue`)
  headerValueInput.type = "text"
  headerValueInput.placeholder = "header value"
  headerValueInput.value = data.headerValue ?? ""
  headerValueInput.addEventListener("change", persist, true)


  const removeButton = document.createElement("button")
  removeButton.classList.add("icon")
  removeButton.innerHTML = `
    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 12 16" height="23px" width="23px" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"></path></svg>
  `
  removeButton.addEventListener("click", () => {
    rule.remove()
    persist()
  })

  const valuesDiv = document.createElement("div")
  valuesDiv.classList.add("values")
  valuesDiv.append(featureSelect, headerNameInput, headerValueInput)

  matchSelect.sync() 
  actionSelect.sync() 

  rule.append(stateCheckbox, matchSelect, urlInput, actionSelect, valuesDiv, removeButton)

  window.rules.appendChild(rule)
}

function persist() {
  const newRules = [...window.rules.children].map(elem => ({
    type: elem.querySelector(".v-action").value,
    key: elem.dataset.key,
    enabled: elem.querySelector(".v-state").checked,
    triggerType: elem.querySelector(".v-match").value,
    url: elem.querySelector(".v-url").value,
    feature: elem.querySelector(".v-feature").value,
    headerName: elem.querySelector(".v-headerName").value,
    headerValue: elem.querySelector(".v-headerValue").value,
  }))

  chrome.storage.local.get("config", ({config = getDefaultConfig()}) => {
    config.rules = newRules 
    chrome.storage.local.set({config})
  })
}