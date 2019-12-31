const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'User 1',
      email: 'fakeEmail1@gmail.com',
      password: '1234'
    }
  ]
}