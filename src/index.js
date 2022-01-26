const puppeteer = require('puppeteer');
const $ = require('cheerio');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');

const url = 'https://www.amazon.com.br/As-obras-revolucion%C3%A1rias-George-Orwell/dp/B08ZK6N3XZ';


async function configureBrowser() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url);
  return page;
};

async function checkPrice(page) {
  await page.reload();
  let html = await page.evaluate(() => document.body.innerHTML);

  let itemPrice = await page.evaluate(() => {
    return document.querySelector('#price').innerText;
  });

  console.log(itemPrice);

  // $('#price', html).each(function () {
  //   let price = $(this).text();
  //   console.log(price);
  // });
}

async function monitor() {
  let page = await configureBrowser();
  await checkPrice(page);
}

monitor();