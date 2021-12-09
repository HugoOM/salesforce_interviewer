const fs = require("fs");

const accessCodes = JSON.parse(fs.readFileSync("/access/access.json"));

function validate(accessCode) {
  const accessEntry = accessCodes[accessCode];

  if (!accessEntry) {
    return false;
  }

  const epochNowInSeconds = Date.now() / 1000;

  if (
    epochNowInSeconds < accessEntry.activeFromEpoch ||
    epochNowInSeconds > accessEntry.expiresAtEpoch
  ) {
    return false;
  }

  if (accessEntry.submittedAtEpoch !== null) {
    return false;
  }

  return true;
}

function submit(accessCode) {
  if (!validate(accessCode)) {
    return false;
  }

  const accessEntry = accessCodes[accessCode];

  accessEntry.submittedAtEpoch = Date.now();

  fs.writeFileSync("/access/access.json", JSON.stringify(accessCodes, null, 2));

  return true;
}

module.exports = {
  validate,
  submit,
};
