const chromium = require("chrome-aws-lambda");
const aws = require("aws-sdk");
const s3 = new aws.S3();
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');

exports.handler = async function (event) {
    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
    });

    const file = fs.readFileSync(__dirname + "/screen/sample.html");
    const page = await browser.newPage();
    await page.setContent(file.toString());

    const screenshot = await page.screenshot({
        type: "png",
        fullPage: true,
        omitBackground: true,
        encoding: "binary",
    });
    await browser.close();

    const key = uuidv4();
    const bucket = "cdk-snapshot-sample";
    const result = await s3.upload({
        Bucket: "cdk-snapshot-sample",
        Key: `${key}.png`,
        Body: screenshot,
        ContentType: "image/png",
    }).promise();

    console.log("request:", JSON.stringify(event, undefined, 2));
    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: `${bucket}/${key}.png`
    };
};