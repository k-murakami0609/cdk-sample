const chromium = require("chrome-aws-lambda");
const aws = require("aws-sdk");
const s3 = new aws.S3();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const Mustache = require("mustache");

const COLORS = [
  "#f9a675",
  "#f7bbd9",
  "#e0857d",
  "#cc9ed6",
  "#696969",
  "#7daff4",
  "#f4b4b4",
  "#ada5ea",
  "#bfd180",
  "#bdb7aa",
  "#87ac74",
  "#87c9c7",
  "#a1dbe6",
  "#88c4a6",
  "#eedb7e",
  "#72c1de",
  "#91765e",
  "#c9c986",
  "#c75d68",
  "#d1d1d1",
];

// const FONTS = ["Noto Serif JP"]

const WINDOW_SIZE_WIDTH = 1200;
const WINDOW_SIZE_HEIGHT = 1200;

exports.handler = async function (event) {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  const body = JSON.parse(event.body);
  const bodyLength = [...body.body].length;

  const params = {
    body: body.body,
    bodyLengthClass:
      bodyLength > 48 ? "large" : bodyLength > 35 ? "medium" : "small",
    font: body.font || "Noto Serif JP",
    fontColor:
      body.fontColor || COLORS[Math.floor(Math.random() * COLORS.length + 1)],
    backGroundColor:
      body.backGroundColor ||
      COLORS[Math.floor(Math.random() * COLORS.length + 1)],
    width: WINDOW_SIZE_WIDTH,
    height: WINDOW_SIZE_HEIGHT,
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
      width: WINDOW_SIZE_WIDTH,
      height: WINDOW_SIZE_HEIGHT,
    },
  });
  await browser.close();

  const key = uuidv4();
  const bucket = "cdk-snapshot-sample";
  const result = await s3
    .upload({
      Bucket: "cdk-snapshot-sample",
      Key: `${key}.png`,
      Body: screenshot,
      ContentType: "image/png",
    })
    .promise();

  console.log("request:", JSON.stringify(event, undefined, 2));
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*",
    },
    body: `https://${bucket}.s3-ap-northeast-1.amazonaws.com/${key}.png`,
  };
};
