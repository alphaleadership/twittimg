const puppeteer = require("puppeteer");
const fs = require("fs");

const cookiesFilePath = './cookies.json';
let urlstorage=[]
// Vérifie si le fichier de cookies existe
const cookiesExist = fs.existsSync(cookiesFilePath);

async function readCookiesFromFile() {
  // Vérifie si le fichier de cookies existe
  if (!cookiesExist) {
    return null;
  }

  // Lit le fichier de cookies et retourne son contenu
  const cookiesString = fs.readFileSync(cookiesFilePath);
  const cookies = JSON.parse(cookiesString);
  return cookies;
}

async function saveCookiesToFile(page) {
  // Récupère les cookies de la page actuelle
  const cookies = await page.cookies();

  // Ecrit les cookies dans le fichier
  fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies));
}

let index = 0;
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 30);
    });
  });
}

const tweetUrls = [
  "https://twitter.com/username/status/1234567890",
  "https://twitter.com/username/status/0987654321",
  // Ajoutez d'autres URLs de tweets ici
];

async function processTwitterTweets(urls, browser, page) {
  if (urls.length === 0) {
    return;
  }

  const tweetUrl = urls.shift();
  await getTwitterImages(tweetUrl, browser, page);

  await processTwitterTweets(urls, browser, page);
}

async function getTwitterImages(tweetUrl, browser, page) {
  const dir = `./images`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  console.log(tweetUrl)
  await page.goto(`https://twitter.com/${tweetUrl}/media`, {
    timeout: 0,
    waitUntil: "networkidle2",
  });

  page.on("response", async (response) => {
    let url = response.url();

    if (
      response.request().resourceType() === "image" ||
      response.request().resourceType() === "video"
    ) {
      /**
       * Filter to only collect tweet images and ignore profile pictures and banners.
       */
      if (true) {
        /**
         * Convert twitter image urls to high quality
         */
        const urlcleaner = /(&name=([a-zA-Z0-9_]*$))\b/;
        let cleanurl = url.replace(urlcleaner, "&name=large");

        try {
          const imageDetails = cleanurl.match(
            "https://pbs.twimg.com/media/(.*)?format=(.*)&name=(.*)"
          );
          const imageName = imageDetails[1];
          const imageExtension = imageDetails[2];
          //console.log("Downloading...");

          urlstorage.push(url);
          fs.appendFileSync("./url.txt", url + "\n");
        } catch (error) {}
      } else {
  
      }
    }
  });

  await autoScroll(page);

  console.log("Download Complete");
}

async function processTwitterUrls(urls, browser, page) {
  if (urls.length === 0) {
    return;
  }

  const url = urls.shift();
  await getTwitterImages(url, browser, page);

  await processTwitterUrls(urls, browser, page);
}

async function readTwitterUrlsFromFile(filePath) {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--disable-notifications"],
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1366,
    height: 768,
  });

  await page.goto("https://twitter.com/", {
    timeout: 0,
    waitUntil: "networkidle2",
  });
  page.setDefaultNavigationTimeout(0);
  await page.waitForNavigation();
  await page.waitForNavigation();
  await page.waitForNavigation();
  await saveCookiesToFile(page);
  const c = await readCookiesFromFile(page);
  await page.setCookie(...c);
  await page.waitForNavigation();



  const data = fs.readFileSync(filePath, 'utf8');

  // Supprimer la première ligne
  const lines = data.split('\n');
  lines.shift();
  const updatedContent = lines.join('\n');

  // Réécrire le fichier avec le contenu modifié
  fs.writeFileSync(filePath, updatedContent);

  const urls = data.trim().split('\n');
  const cookies = await page.cookies();
  await processTwitterUrls(urls, browser, page);
  await browser.close();
}

readTwitterUrlsFromFile('./url_twitter.txt').then((x) => {
  fs.appendFileSync("./url.txt", urlstorage.join("\n"));
});
