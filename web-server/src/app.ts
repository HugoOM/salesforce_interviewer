import express from "express";
const app = express();
const port = 80;
import { init } from "./salesforce.js";

type CompileAndTestResults = {
  compileResults: {
    success: boolean;
    errors?: {
      line: number;
      message: string;
    }[];
  };
  testResults?: {
    success: boolean;
    tests: {
      status: string;
      name: string;
      message: string;
    }[];
  };
};

(async function () {
  const { deploy, test } = await init();

  app.get("/", (_: express.Request, res: express.Response) => {
    res.sendFile(process.env.SRC_FOLDER + "/src/pages/index.html");
  });

  app.get(
    "/compile/:fileId",
    async (req: express.Request, res: express.Response) => {
      const results: CompileAndTestResults = {
        compileResults: null,
      };

      const deploymentResults = await deploy(req.params.fileId);

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

  app.use(
    "/static",
    express.static(process.env.SRC_FOLDER + "/static", { maxAge: 3600000 })
  );

  app.listen(port, () => {
    console.log(`Web server up`);
  });
})();
