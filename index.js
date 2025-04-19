/** @format */

const { CheerioCrawler } = require("crawlee");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/scrape", async (req, res) => {
  const targetUrl = req.query.url || "https://example.com"; // Default URL or pass via query
  const data = [];

  const crawler = new CheerioCrawler({
    maxRequestsPerCrawl: 1, // Limit to one page for simplicity
    async requestHandler({ $, request }) {
      // Extract all <a> tags (links)
      $("a").each((index, element) => {
        data.push({
          url: $(element).attr("href") || "",
          text: $(element).text().trim() || "",
          html: $(element).html() || "",
        });
      });
    },
  });

  await crawler.run([targetUrl]);
  res.json(data); // Return JSON to Power Automate
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
