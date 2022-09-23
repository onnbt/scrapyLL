
//const puppeteer = require('puppeteer');

const puppeteer = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

const debug = false; // -> show exception err in console


const shopName = 'mytoys.de';
const url = 'https://www.mytoys.de/';

var productName = null;
var productUrl = null;

//helperffunction -> scrape product site
async function scrapeProduct(productUrl, browser) {

    let pageTMP = await browser.newPage();
    await pageTMP.goto(productUrl);
    //*[@id="top"]/div[3]/div[2]/div/div[1]/h1
    try {

        await pageTMP.waitForSelector('#top > div.pdp.js-pdp > div.grid-gap.prod-info > div.prod-info__box-container.js-prod-info-box > div.prod-info__box > div.grid-gap__m.prod-info__info-messages > div.prod-info__availability.js-availability-loading > div.prod-info__availability-in-stock', { timeout: 1500 });
        let element = await pageTMP.$('#top > div.pdp.js-pdp > div.grid-gap.prod-info > div.prod-info__box-container.js-prod-info-box > div.prod-info__box > div.grid-gap__m.prod-info__info-messages > div.prod-info__availability.js-availability-loading > div.prod-info__availability-in-stock');
        let value = await pageTMP.evaluate(el => el.textContent, element);

        var ftext = value;

        await pageTMP.waitForSelector('#top > div.pdp.js-pdp > div.grid-gap.prod-info > div.prod-info__box-container.js-prod-info-box > div.prod-info__header > h1', { timeout: 1500 });
        element = await pageTMP.$('#top > div.pdp.js-pdp > div.grid-gap.prod-info > div.prod-info__box-container.js-prod-info-box > div.prod-info__header > h1');
        value = await pageTMP.evaluate(el => el.textContent, element)


        productName = value;
        productName = productName.replace(/[\r\n]+/gm, "");
        productName = productName.trim();

    } catch (err) {
        if (debug) { console.log(err); }
        //console.log('nicht verfügbar');
        await pageTMP.close();
        return null;
    }

    await pageTMP.close();

    if (ftext.includes("Vorr")) {

        available = true;
        return ({
            shop: shopName,
            name: productName,
            url: productUrl
        });
    }
    return null;
}

module.exports = {
    scrapeMytoysDE:


        async function scrapeProductMytoysDE(keyWord) {

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
                //await page.setViewport({ width: 1920, height: 948 })
                await page.waitForTimeout(1000); // wait for potential cookie banner

                //accept cookies
                try {
                    await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 1000 });
                    await Promise.all([
                        await page.click('#onetrust-accept-btn-handler')
                    ]);
                } catch (cookieErr) {
                    console.log('fck cookies');
                }

                //search

                await page.waitForSelector('#top > .header-shop > .js-search > .search-form__container--fill > .input-text');
                await page.click('#top > .header-shop > .js-search > .search-form__container--fill > .input-text');

                await page.type('#top > .header-shop > .js-search > .search-form__container--fill > .input-text', keyWord);
                await page.waitForTimeout(1000);

                await page.waitForSelector('#top > header > form > div.search-form__container > button');
                await page.click('#top > header > form > div.search-form__container > button');

                //sort 4 newest
                await page.goto(page.url() + '?sort=new');
                await page.waitForTimeout(1000);



                // get result count
                try {
                    await page.waitForTimeout(500); // wait for count
                    await page.waitForXPath('//*[@id="tau-pop-main-title-count"]', { timeout: 1000 }); // THIS
                    const [el] = await page.$x('//*[@id="tau-pop-main-title-count"]');

                    var txt = await el.getProperty('textContent');
                    var rawTxt = await txt.jsonValue();

                    tmp = rawTxt.split(" ");
                    tmp2 = tmp[0].split("(");
                    count = tmp2[1];


                } catch (errs) {
                    console.log(shopName + ' -> ' + 'no result for | ' + keyWord);
                    await browser.close();
                    if (debug) { console.log(errs); }
                    return null;
                }
                //*[@id="top"]/div[3]/div[1]/main/ul/li[10]/div/a
                //*[@id="top"]/div[3]/div[1]/main/ul/li[12]/div/a
                //*[@id="top"]/div[3]/div[1]/main/ul/li[1]/div/a
                var resultHref1 = '//*[@id="top"]/div[3]/div[1]/main/ul/li[';
                var resultHref2 = ']/div/a';

                //console.log(count);

                var innerCount = 1;
                for (i = 1; i <= count; i++) {

                    //product url
                    try {
                        xpath = resultHref1 + innerCount + resultHref2;
                        await page.waitForXPath(xpath, { timeout: 1000 });
                        const hrefs = await Promise.all((await page.$x(xpath)).map(async item => await (await item.getProperty('href')).jsonValue()));
                        productUrl = hrefs[0];

                        //chek product itself 
                        productTmp = await scrapeProduct(productUrl, browser);
                        if (productTmp != null) {
                            retArr.push(productTmp);
                            // console.log(retArr[retArr.length - 1].name + ' | ' + retArr[retArr.length - 1].url); // DEBUG
                        }

                        innerCount++;
                        continue;
                    } catch (stpdErr) {
                        for (j = 0; j < 5; j++) {
                            try {
                                if (j == 0) innerCount++;
                                xpath = resultHref1 + innerCount + resultHref2;
                                await page.waitForXPath(xpath, { timeout: 1000 });
                                const hrefs = await Promise.all((await page.$x(xpath)).map(async item => await (await item.getProperty('href')).jsonValue()));
                                productUrl = hrefs[0];

                                //chek product itself 
                                productTmp = await scrapeProduct(productUrl, browser);
                                if (productTmp != null) {
                                    retArr.push(productTmp);
                                    //  console.log(retArr[retArr.length - 1].name + ' | ' + retArr[retArr.length - 1].url); // DEBUG
                                }

                                innerCount++;
                                break;
                            } catch (e) {
                                if (debug) console.log(e);
                                await page.waitForSelector('#top > div.content.content--pop.posr > div.main-container.col-2-left > main > div.view-options.view-options--bottom > div.pager-container > ul > li.pager__item--next.js-pager > a');
                                await page.click('#top > div.content.content--pop.posr > div.main-container.col-2-left > main > div.view-options.view-options--bottom > div.pager-container > ul > li.pager__item--next.js-pager > a');
                                innerCount = 1;
                                // console.log("clicked");
                                await page.waitForTimeout(1000);
                            }
                        }


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

//scrapeProductMytoysDE('pokemon');

