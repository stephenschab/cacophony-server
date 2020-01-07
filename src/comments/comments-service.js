const xss = require('xss');

const CommentsService = {
  getById(db, id) {
    return db
      .from('cacophony_comments AS com')
      .select(
        'com.id',
        'com.text',
        'com.date_created',
        'com.post_id',
        'com.user_id'
        // db.raw(
        //   `row_to_json(
        //     (SELECT tmp FROM (
        //       SELECT
        //         user.id,
        //         user.user_name,
        //         user.email,
        //         user.date_created
        //     ) tmp)
        //   ) AS "user"`
        // )
      )
      .leftJoin(
        'cacophony_users AS user',
        'com.user_id',
        'user.id'
      )
      .where('com.id', id)
      .first();
  },

  insertComment(db, newComment) {
    return db('cacophony_comments')
      .insert(newComment)
      .returning('*')
      .then(([comment]) => comment)
      .then(comment =>
        CommentsService.getById(db, comment.id)
      );
  },

  serializeComment(comment) {
    return {
      id: comment.id,
      text: xss(comment.text),
      post_id: comment.post_id,
      user: comment.user || {}
    };
  }
};

module.exports = CommentsService;