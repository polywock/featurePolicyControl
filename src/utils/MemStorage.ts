import { StorageItems, getStorage } from "./browserUtils";
import debounce from "lodash.debounce"

export class MemStorage {
  items = {} as StorageItems
  loaded = false 
  listeners: Set<(items: StorageItems) => void> = new Set()
  constructor(public notPersist: string[] = []) {
    this.ensureLoaded()
    chrome.runtime.onSuspend?.addListener(this.handleSuspend)
    chrome.runtime.onMessage.addListener(this.handleMessage)
  }
  ensureLoaded = async () => {
    if (!this.loaded) {
      this.items = await getStorage()
      this.loaded = true 
    }
  }
  set = async (items: StorageItems) => {
    await this.ensureLoaded()
    this.items = {...this.items, ...items}
    this.listeners.forEach(fn => {
      fn(this.items)
    })
    chrome.runtime.sendMessage({type: "MS_UPDATE", items: this.items})
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {type: "MS_UPDATE", items: this.items}, resp => { chrome.runtime.lastError })
      }) 
    })
    this.persistThrottled()
  }
  get = async () => {
    await this.ensureLoaded()
    return this.items
  }
  persist = () => {
    const persistableItems: any = {}

    for (let key in this.items) {
      if (!this.notPersist.includes(key)) {
        persistableItems[key] = this.items[key]
      }
    }

    return new Promise((res, rej) => {
      chrome.storage.local.set(this.items, () => res())
    })
  }
  persistThrottled = debounce(this.persist, 3000, {trailing: true, maxWait: 10000})
  handleSuspend = () => {
    this.persist()
  }
  handleMessage = (msg: any, sender: chrome.runtime.MessageSender, reply: (msg: any) => any) => {
    if (msg.type === "MS_GET_STORAGE") {
      this.get().then(items => reply({items}), err => reply({err}))
      return true 
    } else if (msg.type === "MS_SET_STORAGE") {
      this.set(msg.items).then(res => {
        reply({})
      }, err => reply({err}))
      return true 
    } 
  }
}

export function getMemStorage(): Promise<StorageItems> {
  if (window.memStorage) {
    return window.memStorage.get()
  } 
  
  return new Promise((res, rej) => {
    chrome.runtime.sendMessage({type: "MS_GET_STORAGE"}, out => {
      if (out.err) {
        rej(out.err)
      } else {
        res(out.items)
      }
    })
  })
}

export function setMemStorage(items: StorageItems): Promise<void> {
  if (window.memStorage) {
    return window.memStorage.set(items)
  } 

  return new Promise((res, rej) => {
    chrome.runtime.sendMessage({type: "MS_SET_STORAGE", items}, items => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError)
      } else {
        res()
      }
    })
  })
}