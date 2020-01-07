const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      email: 'fakeEmail1@gmail.com',
      password: 'password1',
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 2,
      user_name: 'test-user-2',
      email: 'fakeEmail2@gmail.com',
      password: 'password2',
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 3,
      user_name: 'test-user-3',
      email: 'fakeEmail3@gmail.com',
      password: 'password3',
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 4,
      user_name: 'test-user-4',
      email: 'fakeEmail4@gmail.com',
      password: 'password4',
      date_created: '2029-01-22T16:28:32.615Z'
    }
  ];
}

function makePostsArray(users) {
  return [
    {
      id: 1,
      title: 'Test Post 1',
      content: 'eu nisl nunc mi ipsum faucibus vitae aliquet nec ullamcorper sit amet',
      genre: 'Rock',
      user_id: users[0].id,
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 2,
      title: 'Test Post 2',
      content: 'placerat orci nulla pellentesque dignissim enim sit amet venenatis urna cursus eget nunc scelerisque viverra mauris in aliquam sem fringilla',
      genre: 'Rock',
      user_id: users[1].id,
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 3,
      title: 'Test Post 3',
      content: 'ultrices tincidunt arcu non sodales neque sodales ut etiam sit amet nisl purus in mollis nunc',
      genre: 'Rock',
      user_id: users[2].id,
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 4,
      title: 'Test Post 4',
      content: 'massa vitae tortor condimentum lacinia quis vel eros',
      genre: 'Rock',
      user_id: users[3].id,
      date_created: '2029-01-22T16:28:32.615Z'
    },
  ];
}

function makeCommentsArray(users, posts) {
  return [
    {
      id: 1,
      text: 'Test comment 1',
      post_id: posts[0].id,
      user_id: users[0].id,
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 2,
      text: 'Test comment 2',
      post_id: posts[0].id,
      user_id: users[1].id,
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 3,
      text: 'Test comment 3',
      post_id: posts[0].id,
      user_id: users[2].id,
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 4,
      text: 'Test comment 4',
      post_id: posts[0].id,
      user_id: users[3].id,
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 5,
      text: 'Test comment 5',
      post_id: posts[posts.length - 1].id,
      user_id: users[0].id,
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 6,
      text: 'Test comment 6',
      post_id: posts[posts.length - 1].id,
      user_id: users[2].id,
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 7,
      text: 'Test comment 7',
      post_id: posts[3].id,
      user_id: users[0].id,
      date_created: '2029-01-22T16:28:32.615Z'
    }
  ];
}

function makeExpectedPost(users, post) {
  const user = users
    .find(user => user.id === post.user_id);

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    genre: post.genre,
    date_created: post.date_created,
    user: {
      id: user.id,
      user_name: user.user_name,
      email: user.email,
      date_created: user.date_created
    }
  };
}

function makeExpectedPostComments(users, postId, comments) {
  const expectedComments = comments.filter(comment => comment.post_id === postId);

  return expectedComments.map(comment => {
    const commentUser = users.find(user => user.id === comment.user_id)

    return {
      id: comment.id,
      text: comment.text,
      date_created: comment.date_created,
      user: {
        id: commentUser.id,
        user_name: commentUser.user_name,
        email: commentUser.email,
        date_created: commentUser.date_created
      }
    }
  });
}

function makeMaliciousPost(user) {
  const maliciousPost = {
    id: 911,
    date_created: new Date().toISOString(),
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    user_id: user.id,
    genre: 'Rock',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
  }

  const expectedPost = {
    ...makeExpectedPost([user], maliciousPost),
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  }

  return {
    maliciousPost,
    expectedPost
  }
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
      cacophony_users,
      cacophony_posts,
      cacophony_comments
      RESTART IDENTITY CASCADE;`
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

function seedPostsTables(db, users, posts, comments) {
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('cacophony_posts').insert(posts)
    await trx.raw(
      'SELECT setval(\'cacophony_posts_id_seq\', ?)',
      [posts[posts.length - 1].id]
    )
    await trx.into('cacophony_comments').insert(comments)
    await trx.raw(
      'SELECT setval(\'cacophony_comments_id_seq\', ?)',
      [comments[comments.length - 1].id]
    )
  })
}

function seedMaliciousPost(db, user, post) {
  return seedUsers(db, [user])
    .then(() =>
      db('cacophony_posts')
        .insert([post])
    );
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: 'HS256'
  })
  return `Bearer ${token}`
}

module.exports = {
  makeUsersArray,
  makePostsArray,
  makeExpectedPost,
  makeExpectedPostComments,
  makeMaliciousPost,
  makeCommentsArray,

  makePostsFixtures,
  cleanTables,
  seedPostsTables,
  seedMaliciousPost,
  makeAuthHeader,
  seedUsers
};