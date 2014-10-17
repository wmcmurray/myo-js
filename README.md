Details
======
This project contain an API enabling you to use the Myo armband on the web trough the WebSocket API provided by the Myo Connect. It also include a set of plugins and demos !

**Myo Connect 0.5.0 or higher must be running** on your computer for this to work.

Project's state
======
It's currently in an early stage so the API may change in the next weeks. I suggest you don't use my code right now but you can take a look at it for sure. :)

Ressources
======
- Myo Connect download page : https://developer.thalmic.com/downloads
- Design guidelines : https://developer.thalmic.com/ux/
- Assets : https://developer.thalmic.com/branding/

Todo
======
- [x] Handle device unpair event
- [x] Handle bluetooth strength data
- [x] Create a demo with a 3D device rotating at the center with orientation datas
- [ ] Transfer the 3D model demo into a plugin
- [ ] Use Y velocity with spread fingers pose instead of wave in/out in the website navigator
- [ ] Add a "data-myo-anchor" attribute in the webnavigator plugin that enable user to jump to sections
- [ ] Add HTML5 media players control machanism into the webnavigator plugin
- [ ] Save last "locked" state of website plugin in a cookie to keep the same state between pages
- [ ] Integrates all of this into nodejs ? maybe ?
- [ ] Integrates the web navigator into chrome & firefox extensions to enable myo support on all websites of the entire world ! 
