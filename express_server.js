const express = require("express");
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();
const PORT = 8080;
const {checkIfEmailExists, urlsForUsers, generateRandomString } = require("./helpers");


//middleware
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["settingthekeytosomethingforsecurityreasonsbecausewelikesafety"],
  maxAge: 24 * 60 * 60 * 1000
}));

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
};

//GETS

// endpoint that redirects to urls or login page 
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect('/login');
  }
});

//Route that GETS user template urls_index 
app.get("/urls", (req, res) => {
  const tempDatabase = urlsForUsers(req.session.user_id, urlDatabase);
  let templateVars = {
    urls: tempDatabase,
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

//Add a GET Route to Show Form of creating new url or to login
app.get("/urls/new", (req, res) => {
  if (req.session.user_id && users[req.session.user_id]) {
    const templateVars = {
      user: users[req.session.user_id]
    };
    return res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});

// renders urls_show page if user is logged in and owns url otherwise redirects
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    if (req.session.user_id) {
      if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
        let templateVars = {
          shortURL: req.params.shortURL,
          longURL: urlDatabase[req.params.shortURL].longURL,
          user: users[req.session.user_id]
        };
        return res.render("urls_show", templateVars);
      } else {
        return res.send("You can only view your own <a href='/urls'>urls</a>");
      }
    }
  } else if (req.session.user_id) {
    return res.send("That url doesn't exist, <a href='/urls'>go back</a>");
  }
  return res.send("Please log in or register <a href='/login'>urls</a>");
  
});

//redirects to long url if it exists
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.send("Sorry that url doesn't exist, <a href='/urls'>go back</a>");
  }
});

//returns endpoint for login template
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render("_login", templateVars);
});


//Returns the template for resgistration
app.get("/register", (req, res) => {
  if (req.session.user_id && req.session.user_id === users[req.session.user_id]) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_register", templateVars);
  }
});


//POSTS



app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect(`/urls/${shortURL}`);
});

//redirect user to url page when user edits 
app.post("/urls/:id", (req, res) => {
  if (req.session.user_id && req.session.user_id === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id] = {longURL: req.body.longURL, userID: req.session.user_id};
    res.redirect("/urls");
  } else {
    res.status(403).send("forbidden");
  }
});

//Allows user to delete and then redirects back to url page
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    const url = req.params.shortURL;
    delete urlDatabase[url];
    res.redirect("/urls");
  } else {
    res.status(403).send("forbidden");
  }
});

//login process to check if user already registered or not
app.post("/login", (req, res) => {
  const email = req.body.email;
  let userId = checkIfEmailExists(email, users);
  
  if (!userId) {
    return res.status(403).send('user with that e-mail or password cannot be found');
  }
  const isCorrectPassword = bcrypt.compareSync(req.body.password, users[userId].password);

  if (isCorrectPassword) {
    req.session.user_id = userId;
    return res.redirect("/urls");
  }
  return res.status(403).send('user with that e-mail or password cannot be found');
});

//registering process
app.post("/register", (req, res) => {
  const email = req.body.email;
  
  //for email line left blank 
  if (!email) {
    return res.status(400).send('<h1>Invalid email</h1>');

    //for password line left blank
  } else if (!req.body.password) {
    return res.status(400).send('<h1>Invalid password</h1>');
  }
  //if both email and password works sucessfully then register new user 
  let emailStatus = checkIfEmailExists(req.body.email, users);
  if (emailStatus) {
    return res.status(400).send('<h1>Email already exist</1>');
  }
  const hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);
  const id = generateRandomString();
  const newUser = {
    id,
    email,
    password: hashedPassword
  };
  users[id] = newUser;
  req.session.user_id = id;
  return res.redirect('/urls');
});


//once logged out clears cookies and redirects
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

