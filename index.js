const axios = require("axios");
const inquirer = require("inquirer");
const util = require("util")
const puppeteer = require('puppeteer')
const fs = require("fs-extra");

function userPrompts() {
    return inquirer.prompt([
        {
            message: "Enter your GitHub username",
            name: "username"
        },
        {
            message: "Pick your favorite color",
            name: "color"
        }
    ])
}

async function htmlVariables() {
    try {
        //passing in userInput from earlier function
        const userInput = await userPrompts();

        // creating next paramter for html with axios to get gitHub info
        const gitHub = await axios.get(`https://api.github.com/users/${userInput.username}`)
            .catch(function (error) {
                console.log(error)
            });

        // creating last paramter for html with axios to get gitHub stars info
        const starsTotal = await axios.get(`https://api.github.com/users/${userInput.username}/repos?per_page=100000`)
            .then(function (res) {
                const stars = res.data.map(repo => repo.stargazers_count);
                const starsTotal = stars.reduce((total, num) => total + num);
                return starsTotal;
            })
            .catch(function (error) {
                console.log(error)
            });

        //declare variables for HTML
        const html = createHTML(gitHub, starsTotal, userInput);

        //create html file to house for pdf
        await createFile(`${userInput.username}.html`, html);

        // start puppeteer functionality
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        //grabs html to create pdf
        await page.setContent(html)
        await page.emulateMedia('screen');
        await page.pdf({
            path: 'gitHubProfile.pdf',
            format: 'A4',
            printBackground: true
        });

        //closes down puppeteer function
        console.log("Done!")
        await browser.close();
        process.exit();

    }
    catch (err) {
        console.log(err)
    }
}
htmlVariables()

const createFile = util.promisify(fs.writeFile);

function createHTML(gitHub, starsTotal, userInput) {
    return `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Document</title>
        <style>
        body {
            background-color:${userInput.color}
        }
        h1, h3, h5 {
            color: black;
        }
        .grid-container {
          display: grid;
          grid-column-gap: 30px;
          grid-row-gap: 30px;
          grid-template-columns: auto auto;
          background-color: ${userInput.color};
          padding: 20px;
        }
        img {
            border-radius: 50%;
            height: 200px;
            width: 200px;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
        .grid-item {
          background-color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.8);
          padding: 20px;
          font-size: 20px;
          text-align: center;
        }
        a:link {
            color: black;
          }
        </style>
    </head>

    <body>
        <header class="header" style="background-color:${userInput.color};">
            <img src="${gitHub.data.avatar_url}" class="center">
            <div style="background-color:rgba(255, 255, 255, 0.8);">
                <h1 style="text-align:center;">Welcome to my profile</h1>
                <h3 style="text-align:center;">My name is ${gitHub.data.name}</h3>
                <p style="text-align:center;">
                    <a href="https://www.google.com/maps/place/${gitHub.data.location.split(' ').join(',%20')}"
                        class='location fa-fal-icon'>${gitHub.data.location}</a>
                    <a href='${gitHub.data.html_url}'>gitHub</a>
                    <a href="${gitHub.data.blog}" class='location fa-fal-icon'>Blog</a>
                </p>
            </div>
        </header>
        <br>
        <div class="bio" style="text-align: center; background-color:rgba(255, 255, 255, 0.8);">${gitHub.data.bio}</div>
        <br>
        <div class="body" style="background-color:${userInput.color};">
            <div class="grid-container">
                <div class="grid-item">
                    <h5 style="text-align:center;">Public Repositories</h5>
                    <p style="text-align:center;"> ${gitHub.data.public_repos} </p>
                </div>
                <div class="grid-item">
                    <h5 style="text-align:center;">Followers</h5>
                    <p style="text-align:center;"> ${gitHub.data.followers} </p>
                </div>  
                <div class="grid-item">
                    <h5 style="text-align:center;">gitHub Stars</h5>
                    <p style="text-align:center;"> ${starsTotal}</p>
                </div>  
                <div class="grid-item">
                    <h5 style="text-align:center;">Following</h5>
                    <p style="text-align:center;"> ${gitHub.data.following} </p>
                </div>  
            </div>
        </div>
    </body>
    </html>
    `
}