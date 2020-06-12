//check if email exists
const checkIfEmailExists = (email, database) => {
  for (let userId in database) {
    if (database[userId].email === email) {
      return userId;
    }
  }
  return false;
};

//checks if URLs where the userID is equal to the id of the currently logged-in user.
const urlsForUsers = (id, database) => {
  let tempDatabase = {};
  for (let shortUrl in database) {
    if (database[shortUrl].userID === id) {
      tempDatabase[shortUrl] = database[shortUrl];
    }
  }
  return tempDatabase;
};

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

module.exports = {
  checkIfEmailExists,
  urlsForUsers,
  generateRandomString
};