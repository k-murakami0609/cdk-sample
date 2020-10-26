const chromium = require("chrome-aws-lambda");
const aws = require("aws-sdk");
const s3 = new aws.S3();
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const Mustache = require('mustache');

exports.handler = async function (event) {
    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
    });

    const body = JSON.parse(event.body);

    const params = {
        body: body.body,
        font: "Noto Sans JP",
        color: body.color,
    };

    const page = await browser.newPage();
    const file = fs.readFileSync(__dirname + "/screen/sample.mustache");
    const output = Mustache.render(file.toString(), params);
    await page.setContent(output);

    const screenshot = await page.screenshot({
        type: "png",
        omitBackground: true,
        encoding: "binary",
        clip: {
            x: 0,
            y: 0,
            width: 1200,
            height: 630
        }
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
        body: `https://${bucket}.s3-ap-northeast-1.amazonaws.com/${key}.png`
    };
};