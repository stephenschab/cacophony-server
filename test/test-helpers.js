const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      email: 'fakeEmail1@gmail.com',
      password: 'password1'
    },
    {
      id: 2,
      user_name: 'test-user-2',
      email: 'fakeEmail2@gmail.com',
      password: 'password2'
    },
    {
      id: 3,
      user_name: 'test-user-3',
      email: 'fakeEmail3@gmail.com',
      password: 'password3'
    },
    {
      id: 4,
      user_name: 'test-user-4',
      email: 'fakeEmail4@gmail.com',
      password: 'password4'
    }
  ];
}

function makePostsArray(users) {
  return [];
}

function makeCommentsArray(users, posts) {
  return [];
}

function makeExpectedPost(users, post, comments=[]) {
  const user = users
    .find(user => user.id === post.user_id);
  
  const postComments = comments
    .filter(comment => comment.post_id === post.id);

  const number_of_comments = postComments.length;

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    genre: post.genre,
    date_created: post.date_created,
    number_of_comments,
    user: {
      id: user.id,
      user_name: user.user_name,
      email: user.email,
      date_created: user.date_created
    }
  };
}

function makePostsFixtures() {
  const testUsers = makeUsersArray();
  const testPosts = makePostsArray(testUsers);
  const testComments = makeCommentsArray(testUsers, testPosts);
  return { testUsers, testPosts, testComments };
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      cacophony_users
      RESTART IDENTITY CASCADE`
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))

  return db
    .into('cacophony_users')
    .insert(preppedUsers)
      .then(() =>
      db.raw(
        `SELECT setval('cacophony_users_id_seq', ?)`,
        [users[users.length - 1].id]
      )
    )
}

module.exports = {
  makePostsFixtures,
  cleanTables,
  seedUsers
};