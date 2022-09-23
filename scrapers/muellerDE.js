/*
www.mueller.de check
www.netto.de
www.mytoys.de
www.manor.ch  <-- }
www.brack.ch  <-- }  
    -> Discord benachrichtigung 
    -> Discord Bot Befehele 
    -> link wenn verfügbar 
    -> kein heckmeck mit server 
    -> Sperre für bestimmte produkte (url)
Verborgenes Schicksal 
Hidden Fates
Glänzendes Schicksal 
Shining Fates
Farbenschock 
Vivid Voltage 
Schwert & Schild
Sword & Shield
SWSH
SM10.5
*/

//const puppeteer = require('puppeteer');

const puppeteer = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

const debug = false; // -> show exception err in console

const shopName = 'meuller.de';
const url = 'https://www.mueller.de/';

var productName = null;
var productUrl = null;




module.exports = {
  scrapeMuellerDE:


    async function scrapeProductMuellerDE(keyWord) {

      puppeteer.use(StealthPlugin()); // 4 stealth


      //needed value for return 
      var retArr = [];

      //count of all products 
      var count = 0;


      console.log(shopName + ' -> ' + 'start srcaping ' + 'for ' + keyWord);

      try {

        //init browser
        var browser = await puppeteer.launch({
          headless: !debug // 4 debugging 
        });

        //load page
        var page = await browser.newPage();
        await page.goto(url);
        await page.waitForTimeout(1000); // wait for potential cookie banner

        //accept cookies
        try {
          await page.waitForSelector('#uc-btn-accept-banner', { timeout: 1000 });
          await Promise.all([
            await page.click('#uc-btn-accept-banner')
          ]);
        } catch (cookieErr) {
          console.log('fck cookies');
        }

        //search product 
        await page.type("#page > div > header > div:nth-child(3) > div > div > form > div > div > input.mu-input__field.mu-input__field--small-button", keyWord);
        await Promise.all([
          await page.click('#page > div > header > div:nth-child(3) > div > div > form > div > div > button > i')
        ]);

        // get result count
        try{
        await page.waitForXPath('//*[@id="page"]/main/div/div/div[2]/div[1]/div[1]/h1',  { timeout: 1500 });
        const [el] = await page.$x('//*[@id="page"]/main/div/div/div[2]/div[1]/div[1]/h1');

        var txt = await el.getProperty('textContent');
        var rawTxt = await txt.jsonValue();

        var n = rawTxt.lastIndexOf('(');
        var m = rawTxt.lastIndexOf('A');

        count = rawTxt.slice(n + 1, m - 1);

      } catch(errs) {
        console.log(shopName + ' -> ' + 'no result for | ' + keyWord);
        await browser.close();
        if (debug) { console.log(errs); }
        return null;
    }
      

        //console.log(count);//DEBUG

        //results          
        var resultName1 = '//*[@id="page"]/main/div/div/div[2]/div[3]/div/div/a[';
        var resultName2 = ']/div/div[7]';

        var resultHref1 = '//*[@id="page"]/main/div/div/div[2]/div[3]/div/div/a[';
        var resultHref2 = ']';

        var resultLF1 = '//*[@id="page"]/main/div/div/div[2]/div[3]/div/div/a['; //lieferung in filiale
        var resultLF2 = ']/div/div[8]/div[1]';

        var resultLH1 = '//*[@id="page"]/main/div/div/div[2]/div[3]/div/div/a['; //lieferung nach hause
        var resultLH2 = ']/div/div[8]/div[2]';


        //traverse results
        for (i = 1; i <= count; i++) {

          var xpath, txt, rawTxt;

          //product name
          xpath = resultName1 + i + resultName2;
          await page.waitForXPath(xpath);
          const [name] = await page.$x(xpath);
          txt = await name.getProperty('textContent');
          productName = await txt.jsonValue();

          //console.log(productName); //DEBUG

          //product url
          xpath = resultHref1 + i + resultHref2;
          await page.waitForXPath(xpath);
          const hrefs = await Promise.all((await page.$x(xpath)).map(async item => await (await item.getProperty('href')).jsonValue()));
          productUrl = hrefs[0];

          //console.log(productUrl); //DEBUG

          //available
          xpath = resultLF1 + i + resultLF2;
          await page.waitForXPath(xpath);
          const [filiale] = await page.$x(xpath);
          txt = await filiale.getProperty('textContent');
          const ftext = await txt.jsonValue();
          //console.log(ftext);

          xpath = resultLH1 + i + resultLH2;
          await page.waitForXPath(xpath);
          const [haus] = await page.$x(xpath);
          txt = await haus.getProperty('textContent');
          const htext = await txt.jsonValue();
          //console.log(htext);

          //check for vailability
          if (ftext.includes("lieferbar") || htext.includes("lieferbar")) {
            available = true;

            retArr.push({
              shop: shopName,
              name: productName,
              url: productUrl

            });

            // console.log(retArr[retArr.length-1].name + ' | ' + retArr[retArr.length-1].url); // DEBUG

          }

          //next page 
          if (i % 60 == 0) {
            await Promise.all([
              await page.click('#page > main > div > div > div.mu-product-list-page__content > div.mu-product-list-page__product-list > div > div.mu-pagination2.mu-product-list__pagination > button.mu-button2.mu-pagination2__navigation.mu-pagination2__navigation--next > span.mu-button2__content')
            ]);
            i = 0;
            count -= 60;
          }

        }

      } catch (err) {
        console.log(shopName + ' -> ' + 'failed for | ' + keyWord);
        await browser.close();
        if (debug) { console.log(err); }
        return null;
      }

      //const aUrl = await page.url();
      //console.log(aUrl);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
      await browser.close();
      console.log(shopName + ' $$$ finished very nize $$$');
      return retArr;
    }

};

//scrapeProductMuellerDE('hallo kitty');

