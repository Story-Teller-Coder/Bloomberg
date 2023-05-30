import puppeteer from "puppeteer";
import { writeFileSync } from "fs";
import { parse } from 'json2csv';

const saveAsCSV = (csvData) => {
    const csv = parse(csvData)
    writeFileSync('result.csv', csv);
}

const getQuotes = async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C://chrome-win/chrome.exe',
        headless: false,
        defaultViewport: null,
    });

    // Open a new page
    const page = await browser.newPage();

    await page.goto("https://www.bloomberg.com/europe", { waitUntil: "load", timeout: 0 });

    let results = [];
    let data = [];

    await page.waitForTimeout(50000);
    
    
    results = results.concat(await extractedEvaluateCall(page));

    for (let i = 0; i < results.length; i++) {
        console.log(results[i].url);
        if (results[i].url && results[i].bigTitle && results[i].title) {
            await page.goto(results[i].url, { waitUntil: "load", timeout: 0 });
            const article = await getArticles(page);

            const insertData = {
                date: results[i].date,
                title: results[i].title,
                articles: article.article,
                url: results[i].url
            }
            data.push(insertData)
        }
    }

    // Close the browser
    await browser.close();

    saveAsCSV(data);
};

async function extractedEvaluateCall(page) {
    // Get page data
    const quotes = await page.evaluate(() => {
        const quoteList = document.querySelectorAll("article.styles_storyBlock__LKKns");

        return Array.from(quoteList).map((quote) => {
            let bigTitle = '', url = '', title = '';
            try {
                bigTitle = quote.querySelector("div[data-component=eyebrow] a").innerText;
            } catch (e) {

            }
            try {
                url = quote.querySelector("div[data-component=headline a").href;
            } catch (e) {

            }

            try {
                title = quote.querySelector("div[data-component=headline a").innerText;
            } catch (e) {

            }

            return {bigTitle, url, title };
        });
    });

    return quotes;
}

async function getArticles(page) {
    await page.waitForSelector('div.lede-times__03902805')

    let article = '', date = '';

    try {
        date = await page.$eval("div.lede-times__03902805 time[itemprop=datePublished]", el => el.innerText);
    } catch (e) {

    }
    try {
        article = await page.$eval("")
    } catch(e) {
        
    }

    return { article }
}

// Start the scraping
getQuotes();