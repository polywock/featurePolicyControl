

declare global {
  interface Window {
    bgPage?: Window 
  }
}

export type StorageItems = {[key: string]: any}

export function getStorage(): Promise<StorageItems> {
  return new Promise((res, rej) => {
    chrome.storage.local.get(items => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError)
      } else {
        res(items)
      }
      return 
    })
  })
}


export function ensureBackgroundPageLoaded() {
  return new Promise((res, rej) => {
    if (window.bgPage) return
    chrome.runtime.getBackgroundPage(page => {
      if (chrome.runtime.lastError) {
        return rej()
      } 

      window.bgPage = page 
      return res()
    })
  })
}

