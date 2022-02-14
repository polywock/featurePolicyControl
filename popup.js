
window.state.addEventListener("click", () => {
  chrome.storage.local.get("config", ({config}) => {
    config.enabled = !config.enabled
    sync(config.enabled)
    chrome.storage.local.set({config})
  })
})

window.options.addEventListener("click", () => {
  chrome.runtime.openOptionsPage()
})
window.github.addEventListener("click", () => {
  window.open("https://github.com/polywock/featurePolicyControl", "_blank")
})

function sync(enabled) {
  if (enabled) {
    window.state.setAttribute("active", "")
  } else {
    window.state.removeAttribute("active")
  }
}

chrome.storage.local.get("config", ({config}) => {
  sync(config.enabled)
})