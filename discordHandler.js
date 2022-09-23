const {fork} = require('child_process');

const discord = require('discord.js');
const readline = require('readline');
const fs = require('fs');


//Bot Start
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const client = new discord.Client();
client.login(config.token);

//scraper
scrapeProcess = fork('scrapeHandler.js');

//pers. storage
var bUrls = [];
var bWords = [];

var search = [];

var run = false;

async function start() {

    console.log('start')

    //load urls
    const readInterface = readline.createInterface({
        input: fs.createReadStream('db/urls'),
        output: process.stdout,
        console: false
    });

    await readInterface.on('line', await function (line) {
        bUrls.push(line);
        //console.log(line);
    });


    //load word
    const readInterface2 = readline.createInterface({
        input: fs.createReadStream('db/words'),
        output: process.stdout,
        console: false
    });


    await readInterface2.on('line', await function (line) {
        bWords.push(line);
        //console.log(line);
    });


    //load search
    const readInterface3 = readline.createInterface({
        input: fs.createReadStream('db/search'),
        output: process.stdout,
        console: false
    });

    await readInterface3.on('line', await function (line) {
        search.push(line);
        //console.log(line);
    });

}



module.exports = {
    answ:
        function answ(tmp) {
            const channel = client.channels.cache.find(channel => channel.name == 'allgemein');
            channel.send(tmp);
        }
};



function wordss(cmd, message) {
    if (bWords.includes(cmd[1])) {//remove url

        //delete from arr
        bWords.splice(bWords.indexOf(cmd[1]), 1);

        //delete from file
        var data = fs.readFileSync('db/words', 'utf-8');
        var newValue = data.replace(cmd[1] + '\n', '');
        fs.writeFileSync('db/words', newValue, 'utf-8');

        //log
        console.log(cmd[1] + ' deblocked & unsaved');
        message.channel.send(cmd[1] + ' -> deblocked');

    }
    else {
        //add to arr
        bWords.push(cmd[1])

        //write to file
        fs.appendFile('db/words', (cmd[1] + '\n'), function (err) {
            if (err) throw err;
            console.log(cmd[1] + ' blocked & saved');
        });

        //log
        message.channel.send(cmd[1] + ' -> blocked');

    }
    //console.log(bWords); //DEBUG
}


function urlss(cmd, message) {
    if (bUrls.includes(cmd[1])) {//remove url

        //delete from arr
        bUrls.splice(bUrls.indexOf(cmd[1]), 1);

        //delete from file
        var data = fs.readFileSync('db/urls', 'utf-8');
        var newValue = data.replace(cmd[1] + '\n', '');
        fs.writeFileSync('db/urls', newValue, 'utf-8');

        //log
        console.log(cmd[1] + ' deblocked & unsaved');
        message.channel.send(cmd[1] + ' -> deblocked');

    }
    else {
        //add to arr
        bUrls.push(cmd[1])

        //write to file
        fs.appendFile('db/urls', (cmd[1] + '\n'), function (err) {
            if (err) throw err;
            console.log(cmd[1] + ' blocked & saved');
        });

        //log
        message.channel.send(cmd[1] + ' -> blocked');

    }
    //console.log(bUrls); //DEBUG
}

function searchss(cmd, message) {
    if (search.includes(cmd[1])) {//remove url

        //delete from arr
        search.splice(search.indexOf(cmd[1]), 1);

        //delete from file
        var data = fs.readFileSync('db/search', 'utf-8');
        var newValue = data.replace(cmd[1] + '\n', '');
        fs.writeFileSync('db/search', newValue, 'utf-8');

        //log
        console.log(cmd[1] + ' removed from search routine');
        message.channel.send(cmd[1] + ' -> removed from search routine');

    }
    else {
        //add to arr
        search.push(cmd[1])

        //write to file
        fs.appendFile('db/search', (cmd[1] + '\n'), function (err) {
            if (err) throw err;
            console.log(cmd[1] + ' added to search routine');
        });

        //log
        message.channel.send(cmd[1] + ' -> added to search routine');

    }
    // console.log(search); //DEBUG
}


client.on('message', (message) => {
    if (!message.member.user.bot && message.guild) {
        const cmd = message.content.split(' ');

        if (cmd[0] == '!url' && cmd.length == 2) {
            urlss(cmd, message);
        }

        else if (cmd[0] == '!word' && cmd.length >= 2) {
            for (i = 2; i < cmd.length; i++) {
                cmd[1] = cmd[1] + ' ' + cmd[i];
            }
            wordss(cmd, message);
        }

        else if (cmd[0] == '!search' && cmd.length >= 2) {
            for (i = 2; i < cmd.length; i++) {
                cmd[1] = cmd[1] + ' ' + cmd[i];
            }
            searchss(cmd, message);
        }

        else if (cmd[0] == '!run') {
            try{
            scrapeProcess.send(message.channel.id);
            }catch(err){
                console.log(err);
            }
            run = true;
        }
    }
});


start();

