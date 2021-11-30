const express = require("express");
const app = express();
const port = 80;
const { init } = require("./salesforce");

(async function () {
  const { deploy, test } = await init();

  app.get("/", (_, res) => {
    res.redirect(302, "/index.html");
  });

  app.get("/compile/:fileId", async (req, res) => {
    const deploymentResults = await deploy(req.params.fileId);

    if (!deploymentResults.response.success) {
      return res.json({
        success: false,
        filesState: deploymentResults.getFileResponses(),
      });
    }

    const deployedClass = deploymentResults.components
      .toArray()
      .filter((component) => component.type.id === "apexclass")
      .pop();

    const testResults = await test(deployedClass.name);

    res.json(testResults);
  });

  app.use(express.static(process.env.SRC_FOLDER + "/static"));

  app.listen(port, () => {
    console.log(`Web server up`);
  });
})();
