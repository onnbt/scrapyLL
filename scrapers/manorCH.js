
//const puppeteer = require('puppeteer');

const puppeteer = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

const debug = false; // -> show exception err in console


const shopName = 'manor.ch';
const url = 'https://www.manor.ch/';

var productName = null;
var productUrl = null;


module.exports = {
  scrapeManorCH:


    async function scrapeProductManorCH(keyWord) {

      puppeteer.use(StealthPlugin()); //4stealth

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
        // await page.waitForTimeout(1000); // TODO DEBUG

        //search product 
        await page.type("#js-site-search-input", keyWord);
        await Promise.all([
          await page.click('#mm-0 > div.page-wrap > div.o-header.js-header > div > div.g-col.g-col-3.js-header-overlay > div > div > button')
        ]);


        await page.waitForTimeout(500); //DEBUG    
        // await page.waitForNavigation();


        // get result count 
        try {
          await page.waitForSelector('#epoq_searchhits > span', { timeout: 1500 }); // THIS !!!
          let element = await page.$('#epoq_searchhits > span');
          let rawTxt = await page.evaluate(el => el.textContent, element);

          tmp = rawTxt.split(" ");

          count = tmp[0];

        } catch (errs) {
          console.log(shopName + ' -> ' + 'no result for | ' + keyWord);
          await browser.close();
          if (debug) { console.log(errs); }
          return null;
        }

        if(count == 0){
          console.log(shopName + ' -> ' + 'no result for | ' + keyWord);
          await browser.close();
          if (debug) { console.log(errs); }
          return null;
        }


        //console.log(count);//DEBUG

        //*[@id="epoq_resultrows"]/div[3]/a/div[3]/div[1]/div[2]
        //results          //*[@id="epoq_resultrows"]/div[2]/a/div[3]/div[1]/div[2]
        var resultName1 = '//*[@id="epoq_resultrows"]/div[';
        var resultName2 = ']/a/div[3]/div[1]/div[2]';

        var resultHref1 = '//*[@id="epoq_resultrows"]/div[';
        var resultHref2 = ']/a';


        for (i = 1; i <= count; i++) {

          xpath = resultName1 + i + resultName2;
          await page.waitForXPath(xpath);
          const [name] = await page.$x(xpath);
          txt = await name.getProperty('textContent');
          productName = await txt.jsonValue();

          //console.log(productName);


          xpath = resultHref1 + i + resultHref2;
          await page.waitForXPath(xpath);
          const hrefs = await Promise.all((await page.$x(xpath)).map(async item => await (await item.getProperty('href')).jsonValue()));
          productUrl = hrefs[0];

          //console.log(productUrl);

          retArr.push({
            shop: shopName,
            name: productName,
            url: productUrl
          });

          //next page
          if (i % 24 == 0) {
            count -= 24;
            i = 0;
            await page.waitForSelector('#epoq_searchresult > div.epoq_navigate.epoq_nav_bottom.g-layout-productlistfooter.g-row > div > div > div > ul > li.pagination-next.js-next.epoq_pagination_button > a');
            await page.click('#epoq_searchresult > div.epoq_navigate.epoq_nav_bottom.g-layout-productlistfooter.g-row > div > div > div > ul > li.pagination-next.js-next.epoq_pagination_button > a');

          }

        }

      } catch (err) {
        console.log(shopName + ' -> ' + 'failed for | ' + keyWord);
        await browser.close();
        if (debug) { console.log(err); }
        return null;
      }

      await browser.close();
      console.log(shopName + ' $$$ finished very nize $$$');
      return retArr;
    }

};

//scrapeProductManorCH('hallo kitty');
