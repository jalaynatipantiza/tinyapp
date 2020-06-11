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
  let templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_index", templateVars);
});

//Add a GET Route to Show the Form
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
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
    user: users[req.cookies["user_id"]]
    };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//returns endpoint, which returns the template for resgistration
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]   
  }
  res.render("urls_register", templateVars )
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if(!email) {
    return res.status(400).send('Invalid email');

  } else if(!password) {
    return res.status(400).send('Invalid password');
  }
  let emailStatus= checkIfEmailExists(req.body.email)
  if(emailStatus) {
    return res.status(400).send('Email already exist')
  }
  const id = generateRandomString();
  const newUser = {
    id,
    email,
    password
  }
  users[id] = newUser;

  res.cookie("user_id", id ) 
  console.log(users); 
  return res.redirect('/urls'); 
})


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
  res.clearCookie("user_id")
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

//check if email exists
function checkIfEmailExists(email) {
  for (let userId in users) {
    if (users[userId].email === email) {
      return true;
    }
  }
  return false;
};

