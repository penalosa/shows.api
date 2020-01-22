const mongoose = require("mongoose");
const express = require("express");
const fetch = require("node-fetch");
const AWS = require("aws-sdk");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs").promises;
const md5 = require("md5");
const app = express();
app.use(cors());
const port = process.env.PORT || 8047;
const spacesEndpoint = new AWS.Endpoint("nyc3.digitaloceanspaces.com");
const ghostBase =
  process.env.GHOST_URI || "https://admin.freshair.dev/ghost/api/canary/admin";

const Show = mongoose.model(
  `Show`,
  new mongoose.Schema(
    {
      slug: String,
      hosts: [String],
      name: String,
      description: String,
      demo: String,
      pic: String
    },
    {
      typePojoToMixed: false,
      typeKey: "$type",
      timestamps: true
    }
  )
);

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/prod", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(express.json());

app.get("/import", async (req, res) => {
  const i = JSON.parse(await fs.readFile("./import.json"));
  res.json(await Show.create(i));
});
app.get("/mine", async (req, res) => {
  try {
    let auth = req.headers["x-auth-token"];
    let verify = await fetch(
      process.env.AUTH_API || `http://localhost:8007/verify`,
      {
        method: "POST",
        headers: {
          "X-Auth-Token": auth
        }
      }
    ).then(r => r.json());
    console.log(verify);
    if (!verify.ok) {
      return res.status(401);
    }
    console.log(await Show.find({ hosts: verify.slug }));
    return res.json(await Show.find({ hosts: verify.slug }));
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
});
app.get("/categories", async (req, res) => {
  return res.json(
    [
      `Dance Music`,
      `Indie Music`,
      `Hip Hop/R&B Music`,
      `Pop Music`,
      `Other Music`,
      `Game Show`,
      `Politics`,
      `Discussion/Debate`,
      `Pop Culture`,
      `Sport`,
      `Comedy`,
      `Other`
    ].map(c => ({
      pic: "/FreshairLogoColour.svg",
      name: c,
      slug: c.replace(/[^a-zA-z]+/g, "-").toLowerCase()
    }))
  );
});
app.get("/presenter_type", async (req, res) => {
  return res.json(
    [`Very involved`, `Technical help`, `No preference`].map(c => ({
      pic: "/FreshairLogoColour.svg",
      name: c,
      slug: c.replace(/[^a-zA-z]+/g, "-").toLowerCase()
    }))
  );
});
app.listen(port, () => console.log(`shows.api listening on port ${port}!`));
