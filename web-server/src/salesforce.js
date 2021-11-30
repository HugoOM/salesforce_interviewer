const { AuthInfo, Connection } = require("@salesforce/core");
const { TestService } = require("@salesforce/apex-node");
const { ComponentSet } = require("@salesforce/source-deploy-retrieve");
const { authenticate } = require("./authenticator");

let connection;

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

async function deploy(folderId) {
  const set = ComponentSet.fromSource([
    `${process.env.EXERCISES_FOLDER}/${folderId}`,
  ]);

  const deployment = await set.deploy({ usernameOrConnection: connection });

  deployment.onUpdate(({ status }) => {
    console.log({ status });
  });

  const deploymentResults = await deployment.pollStatus();

  return deploymentResults;
}

async function test(className) {
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

module.exports = {
  init,
};
