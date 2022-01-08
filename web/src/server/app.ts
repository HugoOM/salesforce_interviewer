import type { CompileAndTestResults } from "./types/webserver";
import express from "express";
import cookieParser from "cookie-parser";
const app = express();
const port = 80;
import * as salesforce from "./modules/salesforce.js";
import { parseMarkdown } from "./modules/frontmatter.js";

const exercisesMetadata = parseMarkdown();

(async function () {
  const { deploy, test } = await salesforce.init();

  app.use(cookieParser());

  app.get("/", (_: express.Request, res: express.Response) => {
    res.sendFile(process.env.SRC_FOLDER + "/pages/index.html");
  });

  app.get(
    "/compile/:fileId",
    async (req: express.Request, res: express.Response) => {
      const results: CompileAndTestResults = {
        compileResults: null,
      };

      const { access_code: accessCode } = req.cookies;

      const deploymentResults = await deploy(
        req.params.fileId,
        accessCode,
        exercisesMetadata[req.params.fileId]
      );

      if (!deploymentResults.response.success) {
        results.compileResults = {
          success: false,
          errors: deploymentResults
            .getFileResponses()
            .map((fileResponse: any) => ({
              line: fileResponse.lineNumber as number,
              message: fileResponse.error as string,
            })),
        };

        return res.json(results);
      }

      results.compileResults = {
        success: true,
      };

      const deployedClassName = (
        deploymentResults.components
          .toArray()
          .filter((component: any) => component.type.id === "apexclass")
          .pop() as any
      ).name;

      const testResults: any = await test(deployedClassName);

      results.testResults = {
        success: testResults.summary.failRate === "0%",
        tests: testResults.tests.map((test: any) => ({
          status: test.outcome,
          name: test.methodName,
          message: test.message,
        })),
      };

      res.json(results);
    }
  );

  app.get(
    "/exercises/:fileId",
    (request: express.Request, response: express.Response) => {
      response
        .type("text/markdown")
        .status(200)
        .send(exercisesMetadata[request.params.fileId].content);
    }
  );

  app.use(
    "/static",
    express.static(`${process.env.SRC_FOLDER}/static`, { maxAge: 3600000 })
  );

  app.listen(port, () => {
    console.log(`Web server up`);
  });
})();
