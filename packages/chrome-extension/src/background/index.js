chrome.runtime.onInstalled.addListener((details) => {
  console.log(details)
})

function parseTab(tab) {
  return new Promise((resolve) => {
    chrome.tabs.executeScript(
      tab.id,
      {
        file: 'content-scripts/hdencode.js',
      },
      ([info]) => {
        // Execute your code
        if (info.name && info.urls.length > 0) {
          resolve(info)
        }
      }
    )
  })
}

function sendTabTo(respond) {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    ([tab]) => {
      if (tab.url.includes('hdencode.com')) {
        parseTab(tab).then(respond)
      } else if (tab.url.includes('mtv.com')) {
        // parseMtvTab(tab).then(respond)
      }
    }
  )
}

chrome.extension.onConnect.addListener((popup) => {
  const respond = (payload) => {
    popup.postMessage({ type: 'parseTab', payload })
  }
  sendTabTo(respond)
  // popup.onMessage.addListener((payload) => {
  //   const type = payload.type
  //   if (type === 'parseTab') {
  //     sendTabTo(respond)
  //   }
  // })
})
