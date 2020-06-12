const { assert} = require('chai');
const {checkIfEmailExists, urlsForUsers } = require('../helpers')


const testUsers = {
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

describe('checkIfEmailExists', function() {
  it('should return a user with valid email', function() {
    const user = checkIfEmailExists("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput);
  });
  it('should return undefined with non-existing email', function () {
    const user = checkIfEmailExists("1234@notvalidemail.com", testUsers)
    const  expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput)
  })
});

const urlDatabase = {

  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW"  },
  dsjghf: { longURL: "https://www.jw.org", userID: "userRandomID"  },
  isdfkd3: { longURL: "https://www.google.ca", userID: "jgdfxfkh"  },
  drgnsfl: { longURL: "https://www.google.ca", userID: "userRandomID"  },
  fdghe8: { longURL: "https://www.google.ca", userID: "aJ48lW"  }
  
};
// return object of all urls that user created
describe('urlsForUsers', function() {
  it('should return object for all urls user created', function() {
    const user = urlsForUsers('userRandomID', urlDatabase)
    const expectedOutput = {
      b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
      dsjghf: { longURL: "https://www.jw.org", userID: "userRandomID"},
      drgnsfl: { longURL: "https://www.google.ca", userID: "userRandomID"}
    }
      assert.deepEqual(user, expectedOutput)
  })
})




