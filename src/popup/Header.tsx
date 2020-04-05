import React from "react"
import { GoGear, GoMarkGithub } from "react-icons/go"
import { FaPowerOff } from "react-icons/fa"
import produce from "immer"
import { Config } from "../types"
import "./Header.scss"

type HeaderProps = {
  config: Config,
  setConfig: (newConfig: Config) => void 
}

export function Header(props: HeaderProps) {
  const {config, setConfig} = props 

  return (
    <div className="Header">
      <div 
        className={`toggle ${config.enabled ? "active" : ""}`}
        onClick={() => {
          setConfig(produce(config, d => {
            d.enabled = !d.enabled
          }))
        }}
      >
        <FaPowerOff size="17px"/>
      </div>
      <div title="open options page." onClick={e => {
        chrome.runtime.openOptionsPage()
      }}>
        <GoGear size="20px"/>
      </div>
      <div title="open github page." onClick={e => {
        window.open("https://github.com/polywock/featurePolicyControl", "_blank")
      }}>
        <GoMarkGithub size="18px"/>
      </div>
    </div>
  )
}