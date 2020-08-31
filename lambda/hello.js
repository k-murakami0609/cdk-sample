const chromium = require("chrome-aws-lambda");
const aws = require("aws-sdk");
const s3 = new aws.S3();
const fs = require("fs");

const AWSXRay = require('aws-xray-sdk-core');

exports.handler = async function (event) {
    const seg = AWSXRay.getSegment();
    const subsegment1 = AWSXRay.getSegment().addNewSubsegment('launch');
    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
    });
    subsegment1.close();

    const subsegment2 = AWSXRay.getSegment().addNewSubsegment('set');
    const file = fs.readFileSync(__dirname + "/screen/sample.html");
    const page = await browser.newPage();
    await page.setContent(file.toString());
    subsegment2.close();

    const subsegment3 = AWSXRay.getSegment().addNewSubsegment('screenshot');
    const screenshot = await page.screenshot({
        type: "png",
        fullPage: true,
        omitBackground: true,
        encoding: "binary",
    });
    subsegment3.close();

    await browser.close();

    const subsegment4 = AWSXRay.getSegment().addNewSubsegment('upload');
    const result = await s3.upload({
        Bucket: "cdk-snapshot-sample",
        Key: "test.png",
        Body: screenshot,
        ContentType: "image/png",
    }).promise()
    subsegment4.close();

    console.log("request:", JSON.stringify(event, undefined, 2));
    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: `Hello, CDK! You've hit ${event.path}\n`
    };
};