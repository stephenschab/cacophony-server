const xss = require('xss');

const UsersService = require('../users/users-service')

const CommentsService = {
  getById(db, id) {
    return db
      .from('cacophony_comments AS com')
      .select(
        'com.id',
        'com.text',
        'com.date_created',
        ...userFields
      )
      .join(
        'cacophony_users AS user',
        'user.id',
        'com.user_id'
      )
      .where('com.id', id)
      .first();
  },

  insertComment(db, newComment) {
    return db('cacophony_comments')
      .insert(newComment)
      .returning('*')
      .then(([comment]) => comment);
  },

  serializeComment(comment) {
    return {
      id: comment.id,
      text: xss(comment.text),
      post_id: comment.post_id,
      date_created: comment.date_created,
      user: UsersService.serializeUser(comment.user)
    };
  }
};

const userFields = [
  'user.id AS user:id',
  'user.user_name AS user:user_name'
];

module.exports = CommentsService;