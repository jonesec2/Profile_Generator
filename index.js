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
        console.log(userInput.username)

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
        console.log(`Successfully wrote for ${userInput.username}.html`);
        
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
        <style></style>
    </head>

    <body>
        <header class="header" style="background-color:${userInput.color};">
            <img src="paris.jpg" alt="Paris" class="center">
            <img src="${gitHub.data.avatar_url}" style="center">
            <h1 style="text-align:center;">Centered Heading</h1>
            <h3 style="text-align:center;">My name is ${gitHub.data.name}</h3>
            <p style="text-align:center;">
                <a href="https://www.google.com/maps/place/${gitHub.data.location.split(' ').join(',%20')}"
                    class='location fa-fal-icon'>${gitHub.data.location}</a>
                <a href='${gitHub.data.html_url}'>gitHub</a>
                <a href="${gitHub.data.blog}" class='location fa-fal-icon'>Blog</a>
            </p>
        </header>
        <hr>
        <div class="bio" style="text-align: center;">${gitHub.data.bio}</div>
        <br>
        <div class="body" style="background-color: ${userInput.color};">
            <div>${starsTotal}</div>
            <div></div>
        </div>

    </body>

</html>
`
}