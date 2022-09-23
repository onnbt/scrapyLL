var muellerDE = require('./scrapers/muellerDE');
var brackCH = require('./scrapers/brackCH');
var manorCH = require('./scrapers/manorCH');
var mytoysDE = require('./scrapers/mytoysDE');


var cID;

var bUrls = [];
var bWords = [];
var search = [];

const discord = require('discord.js');
const readline = require('readline');
const fs = require('fs');


//Bot Start
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const client = new discord.Client();
client.login(config.token);

function loadSearch() {

    try {
        // read contents of the file
        const data = fs.readFileSync('db/search', 'UTF-8');

        // split the contents by new line
        search = data.split(/\r?\n/);


    } catch (err) {
        console.error(err);
    }

}

function loadUrls() {

    try {
        // read contents of the file
        const data = fs.readFileSync('db/urls', 'UTF-8');

        // split the contents by new line
        bUrls = data.split(/\r?\n/);

    } catch (err) {
        console.error(err);
    }
}

function loadWords() {

    try {
        // read contents of the file
        const data = fs.readFileSync('db/words', 'UTF-8');

        // split the contents by new line
        bWords = data.split(/\r?\n/);

    } catch (err) {
        console.error(err);
    }
}



function answ(p) {

    console.log('send');

    client.once("ready", async () => {
        // Fetch the channel
        const channel = await client.channels.fetch(cID);
        // Note that it's possible the channel couldn't be found
        if (!channel) {
            return console.log("could not find channel");
        }
        channel.send(p);
    })

}



var run = false;



process.on('message', (id) => {
    cID = id;

    if (!run) {
        run = true;
        init();
    }
    else run = false;

});



async function scrape(keyword) {

    var arr = await manorCH.scrapeManorCH(keyword);

    if (arr != null) {
        let products = "";
        for (i = 0; i < arr.length; i++) {

            if (!bWords.includes(arr[i].name) && !bUrls.includes(arr[i].name)) {
                products = products.concat((arr[i].name + ' | ' + arr[i].url + "\r\n"));
            }
            console.log(arr[i].name + ' | ' + arr[i].url);
            if(products.length >= 1500){
                 answ(products);
                products = "";
            }
            if(i == arr.length-1){ answ(products);}
        }
       
    }


    var arr = await muellerDE.scrapeMuellerDE(keyword);
    if (arr != null) {
        let products = "";
        for (i = 0; i < arr.length; i++) {

            if (!bWords.includes(arr[i].name) && !bUrls.includes(arr[i].name)) {
                products = products.concat((arr[i].name + ' | ' + arr[i].url + "\r\n"));
            }
            console.log(arr[i].name + ' | ' + arr[i].url);
            if(products.length >= 1500){
                 answ(products);
                products = "";
            }
            if(i == arr.length-1){ answ(products);}
        }
    }


    var arr = await brackCH.scrapeBrackCH(keyword);

    if (arr != null) {
        let products = "";
        for (i = 0; i < arr.length; i++) {

            if (!bWords.includes(arr[i].name) && !bUrls.includes(arr[i].name)) {
                products = products.concat((arr[i].name + ' | ' + arr[i].url + "\r\n"));
            }
            console.log(arr[i].name + ' | ' + arr[i].url);
            if(products.length >= 1500){
                 answ(products);
                products = "";
            }
            if(i == arr.length-1){ answ(products);}
        }
    }

    var arr = await mytoysDE.scrapeMytoysDE(keyword);

    if (arr != null) {
        let products = "";
        for (i = 0; i < arr.length; i++) {

            if (!bWords.includes(arr[i].name) && !bUrls.includes(arr[i].name)) {
                products = products.concat((arr[i].name + ' | ' + arr[i].url + "\r\n"));
            }
            console.log(arr[i].name + ' | ' + arr[i].url);
            if(products.length >= 1500){
                 answ(products);
                products = "";
            }
            if(i == arr.length-1){ answ(products);}
        }
    }
    console.log('round finished $$$')
}

async function init() {

    var cnt = 0;

    while (run) {
        loadSearch();
        loadUrls();
        loadWords();
        if (cnt >= search.length - 1) { cnt = 0 }
        if (search.length >= 1 || search[0].length >= 1) {
            await scrape(search[cnt]);
            cnt++;
        }
        if (run) { console.log('reloading'); }
        else { console.log('end scraping'); }
    }
}







