

function randomId() {
  return Math.floor(Math.random() * 10000000000).toString()
}

function getDefaultConfig() {
  return {
    version: 1,
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
    triggerType: "STARTS_WITH",
    url: `https://tv.youtube.com`,
    feature: "picture-in-picture",
    allowList: "'none'"
  }
}