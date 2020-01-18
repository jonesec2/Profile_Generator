const axios = require("axios");
const inquirer = require("inquirer");
const until = require("until")
const puppeteer = require('puppeteer')
const fs = require("fs-extra");

 const createFile = until.promisify(fs.file);

function createHTML(gitHub, starsTotal) {
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
        <header class="header" style="background-color:${color};">
            <img src="paris.jpg" alt="Paris" class="center">
            <img src="${picture}" style="center">
            <h1 style="text-align:center;">Centered Heading</h1>
            <h3 style="text-align:center;">My name is ${Name}</h3>
            <p style="text-align:center;">
                <a href="https://www.google.com/maps/place/${location.split(' ').join(',%20')}"
                    class='location fa-fal-icon'>${location}</a>
                <a href='${github}'>gitHub</a>
                <a href="${blog}" class='location fa-fal-icon'>Blog</a>
            </p>
        </header>
        <hr>
        <div class="bio" style="text-align: center;">${bio}</div>
        <br>
        <div class="body" style="background-color: ${color};">
            <div></div>
            <div></div>
        </div>



    </body>

</html>
`
}

inquirer
    .prompt([
        {
            message: "Enter your GitHub username",
            name: "username"
        },
        {
            message: "Pick your favorite color",
            name: "color"
        }
    ])

    .then(function ({ username, color }) {

        axios.get(`https://api.github.com/users/${username}`)
            .then(function (res) {xx

                const picture = res.data.avatar_url;
                const name = res.data.name;
                const location = res.data.location;
                const gitHub = res.data.html_url;
                const blog = res.data.blog;
                const bio = res.data.bio;
                const repoNumber = res.data.public_repos;
                const followers = res.data.followers;
                const following = res.data.following;

                axios.get(`https://api.github.com/users/${username}/repos?per_page=100000`)
                    .then(function (res) {

                        // gets the number of stars for each repo
                        // condenses the array into a single total of stars
                        const stars = res.data.map(repo => repo.stargazers_count);
                        const starsTotal = stars.reduce((total, num) => total + num);
                        console.log(starsTotal)
                    })
                    .catch(function (error) {
                        console.log(error);
                    });

            })

    })
    .catch(function (error) {
        console.log(error)
    });