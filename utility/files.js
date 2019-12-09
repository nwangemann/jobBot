const ObjectsToCsv = require("objects-to-csv");

async function createCsvFile(data) {
  const csv = new ObjectsToCsv(data)
  await csv.toDisk('./jobs.csv', { append: true });
  console.log("csv written");
}

module.exports = {
  createCsvFile
}