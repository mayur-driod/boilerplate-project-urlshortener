require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const dns = require('dns');
const urlParser = require('url');

app.use(express.urlencoded({ extended: false }));

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let urlDatabase = {};
let idCounter = 1;

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// app.post("/api/shorturl", (req,res) => {
//   const {url} = req.body;
//   let hostname;

// })

app.post("/api/shorturl", (req, res) => {
  const {url} = req.body;

  let hostname;
  try {
    const parsedUrl = new URL(url); 
    hostname = parsedUrl.hostname;
  } catch (err) {
    return res.json({ error: "invalid url" });
  }

  dns.lookup(hostname, (err, address) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    const shortUrl = idCounter++;
    urlDatabase[shortUrl] = url;

    res.json({
      original_url: url,
      short_url: shortUrl,
    });
  });
});

app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    return res.redirect(originalUrl);
  } else {
    return res.status(404).json({ error: "No short URL found for given input" });
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
