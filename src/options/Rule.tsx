import React from "react"
import { Rule } from "../types"
import { GoX } from "react-icons/go"
import produce from "immer"
import "./Rule.scss"

type RuleControlProps = {
  rule: Rule,
  setRule: (rule: Rule) => void
}

export function RuleControl(props: RuleControlProps) {
  const { rule } = props
  return <div className={`Rule ${rule.enabled ? "" : "disabled"}`}>
    <input type="checkbox" checked={rule.enabled} onChange={e => {
      props.setRule(produce(rule, d => {
        d.enabled = !d.enabled
      }))
    }}/>
    <select value={rule.triggerType} onChange={e => {
      props.setRule(produce(rule, d => {
        d.triggerType = e.target.value as any
      }))
    }}>
      <option value="ALL">all urls</option>
      <option value="REGEX">regex</option>
      <option value="STARTS_WITH">starts with</option>
    </select>
    {rule.triggerType === "ALL" ? <div/> : (
      <input type="text" value={rule.url} onChange={e => {
        props.setRule(produce(rule, d => {
          d.url = e.target.value
        }))
      }}/>
    )}
    <select value={rule.type} onChange={e => {
        props.setRule(produce(rule, d => {
          d.type = e.target.value as any
        })) 
      }}>
      <option key={"CLEAR"} value="CLEAR">clear</option>
      <option key={"OVERRIDE"} value="OVERRIDE">override</option>
    </select>
    <select value={rule.feature} onChange={e => {
        props.setRule(produce(rule, d => {
          d.feature = e.target.value
        })) 
      }}>
      {window.bgPage.features.map((feature: string) => (
        <option key={feature} value={feature}>{feature}</option>
      ))}
    </select>
    {rule.type === "CLEAR" ? <div/> : (
      <select value={rule.allowList} onChange={e => {
        props.setRule(produce(rule, d => {
          d.allowList = e.target.value as any 
        })) 
      }}>
        <option key={"'none'"} value="'none'">{"none"}</option>
        <option key={"*"} value="*">{"all"}</option>
        <option key={"'self'"} value="'self'">{"self"}</option>
      </select>
    )}
    <button className="icon" onClick={e => props.setRule(null)}>
      <GoX size="23px"/>
    </button>
  </div>
}