const xss = require('xss');
const Treeize =require('treeize');

const PostsService = {
  getAllPosts(db) {
    return db('cacophony_posts as pst')
      .select(
        'pst.id',
        'pst.title',
        'pst.content',
        'pst.genre',
        'pst.date_created',
        ...userFields
      )
      .leftJoin(
        'cacophony_comments AS comments',
        'pst.id',
        'comments.post_id'
      )
      .leftJoin(
        'cacophony_users AS user',
        'pst.user_id',
        'user.id'
      )
      .groupBy('pst.id', 'user.id');
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
        ...userFields
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
    const postTree = new Treeize();

    const postData = postTree.grow([ post ]).getData()[0];

    return {
      id: postData.id,
      title: xss(postData.title),
      content: xss(postData.content),
      genre: postData.genre,
      date_created: postData.date_created,
      user_id: postData.user_id || {},
    };
  },

  serializePostComments(comments) {
    return comments.map(this.serializePostComment);
  },

  serializePostComment(comment) {
    const commentTree = new Treeize();

    const commentData = commentTree.grow([ comment ]).getData()[0];

    return {
      id: comment.id,
      text: xss(commentData.text),
      post_id: commentData.post_id,
      user: commentData.user,
      date_created: commentData.date_created
    };
  }
};

const userFields = [
  'user.id AS user:id',
  'user.user_name AS user:user_name'
];

module.exports = PostsService;