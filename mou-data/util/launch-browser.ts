import puppeteer, {Page} from "puppeteer";

const SHOW_BROWSER = process.env.SHOW_BROWSER === undefined || !(process.env.SHOW_BROWSER.trim()) || !!process.env.SHOW_BROWSER;

export async function launchBrowser() {
    const puppeteerOpts = SHOW_BROWSER ? {
        headless: false,
        slowMo: 100,
        args: [`--window-size=1920,1080`]
    } : {}
    const browser = await puppeteer.launch(puppeteerOpts);
    const page: Page = await browser.newPage();
    if (SHOW_BROWSER) {
        await page.setViewport({width: 1920, height: 1080});
    }
    return page;
}