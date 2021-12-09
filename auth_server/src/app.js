const express = require("express");
const cookieParser = require("cookie-parser");
const { validate, submit } = require("./authenticate");
const app = express();
const port = 80;

app.use(cookieParser());

app.get("/auth/validate", (req, res) => {
  const { "access-code": accessCode } = req.cookies;

  res.sendStatus(accessCode && validate(accessCode) ? 200 : 401);
});

app.get("/login", (_, res) => res.sendFile("/src/static/login.html"));

app.get("/auth/login/", (req, res) => {
  const { accessCode } = req.query;

  if (!accessCode) {
    return res.redirect("/login?error=missing");
  }

  if (!validate(accessCode)) {
    return res.redirect("/login?error=invalid");
  }

  res.cookie("access-code", accessCode, {
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
