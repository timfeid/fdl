import puppeteer from 'puppeteer'

export async function hdencode(url: string) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto(url)

  await Promise.all([
    page.click('.content-protector-form-submit[type=submit]'),
    page.waitForNavigation(),
  ])

  const info = await page.evaluate(() => {
    let urlFrom: string

    const isUrlFrom = (name: string) => {
      return !urlFrom || urlFrom === name
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

    const info = {
      url: window.location.href,
      name: document.getElementsByTagName('h1')[0].textContent,
      type: 'series',
      // eslint-disable-next-line
      // @ts-ignore
      urls: [],
      // eslint-disable-next-line
      // @ts-ignore
      imdb: null,
      // eslint-disable-next-line
      // @ts-ignore
      season: undefined,
    }

    const blockquotes = document.getElementsByTagName('blockquote')
    for (const blockquote of blockquotes) {
      for (const link of blockquote.getElementsByTagName('a')) {
        // Const link = links[l];
        const href = link.getAttribute('href')

        hosts.forEach((host) => {
          host.sites.forEach((site) => {
            if (href.includes(site) && isUrlFrom(host.name)) {
              urlFrom = host.name
              info.urls.push(href)
            }
          })
        })
      }
    }

    const imdb = document.querySelectorAll('a')
    if (imdb.length) {
      for (const anchor of document.querySelectorAll('a[href*="imdb.com"]')) {
        // @ts-ignore
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

    return info
  })

  await browser.close()

  return info
}
