import {launchBrowser} from "../util/launch-browser";
import {Page} from 'puppeteer';
import {loginMou, logoutMou} from "../util/mou-login";
import yargs from 'yargs';
import {hideBin} from "yargs/helpers";
import {fileURLToPath} from "url";
import path, {dirname} from "path";
import dotenv from "dotenv";
import {Readable} from "node:stream";
import { stringify } from "csv-stringify";
import {pipeline} from 'node:stream/promises';
import * as fs from "node:fs";
import {format, parseISO} from "date-fns";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({path: [path.join(__dirname, '../.mou.env')]});

const RQD_PAGE = "https://moumn.org/cgi-bin/rqd.pl?op=rare&sort=";

interface ProcessRqdOptions {
    sinceDate: Date;
}

export type RqdRecord = {
    mouRecordId: string;
    observer: string;
    species: string;
    hasMedia: number;
    location: string;
    observationDate: string;
    submittedDate: string;
    email: string
}

export async function main(sinceDate: Date) {
    const page = await launchBrowser();
    await loginMou(page);
    await navigateToRqdPage(page);
    const outFile = `rqd-records-${format(sinceDate, 'yyyy-MM-dd')}.csv`;
    await pipeline(
        Readable.from(processRqdRecords(page, sinceDate)),
        stringify({header: true}),
        fs.createWriteStream(path.join(__dirname, '..', outFile))
    );
    console.log(`RQD records written to ${outFile}`);
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
}

// Async generator to process RQD records one by one. Avoids memory issues and we can use it to stream to CSV.
async function* processRqdRecords(page: Page, sinceDate: Date) {
    const links = await page.$$eval("#table_results tr td a", els => els.map(el => el.href));

    for (const link of links) {
        console.log(`Processing RQD record at ${link}`);
        const rqdRecord = await getRqdRecordDetail(page, link, sinceDate);
        if (rqdRecord) {
            yield rqdRecord;
        } else {
            return;
        }
    }
}

async function getRqdRecordDetail(page: Page, recordUrl: string, sinceDate: Date): Promise<RqdRecord | null> {
    await page.goto(recordUrl);
    const submittedDateStr = await page.$eval("#header > tbody > tr:nth-child(3) > td:nth-child(4)", el => el.textContent?.trim() || '');
    const submittedDate = new Date(submittedDateStr);
    if (submittedDate < sinceDate) {
        return null;
    }
    const recordId = recordUrl.split("?rec_id=")[1];
    // just need to check if this blockquote has any text content
    const hasMedia = !!(await page.$eval("#container > blockquote:nth-child(10)", el => el.textContent?.trim() || ''));
    const observer = await page.$eval("#header > tbody > tr:nth-child(2) > td:nth-child(2)", el => el.textContent?.trim() || '');
    const species = await page.$eval("#header > tbody > tr:nth-child(1) > td:nth-child(2)", el => el.textContent?.trim() || '');
    const location = await page.$eval("#county", el => el.textContent?.trim() || '');
    const observationDateStr = await page.$eval("#header > tbody > tr:nth-child(3) > td:nth-child(2)", el => el.textContent?.trim() || '');
    const email = await page.$eval("#container > blockquote:nth-child(12) > p > span:nth-child(5)", el => el.textContent?.trim() || '');
    const rqdRecord: RqdRecord = {
        mouRecordId: recordId,
        observer,
        species,
        hasMedia: hasMedia ? 1 : 0,
        location,
        observationDate: format(new Date(observationDateStr), 'yyyy-MM-dd'),
        submittedDate: format(submittedDate, 'yyyy-MM-dd'),
        email
    };
    console.log(JSON.stringify(rqdRecord));
    return rqdRecord;
}

const argsParser = yargs(hideBin(process.argv))
    .option('since-date', {
        alias: "d",
        type: "string",
        description: 'Only process RQD records submitted after this date (YYYY-MM-DD)',
        demandOption: true
    })
    .example('tsx mou-data/$0 --d 2026-01-01', 'Process RQD records submitted after January 1, 2026')
    .example('npm run rqd-data -- -d 2026-01-01', 'Process RQD records submitted after January 1, 2026')
    .coerce('since-date', (arg) => parseISO(arg));

(async () => {
    const args = argsParser.parse(hideBin(process.argv)) as ProcessRqdOptions;
    console.log(`Processing RQD records submitted after ${args.sinceDate}`);
    await main(args.sinceDate);
})();
