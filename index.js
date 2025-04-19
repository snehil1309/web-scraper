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
    async requestHandler({ $, request }) {
      console.log(`Scraping ${request.url}`);
      console.log(`Page title: ${$("title").text()}`);
      console.log(`Body length: ${$("body").html()?.length || 0} characters`);

      // Try extracting text from common elements
      $("h1, h2, h3, p, a, span, div").each((index, element) => {
        const text = $(element).text().trim();
        if (text && text.length > 1) {
          // Relaxed filter
          data.push({
            url: request.url,
            text: text,
            tag: $(element).prop("tagName").toLowerCase(),
            html: $(element).html() || "",
          });
        }
      });

      // Fall back to <a> tags if no text found (matches original working script)
      if (data.length === 0) {
        $("a").each((index, element) => {
          const text = $(element).text().trim();
          if (text) {
            data.push({
              url: $(element).attr("href") || request.url,
              text: text,
              tag: "a",
              html: $(element).html() || "",
            });
          }
        });
      }

      console.log(`Found ${data.length} text items`);
      if (data.length === 0) {
        console.log(
          `Raw HTML sample: ${$("body").html()?.slice(0, 200) || "No HTML"}...`
        );
      }
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
