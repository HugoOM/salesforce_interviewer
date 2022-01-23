import type { MarkdownFrontmatter } from "../types/webserver";
import { AuthInfo, Connection } from "@salesforce/core";
import { TestService } from "@salesforce/apex-node";
import {
  ComponentSet,
  DeployResult,
  MetadataApiDeploy,
} from "@salesforce/source-deploy-retrieve";
import { authenticate } from "./authenticator.js";

let connection: Connection;

async function init() {
  const { accessToken, instanceUrl } = await authenticate();

  const authInfo = await AuthInfo.create({
    username: process.env.USERNAME,
    accessTokenOptions: {
      accessToken,
      loginUrl: process.env.ORG_URL,
      instanceUrl,
    },
  });

  await authInfo.save();

  connection = await Connection.create({ authInfo });

  await deployInitialContext(connection);

  return { deploy, test };
}

async function deploy(
  fileId: string,
  userAccessCode: string,
  exerciseMetadata: MarkdownFrontmatter
) {
  const set = ComponentSet.fromSource([
    `/testers/${userAccessCode}/${exerciseMetadata.data.exercise_directory}/${fileId}.cls`,
  ]);

  const deployment: MetadataApiDeploy = await set.deploy({
    usernameOrConnection: connection,
  });

  deployment.onUpdate(({ status }: { status: string }) => {
    console.log({ status });
  });

  const deploymentResults: DeployResult = await deployment.pollStatus();

  return deploymentResults;
}

async function test(fileId: string) {
  const testService = new TestService(connection);

  const testResults = await testService.runTestSynchronous(
    {
      tests: [
        {
          className: `${fileId}_Test`,
        },
      ],
      testLevel: "RunSpecifiedTests",
    },
    false
  );

  return testResults;
}

async function deployInitialContext(connection: Connection) {
  const set = ComponentSet.fromSource(["/source/exercises", "/source/tests"]);

  const deployment: MetadataApiDeploy = await set.deploy({
    usernameOrConnection: connection,
  });

  const deploymentResults: DeployResult = await deployment.pollStatus();

  if (!deploymentResults.response.success) {
    throw new Error(
      `Failed to deploy inital package with errors:\n${deploymentResults
        .getFileResponses()
        .map((fileResponse) => JSON.stringify(fileResponse, null, 2))}`
    );
  }

  // TODO: Consider providing "passing/completed" versions of the test for initial deployment -- to validate that the tests can be implemented successfully

  // const testClassesName = fs
  //   .readdirSync("/source/tests")
  //   .filter((fileName) => fileName.split(".").pop() === "cls");

  // const testService = new TestService(connection);

  // const testResults = await testService.runTestAsynchronous({
  //   //@ts-ignore
  //   testLevel: "RunSpecifiedTests",
  //   tests: testClassesName.map((testClassName) => ({
  //     className: testClassName.split(".")[0],
  //   })),
  //   skipCodeCoverage: true,
  // });

  // console.log({ initialTests: testResults });
}

export { init };
