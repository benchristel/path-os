const puppeteer = require('puppeteer')
const path = require('path')

;(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto("http://localhost:8080")
  const failures = await page.evaluate(() => {
    return window.allTestResults()
      .filter(r => r.status !== "passed")
      .map(viewFailure)
      .join("\n")

    function viewFailure(failure) {
      return `${failure.subject} ${failure.behavior} FAILED:` + "\n"
        + indent(failure.error.toString())
    }

    function indent(text) {
      return "  " + text.replace(/\n/g, "\n  ")
    }
  })

  console.log(failures || "ALL TESTS PASSED")

  await browser.close();
})();
