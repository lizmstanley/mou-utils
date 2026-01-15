const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({path: [path.join(__dirname, '../.mou.env')]});

const LOGIN_URL = "https://moumn.org/cgi-bin/login.pl";
const MOU_USERNAME = process.env.MOU_USERNAME || '';
const MOU_PASSWORD = process.env.MOU_PASSWORD || '';

import dotenv from 'dotenv';
import path, {dirname} from 'path';
import {fileURLToPath} from 'url';
import {Page} from 'puppeteer';

export async function loginMou(page: Page) {
    validateEnv();
    console.log(`Navigating to MOU login page at ${LOGIN_URL}`);
    await page.goto(LOGIN_URL, {waitUntil: 'networkidle2'});

    console.log(`Entering MOU login credentials for user ${MOU_USERNAME}`);
    await page.type('#observer', MOU_USERNAME, {delay: 50});
    await page.type('input[type="password"]', MOU_PASSWORD, {delay: 50});

    console.log(`Submitting MOU login form`);
    await page.click('input[type="submit"]');
    await page.waitForSelector(`xpath///*[@id="container"]/div[2]/div[1]/span[contains(text(),'Not ${MOU_USERNAME}?')]`, {timeout: 5000});
    // Verify login was successful by checking for a known element on the landing page
    if (!(await isAuthenticated(page)) || page.url() === LOGIN_URL) {
        throw new Error('MOU login failed, please check your credentials.');
    }
    console.log('MOU login successful');
}

async function isAuthenticated(page: Page) {
    return !!(await getAuthCookie(page));
}

export async function logoutMou(page: Page) {
    console.log('Logging out of MOU');
    // MOU's super secure logout mechanism - just remove a cookie... ಠ_ಠ
    const authCookie = await getAuthCookie(page);
    if (!authCookie) {
        console.log("No auth cookie found, already logged out?");
        return;
    }
    await page.browserContext().deleteCookie(authCookie);
    console.log('MOU logout successful');
}

async function getAuthCookie(page: Page) {
    const cookies = await page.browserContext().cookies();
    return cookies.find(cookie => cookie.domain === ".moumn.org" && cookie.name === 'moureports');
}

function validateEnv() {
    if (!MOU_USERNAME || !MOU_PASSWORD) {
        console.error('MOU_USERNAME and MOU_PASSWORD must be set in environment variables.');
        process.exit(1);
    }
}
