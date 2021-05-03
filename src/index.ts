import puppeteer from 'puppeteer';
import { cookie, elementsConfig, startPage } from './config';
import { log, error } from './log';
import { createDir, download } from './utils';

class Crawl {
  browser: puppeteer.Browser | undefined;

  crawlCount = 0;

  async init() {
    this.browser = await puppeteer.launch(
      { headless: false, devtools: true }
    );
    log('init', 'init succeed');
  }

  async run(startPage: string, index: number = 0) {
    this.crawlCount = index;
    if (!this.browser) return;
    const page = await this.browser.newPage();
  
    await page.setCookie(...cookie as any);
    await page.setExtraHTTPHeaders({
      'x-tt-env': 'sprint/1.8',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Mobile Safari/537.36'
    })
    await page.goto(startPage, {
      waitUntil: 'networkidle0',
    });
    await this.handleSinglePage(page);
    let res = true;
    while(res) {
      res = await this.navigateToNext(page);
      if (res) {
        await this.handleSinglePage(page, this.crawlCount);
      }
    }
    log('run', 'run finished');
    await this.clean();
  }

  private async navigateToNext(page: puppeteer.Page) {
    let nextDom;
    try {
      try {
        log('info', `finding next link`);
        nextDom = await page.$(elementsConfig.next)
      } catch(e) {
        if (!nextDom) {
          log('info', 'finding first next link');
          // first page
          nextDom = await page.$(elementsConfig.firstNext);
        }
      }
      if (!nextDom) {
        nextDom = await page.$(elementsConfig.firstNext);
        if (!nextDom)
          throw new Error()
      }
      await nextDom.click();
      await page.waitForSelector(elementsConfig.next);
      this.crawlCount++;
      return true;
    } catch (e) {
      error('next dom does not exsit');
      return false;
    }
  }

  private async handleSinglePage(page: puppeteer.Page, index = 1) {
    const title = (await (await page.$(elementsConfig.title))?.evaluate(node => node.textContent))
      .replace(/[|\\/":*?]/g,'').split('-')[0].trim();
    const dirPath = `${process.cwd()}\\data\\${index}`;
    createDir(dirPath);
    // store as png
    log('info', `saving data ${title} in ${process.cwd()}\\data/${title}.png`)
    await page.screenshot({ path: `${process.cwd()}\\data/${title}.png`, fullPage: true });
    log('info', 'saving article imgs')
    const imgSrcs = await page.evaluate((config) => {
      // return Array.from(document.images, e => e.src);
      const content = document.querySelector<HTMLElement>(config.content);
      if (content) {
        return Array.from(content.querySelectorAll('img'), e => e.src);
      }
      error(`content is not exsit, check article ${title}`);
      return [];
    }, elementsConfig);
    imgSrcs.filter(src => src.startsWith('https')).forEach((src, idx) => {
      download(src, `${dirPath}\\${src.split('/').slice(-1)[0]}`)
    })
    await page.waitForTimeout(1000);
  }

  private async clean() {
    if (!this.browser) return;
    await this.browser.close();
    log('close', 'close succeed');
  }
}
const crawl = new Crawl();

(async () => {
  try {
    await crawl.init();
    await crawl.run(startPage, 0);
  } catch(e) {
    error(e);
  }
})();
