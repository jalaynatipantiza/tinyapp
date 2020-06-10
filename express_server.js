const express = require("express");
const app = express();
const PORT = 8080;
const  cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");

//middlewear 
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// //added additional endpoints (route)
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  //check using if statement if yes pass the cookie if not pass empty string tempcookie name
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies['username']
  }
  res.render("urls_index", templateVars);
});

//Add a GET Route to Show the Form
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
    };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//returns endpoint, which returns the template 
app.get("/register", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_register", templateVars )
});

//username 
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect("/urls")
})
// //redirect when edited
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect("/urls")
})

// //redirect when deleted
app.post("/urls/:shortURL/delete", (req, res) => {
  const url = req.params.shortURL
  delete urlDatabase[url]
  res.redirect("/urls")
})

//logout

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls")
})
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// //generates random short url string
const generateRandomString = () => {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters[Math.floor(Math.random() * charactersLength)];
  }
  return result;
};