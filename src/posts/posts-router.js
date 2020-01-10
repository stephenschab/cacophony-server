const express = require('express');

const PostsService = require('./posts-service');
const { requireAuth } = require('../middleware/jwt-auth');

const postsRouter = express.Router();
const jsonBodyParser = express.json();

postsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    PostsService.getAllPosts(req.app.get('db'))
      .then(posts => {
        res.json(PostsService.serializePosts(posts));
      })
      .catch(next)
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { title, content, genre } = req.body;
    const newPost = { title, content, genre };

    for (const [key, value] of Object.entries(newPost)) {
      if (value === undefined) {
        return res
          .status(400)
          .json({
            error: `Missing '${key}' in request body`
          })
      }
    }

    newPost.user_id = req.user.id;

    PostsService.insertPost(
      req.app.get('db'),
      newPost
    )
      .then(post => {
        res
          .status(201)
          .location(`/api/posts/${post.id}`)
          .json(PostsService.serializePost(post))
      })
      .catch(next)
  });

postsRouter
  .route('/:post_id')
  .all(requireAuth)
  .all(checkPostExists)
  .get((req, res) => {
    res.json(PostsService.getById(res.db, res.post));
  });

postsRouter
  .route('/:post_id/comments')
  .all(requireAuth)
  .all(checkPostExists)
  .get((req, res, next) => {
    PostsService.getCommentsForPost(
      req.app.get('db'),
      req.params.post_id
    )
      .then(comments => {
        res.json(PostsService.serializePostComments(comments));
      })
      .catch(next);
  });

async function checkPostExists(req, res, next) {
  try {
    const post = await PostsService.getById(
      req.app.get('db'),
      req.params.post_id
    );
      console.log(post)
    if(!post) {
      return res
        .status(404)
        .json({
          error: 'Post doesn\'t exist'
        })
    }

    res.post = post;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = postsRouter;