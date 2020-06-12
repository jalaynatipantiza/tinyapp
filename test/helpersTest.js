const { assert } = require('chai');

const { checkIfEmailExists } = require('../helpers.js');

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