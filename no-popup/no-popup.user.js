// ==UserScript==
// @name        no-popup
// @description Just a popup catcher
// @description To grant a site, press CTRL + SHIFT + G
// @description To exclude a site, press CTRL + SHIFT + E
// @downloadURL https://raw.githubusercontent.com/Lcfvs/userscripts/master/no-popup/no-popup.user.js
// @updateURL https://raw.githubusercontent.com/Lcfvs/userscripts/master/no-popup/no-popup.user.js
// @namespace   any-site
// @version     1.0.2
// @include     http*
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       unsafeWindow
// @run-at document-start
// ==/UserScript==
(
  (
    global,
    open = unsafeWindow.open,
    Observer = global.MutationObserver,
    noop = a => null,
    demethodize = Function.bind.bind(Function.call),
    forEach = demethodize(Array.prototype.forEach),
    includes = demethodize(Array.prototype.includes),
    observe = demethodize(Observer.prototype.observe),
    disconnect = demethodize(Observer.prototype.disconnect),
    getAttribute = demethodize(HTMLElement.prototype.getAttribute),
    removeAttribute = demethodize(HTMLElement.prototype.removeAttribute),
    toLowerCase = demethodize(String.prototype.toLowerCase),
    observer,
    hostname = global.location.hostname,
    permissions = JSON.parse(GM_getValue('noPopup') || '{}'),
    stringify = JSON.stringify,
    rules = {
      attributeFilter: ['target'],
      childList: true,
      subtree: true
    },
    grant = a => (
      permissions[hostname] = true,
      GM_setValue('noPopup', stringify(permissions)),
      unsafeWindow.open = open,
      observer
      && disconnect(observer),
      console.log('granted')
    ),
    exclude = a => (
      permissions[hostname] = false,
      GM_setValue('noPopup', stringify(permissions)),
      unsafeWindow.open = noop,
      observer = new Observer(mutations =>
        forEach(mutations, (mutation, key, mutations) =>
          (mutation.type === 'childList' || key === mutations.length - 1)
          && toLowerCase(getAttribute(mutation.target, 'target') || '') === '_blank'
          && removeAttribute(mutation.target, 'target')
        )),
      observe(observer, global.document.documentElement, rules),
      console.log('excluded')
  )) => (
    global.document.documentElement
    && (
      global.document.addEventListener('keyup', event =>
        event.shiftKey
        && event.ctrlKey
        && ((event.keyCode === 71 && grant()) || (event.keyCode === 69 && exclude()))
      ),
      permissions[hostname] || exclude()
    )
  )
)(this.window);
