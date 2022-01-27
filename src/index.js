const puppeteer = require('puppeteer');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');
require('dotenv').config()

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

  let currentPrice = await page.evaluate(() => {
    let itemPrice = document.querySelector('#price').innerText;
    let price = itemPrice.replace(/[^0-9,-]+/g, "");
    return parseFloat(price);
  });


  if (currentPrice < 25) {
    console.log("HORA DE COMPRAR");
    sendNotification(currentPrice);
  }

}

async function startTracking() {
  const page = await configureBrowser();

  let job = new CronJob('*/30 * * * * *', function () {
    checkPrice(page);
  }, null, true, null, null, true);

  job.start();
}

async function sendNotification(price) {

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  let textToSend = `Preço do item é: R$ ${price}`;
  let htmlText = `<a href=\"${url}\">Link</a>`;

  let info = await transporter.sendMail({
    from: `"Price Tracker" ${process.env.EMAIL_USER}`,
    to: 'miltinhosoares6@gmail.com',
    subject: 'Amazon price tracker',
    text: textToSend,
    html: htmlText
  });

  console.log(`Message sent: ${info.messageId}`);
}

startTracking();