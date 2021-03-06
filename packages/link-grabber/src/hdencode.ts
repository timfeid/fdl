import puppeteer from 'puppeteer'

export async function hdencode(url: string) {
  const browser = await puppeteer.launch(process.env.CHROME_BIN ? {
    headless: true,
    executablePath: process.env.CHROME_BIN || null,
    args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage']
  } : {})
  const page = await browser.newPage()

  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36')
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
      urls: [] as string[],
      // eslint-disable-next-line
      // @ts-ignore
      imdb: null,
      // eslint-disable-next-line
      // @ts-ignore
      season: undefined,
      categories: [] as string[],
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

    const tags = document.querySelectorAll('.calidad3')
    for (const tag of tags) {
      info.categories.push(tag.textContent)
    }

    return info
  })

  await browser.close()

  return info
}
