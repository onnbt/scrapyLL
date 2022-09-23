

//const puppeteer = require('puppeteer');

const puppeteer = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

const debug = false; // -> show exception err in console


const shopName = 'brack.ch';
const url = 'https://www.brack.ch/';

var productName = null;
var productUrl = null;



module.exports = {
  scrapeBrackCH:


    async function scrapeProductBrackCH(keyWord) {

      puppeteer.use(StealthPlugin()); //4stealth

      //needed value for return 
      var retArr = [];


      //count of all products 
      var count = 0;

      console.log(shopName + ' -> ' + 'start srcaping ' + 'for ' + keyWord);


      //load page
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
        await page.waitForSelector('.row #search_input');
        await page.click('.row #search_input');
        await page.type('.row #search_input', keyWord);

        await page.waitForSelector('.form-inline > .input-group > .input-group-append > .btn > .icon-magnify');
        await page.click('.form-inline > .input-group > .input-group-append > .btn > .icon-magnify');

        // get result count 
        try {
          /*
          await page.waitForTimeout(500); // wait for count
          await page.waitForXPath('/html/body/article/div[1]/div/nav/div/p', { timeout: 1500 });
          const [el] = await page.$x('/html/body/article/div[1]/div/nav/div/p');

          var txt = await el.getProperty('textContent');
          var rawTxt = await txt.jsonValue();
          */
          await page.waitForSelector('body > article > div:nth-child(1) > div > nav > div > p', { timeout: 1500 });
          let element = await page.$('body > article > div:nth-child(1) > div > nav > div > p');
          let value = await page.evaluate(el => el.textContent, element);
  
          var rawTxt = value;
         
  
  
          tmp = rawTxt.split(" ");
          count = tmp[0];
  
          if (isNaN(count)) {
            tmp = count.split("'");
            count = tmp[0] + tmp[1];
          }

        } catch(errs) {
          console.log(shopName + ' -> ' + 'no result for | ' + keyWord);
          await browser.close();
          if (debug) { console.log(errs); }
          return null;
        }

    

        //results
        if (count < 4) {
          //*[@id="searchResultContainer"]/div[2]/div[4]/ul/li[1]/div/a[2]
          //*[@id="searchResultContainer"]/div[2]/div[5]/ul/li[1]/div/div[3]/div[2]/a[2]
          var resultName1 = '//*[@id="searchResultContainer"]/div[2]/div[5]/ul/li[';
          var resultName2 = ']/div/div[3]/div[2]/a[2]';


          var resultHref1 = '//*[@id="searchResultContainer"]/div[2]/div[5]/ul/li[';
          var resultHref2 = ']/div/a[2]';

          var resultLF1 = '//*[@id="searchResultContainer"]/div[2]/div[5]/ul/li[';
          var resultLF2 = ']/div/div[1]/div/div/span';

        } else {
          //*[@id="searchResultContainer"]/div[2]/div[4]/ul/li[1]/div/div[3]/div[2]/a[2]
          //*[@id="searchResultContainer"]/div[2]/div[5]/ul/li[1]/div/div[3]/div[2]/a[2]
          var resultName1 = '//*[@id="searchResultContainer"]/div[2]/div[4]/ul/li[';
          var resultName2 = ']/div/div[3]/div[2]/a[2]';


          var resultHref1 = '//*[@id="searchResultContainer"]/div[2]/div[4]/ul/li[';
          var resultHref2 = ']/div/a[2]';

          var resultLF1 = '//*[@id="searchResultContainer"]/div[2]/div[4]/ul/li[';
          var resultLF2 = ']/div/div[1]/div/div/span';

        }

        if (count > 48) {

          //get products on actual page count bc. not static
          await page.waitForSelector("#ProductListHead > nav > select.dropDown.dropDown--resultNumber.js-dropDownResultNumber", node =>
            node.value);

          var option = await page.$eval("#ProductListHead > nav > select.dropDown.dropDown--resultNumber.js-dropDownResultNumber", node =>
            node.value);
        }

        //traverse results
        for (i = 1; i <= count; i++) {

          var xpath, txt, rawTxt;

          //product name
          xpath = resultName1 + i + resultName2;
          await page.waitForXPath(xpath);
          //console.log("\n"); //DEBUG             
          const [name] = await page.$x(xpath);
          txt = await name.getProperty('textContent');
          productName = await txt.jsonValue();

          //product url
          xpath = resultHref1 + i + resultHref2;
          await page.waitForXPath(xpath);
          const hrefs = await Promise.all((await page.$x(xpath)).map(async item => await (await item.getProperty('href')).jsonValue()));
          productUrl = hrefs[0];


          //available
          xpath = resultLF1 + i + resultLF2;
          await page.waitForXPath(xpath);
          const [filiale] = await page.$x(xpath);
          txt = await filiale.getProperty('textContent');
          var ftext = await txt.jsonValue();


          //check for vailability
          if (ftext.includes("Lager")) {
            available = true;

            retArr.push({
              shop: shopName,
              name: productName,
              url: productUrl
            });

            //console.log(retArr[retArr.length-1].name + ' | ' + retArr[retArr.length-1].url); // DEBUG
          }


          // nsxt page
          if (i % option == 0) {
            count -= option;
            i = 0;
            await page.waitForSelector('#searchResultContainer > div.searchResult > div.productListContainer.productListSearchResult.js-productListSearchResult > div > div > a.responsive-pagination__pager.responsive-pagination__pager--next');
            await page.click('#searchResultContainer > div.searchResult > div.productListContainer.productListSearchResult.js-productListSearchResult > div > div > a.responsive-pagination__pager.responsive-pagination__pager--next');

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
  //scrapeProductBrackCH('iphone');


