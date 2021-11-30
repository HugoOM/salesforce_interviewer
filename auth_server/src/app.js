const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = 80;

app.use(cookieParser());

app.get("/auth/validate", (req, res) => {
  console.log({
    headers: req.headers,
    body: req.body,
    cookies: req.cookies,
  });

  res.status(req.cookies?.["test-auth-code"] === "1337" ? 200 : 401).send();
});

app.get("/login", (req, res) => res.sendFile("/src/static/index.html"));

app.get("/auth/login", (req, res) => {
  res.cookie("test-auth-code", "1337", {
    domain: "test.com",
    sameSite: true,
    secure: true,
    httpOnly: true,
  });

  res.redirect(302, "/");
});

app.listen(port, () => {
  console.log(`Auth server up`);
});
