import fs from "fs";

// const apexClassXmlMetadata = `<?xml version="1.0" encoding="UTF-8"?>
// <ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
//     <apiVersion>${process.env.API_VERSION}</apiVersion>
//     <status>Active</status>
// </ApexClass>
// `;

function appendTestsToSourceFile(
  fileId: string,
  sourceFilePath: string,
  outputFilePath: string,
  testsSourceCode: string[]
) {
  fs.mkdirSync(outputFilePath, { recursive: true });

  let testFileContents = `@isTest public without sharing class ${fileId}_Test {
    ${testsSourceCode.join("\n")}
  }`;

  fs.writeFileSync(`${outputFilePath}/${fileId}_Test.cls`, testFileContents, {
    flag: "w+",
  });

  fs.copyFileSync(
    `${sourceFilePath}/${fileId}.cls`,
    `${outputFilePath}/${fileId}.cls`
  );

  fs.copyFileSync(
    `${sourceFilePath}/${fileId}.cls-meta.xml`,
    `${outputFilePath}/${fileId}.cls-meta.xml`
  );

  fs.copyFileSync(
    `${sourceFilePath}/${fileId}.cls-meta.xml`,
    `${outputFilePath}/${fileId}_Test.cls-meta.xml`
  );
}

export { appendTestsToSourceFile };
