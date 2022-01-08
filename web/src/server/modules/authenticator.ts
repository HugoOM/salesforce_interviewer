import jwt from "jsonwebtoken";
import ax from "axios";
import fs from "fs";

const axios = ax.create({
  baseURL: process.env.ORG_URL,
});

async function authenticate() {
  const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH);

  var token = jwt.sign(
    {
      iss: process.env.CLIENT_ID,
      aud: process.env.ORG_URL,
      sub: process.env.USERNAME,
      exp: 5740590942, //Year 2151
    },
    privateKey,
    { algorithm: "RS256" }
  );

  const {
    data: { access_token: accessToken, instance_url: instanceUrl },
  } = await axios({
    method: "POST",
    url: "/services/oauth2/token",
    data: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: encodeURIComponent(token),
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return { accessToken, instanceUrl };
}

export { authenticate };
