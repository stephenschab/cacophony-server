const xss = require('xss');

const PostsService = {
  getAllPosts(db) {
    return db('cacophony_posts as pst')
      .select('*'
        // 'pst.id',
        // 'pst.title',
        // 'pst.content',
        // 'pst.genre',
        // 'pst.date_created',
        // 'user.user_name'
      );
      // .Join(
      //   'cacophony_users AS user',
      //   'pst.user_id',
      //   'user.id'
      // );
  },

  getById(db, id) {
    return PostsService.getAllPosts(db)
      .where('pst.id', id)
      .first();
  },

  getCommentsForPost(db, post_id) {
    return db('cacophony_comments AS comment')
      .select(
        'comment.id',
        'comment.text',
        'comment.date_created',
        'user.user_name'
      )
      .where('comment.post_id', post_id)
      .join(
        'cacophony_users AS user',
        'comment.user_id',
        'user.id'
      )
      .groupBy('comment.id', 'user.id');
  },

  insertPost(db, newPost) {
    return db('cacophony_posts')
      .insert(newPost)
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

  serializePosts(posts) {
    return posts.map(this.serializePost);
  },

  serializePost(post) {
    return {
      id: post.id,
      title: xss(post.title),
      content: xss(post.content),
      genre: post.genre,
      date_created: post.date_created,
      user_name: post.user_name
    };
  },

  serializePostComments(comments) {
    return comments.map(this.serializePostComment);
  },

  serializePostComment(comment) {
    return {
      id: comment.id,
      text: xss(comment.text),
      post_id: comment.post_id,
      user_name: comment.user_name,
      date_created: comment.date_created
    };
  }
};

module.exports = PostsService;