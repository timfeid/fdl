function doit() {
  const form = document.querySelectorAll(
    '*[id^="content-protector-access-form"]'
  )[0]
  if (form) {
    form.submit()
    return
  }

  const blockquotes = document.getElementsByTagName('blockquote')

  let downloading = false

  const info = {
    url: window.location.href,
    name: document.getElementsByTagName('h1')[0].textContent,
    type: 'series',
    urls: [],
    imdb: null,
  }

  const hosts = [
    {
      name: 'uploaded',
      sites: ['uploaded.net'],
    },
    {
      name: 'rapidgator',
      sites: ['rapidgator.net'],
    },
  ]

  const isDownloadingFor = (name) => {
    return !downloading || downloading === name
  }

  for (const blockquote of blockquotes) {
    for (const link of blockquote.getElementsByTagName('a')) {
      // Const link = links[l];
      const href = link.getAttribute('href')

      hosts.forEach((host) => {
        host.sites.forEach((site) => {
          if (href.includes(site) && isDownloadingFor(host.name)) {
            downloading = host.name
            info.urls.push(href)
          }
        })
      })
    }
  }

  const imdb = document.querySelectorAll('a')
  if (imdb.length) {
    for (const anchor of document.querySelectorAll('a[href*="imdb.com"]')) {
      const match = anchor.href.match(/t{2}\d+/)
      if (match) {
        info.imdb = match[0]
        const seasonMatch = info.name.match(/S([0-9]{2,})/)
        if (seasonMatch) {
          info.season = Number(seasonMatch[1])
          info.type = 'series'
        } else {
          info.type = 'movie'
        }
        break
      }
    }
  }
  console.log(info)

  return info
}

doit()
