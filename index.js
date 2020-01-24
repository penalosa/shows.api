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
const ghostToken = process.env.GHOST_TOKEN;

// const Show = mongoose.model(
//   `Show`,
//   new mongoose.Schema(
//     {
//       slug: String,
//       hosts: [String],
//       name: String,
//       description: String,
//       demo: String,
//       pic: String
//     },
//     {
//       typePojoToMixed: false,
//       typeKey: "$type",
//       timestamps: true
//     }
//   )

app.use(express.json());
const GhostAdminAPI = require("@tryghost/admin-api");
const Admin = new GhostAdminAPI({
  url: "https://content.freshair.org.uk",
  key: ghostToken,
  version: "v3"
});

app.get("/all", async (req, res) => {
  try {
    return res.json(
      (await Admin.posts.browse({ limit: "all" }))
        .filter(p => p.tags.find(t => t.slug == "hash-show"))
        .map(s => ({
          slug: s.slug,
          name: s.title,
          hosts: s.authors.map(a => a.slug),
          description: s.html,
          demo: "",
          pic: s.feature_image
        }))
    );
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
