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
    username: "hmonette@dev.io",
    accessTokenOptions: {
      accessToken,
      loginUrl: process.env.ORG_URL,
      instanceUrl,
    },
  });

  await authInfo.save();

  connection = await Connection.create({ authInfo });

  return { deploy, test };
}

async function deploy(folderId: string) {
  const set = ComponentSet.fromSource([
    `${process.env.EXERCISES_FOLDER}/${folderId}`,
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

async function test(className: string) {
  const testService = new TestService(connection);

  const testResults = await testService.runTestSynchronous(
    {
      tests: [
        {
          className: `${className}_Test`,
        },
      ],
      testLevel: "RunSpecifiedTests",
    },
    false
  );

  return testResults;
}

export { init };
