const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const saltRounds = 10;

//middlewear 
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["settingthekeytosomethingforsecurityreasonsbecausewelikesafety"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


const urlDatabase = {

    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW"  }
  
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
  const tempDatabase = urlsForUsers(req.session.user_id)
  let templateVars = { 
    urls: tempDatabase,
    user: users[req.session.user_id]
  }
  res.render("urls_index", templateVars);
});

//Add a GET Route to Show the Form
app.get("/urls/new", (req, res) => {
  if(req.session.user_id && users[req.session.user_id]) { 
  const templateVars = {
    user: users[req.session.user_id]
  }
  return res.render("urls_new", templateVars);
} 
  res.redirect("/login")
});


app.get("/urls/:shortURL", (req, res) => {
  console.log(req.cookies);
  if(urlDatabase[req.params.shortURL]) {
    if(req.session.user_id === urlDatabase[req.params.shortURL].userID) { 
      let templateVars = { 
        shortURL: req.params.shortURL, 
        longURL: urlDatabase[req.params.shortURL].longURL,
        user: users[req.session.user_id]
      };
      res.render("urls_show", templateVars);
    } else {
      res.redirect("/urls")
    }
  } else {
    res.send("That url doesn't exist")
  }

});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//returns endpoint for login template
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  }
  res.render("_login", templateVars)
})


//returns endpoint, which returns the template for resgistration
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]   
  }
  res.render("urls_register", templateVars )
});



app.post("/urls", (req, res) => {

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.user_id};
  
  res.redirect(`/urls/${shortURL}`);
});

app.post("/register", (req, res) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);
  const email = req.body.email;
  console.log(hashedPassword);
      //invalid email
  if(!email) {
    return res.status(400).send('Invalid email');

      //invalid password
  } else if(!hashedPassword) {
      return res.status(400).send('Invalid password');
  }
  //if it does work...
  let emailStatus = checkIfEmailExists(req.body.email)
    if(emailStatus) {
      return res.status(400).send('Email already exist')
    }
  const id = generateRandomString();
  const newUser = {
    id,
    email,
    password: hashedPassword
  }
  users[id] = newUser;

  req.session.user_id = id;
  return res.redirect('/urls'); 
})


app.post("/login", (req, res) => {
  const email = req.body.email
  let userId = checkIfEmailExists(email);

  if(!userId) {
    return res.status(403).send('user with that e-mail or password cannot be found');
  }
  const isCorrectPass = bcrypt.compareSync(req.body.password, users[userId].password);
  console.log("check if password is correct", isCorrectPass)
  if(isCorrectPass) {
    req.session.user_id = userId;
    return res.redirect("/urls")
  }
  return res.status(403).send('user with that e-mail or password cannot be found')
})

// //redirect when edited
app.post("/urls/:id", (req, res) => {
  if(req.session.user_id === urlDatabase[req.params.shortURL].userID) {

  urlDatabase[req.params.id] = {longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect("/urls")
  } else {
    res.status(403).send("forbidden")
  }
})

// //redirect when deleted
app.post("/urls/:shortURL/delete", (req, res) => {
  if(req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    const url = req.params.shortURL
    delete urlDatabase[url]
    res.redirect("/urls")
} else {
    res.status(403).send("forbidden")
  }
})

//logout

app.post("/logout", (req, res) => {
  req.session = null
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
      return userId;
    }
  }
  return false;
};

//function that checks if URLs where the userID is equal to the id of the currently logged-in user.
function urlsForUsers(id) {
  let tempDatabase = {};
  for(let shortUrl in urlDatabase) {
    if( urlDatabase[shortUrl].userID === id ) {
     tempDatabase[shortUrl] = urlDatabase[shortUrl]
    }
  }
  return tempDatabase;
}

