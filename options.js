
window.add.addEventListener("click", () => {
  addRule(getDefaultRule())
  persist()
})

chrome.storage.local.get("config", ({config}) => {
  config.rules.forEach(data => {
    addRule(data)
  })
})


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
  if (data.triggerType === "ALL") {
    urlInput.style.visibility = "hidden"
  } 
  stateCheckbox.addEventListener("change", persist, true)

  const matchSelect = document.createElement("select")
  matchSelect.classList.add("v-match")
  matchSelect.innerHTML = `
    <option value="ALL">all urls</option>
    <option value="REGEX">regex</option>
    <option value="STARTS_WITH">starts with</option>`
  matchSelect.value = data.triggerType
  matchSelect.addEventListener("change", () => {
    if (matchSelect.value === "ALL") {
      urlInput.style.visibility = "hidden"
    } else {
      urlInput.style.visibility = "initial"
    }
    persist()
  }, true)

  const allowInput = document.createElement("input")
  allowInput.classList.add("v-allow")
  allowInput.type = "text"
  allowInput.value = data.allowList
  if (data.type === "CLEAR") {
    allowInput.style.visibility = "hidden"
  } 
  allowInput.addEventListener("change", persist, true)

  const actionSelect = document.createElement("select")
  actionSelect.classList.add("v-action")
  actionSelect.innerHTML = `
    <option value="CLEAR">clear</option>
    <option value="OVERRIDE">override</option>`
  actionSelect.value = data.type 
  actionSelect,addEventListener("change", () => {
    if (actionSelect.value === "CLEAR") {
      allowInput.style.visibility = "hidden"
    } else {
      allowInput.style.visibility = "initial"
    }
    persist()
  })

  const featureSelect = featureTemplate.cloneNode(true)
  featureSelect.classList.add("v-feature")
  featureSelect.value = data.feature
  featureSelect.addEventListener("change", persist, true)


  const removeButton = document.createElement("button")
  removeButton.classList.add("icon")
  removeButton.innerHTML = `
    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 12 16" height="23px" width="23px" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"></path></svg>
  `
  removeButton.addEventListener("click", () => {
    rule.remove()
    persist()
  })

  rule.append(stateCheckbox, matchSelect, urlInput, actionSelect, featureSelect, allowInput, removeButton)

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
    allowList: elem.querySelector(".v-allow").value
  }))

  chrome.storage.local.get("config", ({config = getDefaultConfig()}) => {
    config.rules = newRules 
    chrome.storage.local.set({config})
    console.log("PERSISTED")
  })
}