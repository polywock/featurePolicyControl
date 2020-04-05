import "regenerator-runtime/runtime"
import React from "react"
import ReactDOM from "react-dom"
import { getDefaultConfig, getDefaultRule } from "../defaults"
import produce from "immer"
import { useConfig } from "../hooks/useConfig"
import "./options.scss"
import { RuleControl } from "./Rule"
import { ensureBackgroundPageLoaded } from "../utils/browserUtils"


function Options(props: {}) {
  const [config, setConfig] = useConfig()
  
  if (!config) {
    return <span></span>
  }

  if (config.darkTheme) {
    document.documentElement.classList.add("darkTheme")
  } else {
    document.documentElement.classList.remove("darkTheme")
  }
  
  return <div id="App">
    <div className="section options">
      <h2>{"Options"}</h2>
      <div className="fields">
        <div className="field">
          <span>dark theme</span>
          <input type="checkbox" checked={config.darkTheme || false} onChange={e => {
            setConfig(produce(config, d => {
              d.darkTheme = !d.darkTheme
            }))
          }}/>
        </div>
      </div>
    </div>
    <div className="section editor">
      <h2>{"Rules"}</h2>
      <div className="rules">
        {config.rules.map(rule => (
          <RuleControl key={rule.key} rule={rule} setRule={v => {
            setConfig(produce(config, d => {
              const idx = d.rules.findIndex(r => r.key === rule.key)
              v ? d.rules.splice(idx, 1, v) : d.rules.splice(idx, 1)
            }))
          }}/>
        ))}
      </div>
      <button onClick={() => {
        setConfig(produce(config, d => {
          d.rules.push(getDefaultRule())
        }))
      }}>add rule</button>
    </div>
    <div className="section">
      <h2>{"Help"}</h2>
        <div className="card">{"Have issues or a suggestion?"} <a href="https://github.com/polywock/featurePolicyControl/issues">{"Create a new issue on the Github page."}</a></div>
      <div>
        <button style={{marginTop: "20px"}} className="large" onClick={e => {
          setConfig(getDefaultConfig())
        }}>{"Reset"}</button>
      </div>
    </div>
  </div>
}

ensureBackgroundPageLoaded().then(() => {
  ReactDOM.render(<Options/>, document.querySelector("#root"))
})




