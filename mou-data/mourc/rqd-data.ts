import {launchBrowser} from "../util/launch-browser";

const RQD_PAGE = "https://moumn.org/cgi-bin/rqd.pl?op=rare&sort=";

import {Page} from 'puppeteer';
import {loginMou, logoutMou} from "../util/mou-login";

export enum SpeciesStatus {
    REGULAR = "R",
    CASUAL = "C",
    ACCIDENTAL = "A",
    HYBRID = "H",
    SPECIES_GENUS = "S",
}

export enum OccurrenceCode {
    COMMON = "C",
    UNCOMMON = "U",
    OCCASIONAL = "O",
    RARE = "#",
}

export type RqdData = {
    mouRecordId: string;
    observer: string;
    species: string;
    hasMedia: boolean;
    location: string;
    observationDate: Date;
    submittedDate: Date;
    email: string
    county: string;
    status: SpeciesStatus,
    occurrence: OccurrenceCode,
    record: string,
}

export type RqdDataOptions = {
    beforeDate: Date;
    afterDate: Date;
}


export async function main() {
    const page = await launchBrowser();
    await loginMou(page);
    await navigateToRqdPage(page);
    await logoutMou(page);
}


async function navigateToRqdPage(page: Page) {
    console.log(`Navigating to MOU RQD page at ${RQD_PAGE}`);
    await page.goto(RQD_PAGE);

    const rqdRecords = await page.waitForSelector("#table_results");
    if (!rqdRecords) {
        throw new Error('RQD page did not load correctly, records table not found.');
    }
    console.log('RQD page loaded successfully');

    const links = await page.$$eval("#table_results tr td a", els => els.map(el => el.href));
    for (const link of links) {
        console.log(`Processing RQD record at ${link}`);
        const isAfter = await getRqdRecordDetail(page, link);
        if(!isAfter) {
            break;
        }
    }
}

async function getRqdRecordDetail(page: Page, recordUrl: string) {
    await page.goto(recordUrl);
    const submittedDateStr = await page.$eval("#header > tbody > tr:nth-child(3) > td:nth-child(4)", el => el.textContent?.trim() || '');
    const submittedDate = new Date(submittedDateStr);
    if (submittedDate <  new Date("2025-05-31")) {
        return false;
    }
    const recordId = recordUrl.split("?rec_id=")[1];
    // just need to check if this blockquote has any text content
    const hasMedia = !!(await page.$eval("#container > blockquote:nth-child(10)", el => el.textContent?.trim() || ''));
    const observer = await page.$eval("#header > tbody > tr:nth-child(2) > td:nth-child(2)", el => el.textContent?.trim() || '');
    const species = await page.$eval("#header > tbody > tr:nth-child(1) > td:nth-child(2)", el => el.textContent?.trim() || '');
    const location = await page.$eval("#county", el => el.textContent?.trim() || '');
    const observationDateStr = await page.$eval("#header > tbody > tr:nth-child(3) > td:nth-child(2)", el => el.textContent?.trim() || '');
    const email = await page.$eval("#container > blockquote:nth-child(12) > p > span:nth-child(5)", el => el.textContent?.trim() || '');
    console.log(`Record ID: ${recordId}, Has Media: ${hasMedia}, Observer: ${observer}, Species: ${species}, Location: ${location}, Observation Date: ${observationDateStr}, Submitted Date: ${submittedDateStr}, Email: ${email}`);
    return true;
}

(async () => {
    await main();
})();
