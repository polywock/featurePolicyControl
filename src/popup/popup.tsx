import "regenerator-runtime/runtime"
import ReactDOM from "react-dom"
import React from "react"
import { Header } from "./Header"
import { useConfig } from "../hooks/useConfig"
import "./popup.scss"
import { ensureBackgroundPageLoaded } from "../utils/browserUtils"

ensureBackgroundPageLoaded().then(() => {
  ReactDOM.render(<App/>, document.querySelector("#root"))
})

export function App(props: {}) {
  const [config, setConfig] = useConfig()

  if (!config){
    return <div></div>
  }

  if (config.darkTheme) {
    document.documentElement.classList.add("darkTheme")
  } else {
    document.documentElement.classList.remove("darkTheme")
  }

  return (
    <div id="App">
      <Header config={config} setConfig={setConfig}/>
    </div>
  )
}



