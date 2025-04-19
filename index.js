/** @format */

const { CheerioCrawler } = require("crawlee");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/scrape", async (req, res) => {
  const targetUrl = req.query.url || "https://example.com";
  const data = [];

  const crawler = new CheerioCrawler({
    maxRequestsPerCrawl: 1,
    additionalHttpHeaders: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    async requestHandler({ $, request }) {
      // Select all visible text from <body>, excluding scripts, styles, and hidden elements
      $("body")
        .find("*")
        .not('script, style, [style*="display:none"]')
        .each((index, element) => {
          const text = $(element).text().trim();
          if (text && text.length > 3) {
            // Exclude very short text (e.g., icons, whitespace)
            data.push({
              url: request.url,
              text: text,
              tag: $(element).prop("tagName").toLowerCase(), // Store tag for context
              html: $(element).html() || "",
            });
          }
        });

      console.log(`Scraping ${request.url}: Found ${data.length} text items`);
    },
    failedRequestHandler({ request, error }) {
      console.error(`Failed to scrape ${request.url}: ${error.message}`);
    },
  });

  try {
    await crawler.run([targetUrl]);
    if (data.length === 0) {
      res.json({ message: "No text found", url: targetUrl });
    } else {
      res.json(data);
    }
  } catch (error) {
    console.error(`Crawler error: ${error.message}`);
    res.status(500).json({ error: "Failed to scrape", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
