import 'regenerator-runtime/runtime'
import { updateBadges} from "./utils/configUtils"
import { MemStorage } from './utils/MemStorage'
import { WebRequestManager } from './utils/WebRequestManager'
import { getDefaultConfig } from './defaults'

declare global {
  interface Window {
    memStorage: MemStorage
    mgr: WebRequestManager
    features: string[]
  }
}

window.features = (document as any).featurePolicy.features()
window.memStorage = new MemStorage()
window.memStorage.listeners.add(items => {
  updateBadges(items["config"] || getDefaultConfig())
})

window.mgr = new WebRequestManager()

chrome.runtime.onStartup.addListener(updateBadges) 



