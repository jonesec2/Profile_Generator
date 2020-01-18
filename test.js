const displayName = /*html*/ `
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
            <h3 style="text-align:center;">My name is ${name}</h3>
            <p style="text-align:center;">
                <a href="https://www.google.com/maps/place/${location.split(' ').join(',%20')}"
                    class='location fa-fal-icon'>${location}</a>
                <a href='${gitHub}'>gitHub</a>
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

(async function (displayName) {
    try {

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent('<h1>test</h1>')
        await page.emulateMedia('screen');
        await page.pdf({
            path: 'newTest.pdf',
            format: 'A4',
            printBackground: true
        })

        console.log(displayName);
        await browser.close();
        process.exist


    } catch (e) {
        console.log('our error', e)
    }

})();