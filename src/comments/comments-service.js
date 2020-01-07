const xss = require('xss');

const CommentsService = {
  getById(db, id) {
    return db('thingful_comments AS comments')
      .select(
        'comment.id',
        'comment.text',
        'comment.date_created',
        'comment.post_id',
        db.raw(
          `row_to_json(
            (SELECT tmp FROM (
              SELECT
                user.id,
                user.user_name,
                user.email,
                user.date_created
            ) tmp)
          ) AS "user"`
        )
      )
      .leftJoin(
        'cacophony_users AS user',
        'comment.user_id',
        'user.id'
      )
      .where('comment.id', id)
      .first()
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