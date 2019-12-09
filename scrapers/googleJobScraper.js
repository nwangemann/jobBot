const cheerio = require('cheerio');
const jobBoard = require('../utility/jobBoard');
const file = require('../utility/files');

async function createGoogleJobObjects(html) {
  const $ = cheerio.load(html);
  const results = Promise.all(
    $("#gws-horizon-textlists__job_details_page")
      .map(async (i, el) => {
        const title = $(el)
          .find("h2")
          .text();
        if(jobBoard.jobFilterTitle(title)){
          return;
        }
        const description = $(el)
          .find("span[style='line-height:1.5em']")
          .text();
        const postedBy = $(el)
          .find(" > div > div.kFb3Ed > span")
          .text();
        const applyUrl = $(el)
          .find(" span > a")
          .attr("href")
          .toString();
        const timeStamp = new Date();
        jobBoard.save(title, description, postedBy, applyUrl, timeStamp, "Google Jobs")
        return{ title, description, postedBy, applyUrl }
      }).get()
    )
    return Promise.resolve(results)
}

async function googleScrape(browser, queries) {
  queries.map(async el => {
    let search = el.query.replace(" ", "+");
    let url = `https://www.google.com/search?rlz=1C5CHFA_enUS860US860&sxsrf=ACYBGNQFBvGV7oqKx8JbHS7Bl7RZYx-n_A:1575752693783&ei=9RPsXamkL8ba-gTL1IXYDw&q=${search}&gs_l=psy-ab.3..0l2j0i131j0l7.70925.72801..73402...2.2..1.103.563.6j1......0....1..gws-wiz.......0i71j0i67j0i10i67j0i10j0i13.qs7MRgeogIE&uact=5&ibp=htl;jobs&sa=X&ved=2ahUKEwjk3pfAuKTmAhXCtp4KHbSuB5AQiYsCKAB6BAgKEAM#htivrt=jobs&fpstate=tldetail&htichips=date_posted:today&htischips=date_posted;today&htilrad=48.2802&htidocid=sFqvZk2-c-3VV-g5AAAAAA%3D%3D`;

    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle2" });
      const html = await page.evaluate(() => document.body.innerHTML);
      const jobs = await createGoogleJobObjects(html)
      file.createCsvFile(jobs)
    } catch (err) {
      console.error(err);
    }
  });
}

module.exports = {
  googleScrape,
  createGoogleJobObjects
};