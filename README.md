# Feature Policy Control
Override Feature-Policy response headers depending on the URL. 

To use, install the [Chrome](), or [Edge]() extension. 

If it doesn't work, try disabling other extensions. Only one extension can modify response headers. 

## Use cases
- Bypass Picture-in-Picture blocking for websites like YoutubeTV.  
   - I've made a separate extension just for this. PiP Unblocker (use one or the either, not both)
- Disable scripts on certain URLS. 
- Feature-Policy is a relatively new feature, so expect more use cases in the future. 


## Build 
1. `npm install` to install required dependencies. 
1. `npm run build:dev` build unpacked version. 
1. Load the unpacked folder
   1. Chrome: open extensions page, enable dev mode, load unpacked. 
   1. Edge: open extensions page, load unpacked.
