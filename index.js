#!/usr/bin/env node

const request = require('request');
const chalk = require('chalk'); //Terminal string styling done right
const fs = require('fs');
const Spinner = require('cli-spinner').Spinner;
const spinner = new Spinner('%s loading...');
const urlencode = require('urlencode');
const home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
const configFile = home + "/config.json";
const yargs = require('yargs');
let result_color = 'green';
let warn_color = 'red';
let title_color = 'white';


spinner.setSpinnerString('⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏');
// spinner.setSpinnerString('✶✸✹✺✹✷');

spinner.start();

const readFile = (filename, encoding) => {

    try {
        return fs.readFileSync(filename).toString(encoding);
    }
    catch (e) {
        return null;
    }
};

const config = JSON.parse(readFile(configFile,"utf8"));
// const input = process.argv.slice(2);
// const word = input.join(' ');
const wordList = yargs.argv;
const para = yargs.alias('l', 'limit').argv;
var word = (wordList._).join(' ');

const URL = `https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&origin=*&gsrsearch=${urlencode(word)}`
const options = {
    'url':URL
};

if(config){
    if(config.proxy){
        options.proxy = config.proxy;
    }
    if(config.color){
        result_color = config.color;
    }
}

const result_color_output = chalk.keyword(result_color);
const warn_color_output = chalk.keyword(warn_color);
const title_color_output = chalk.underline.keyword(title_color);

request(options,(error, response, body)=>{

    var result = 'No result!';

if (!error && response.statusCode == 200) {
    var info = JSON.parse(body);

    if(info.hasOwnProperty("query")) {
        var pageIds=[];
        for (var pageid in info.query.pages) {
            pageIds.push(pageid);
        }

        spinner.stop(true);
        console.log("\n");

        var limit;

        if(para.l === undefined) {
            limit = 3;
        } else {
            limit = para.l;
        }

        for(let i = 0; i < limit; i++) {
            console.log(title_color_output(info.query.pages[pageIds[i]].title));
            console.log(result_color_output(info.query.pages[pageIds[i]].extract));
        }
        console.log("\n");
    } else {
        spinner.stop(true);
        console.log("\n");
        console.log(warn_color_output(result));
        console.log("\n");
    }

}

});
