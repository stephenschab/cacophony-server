const knex = require('knex');

const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Comments Endpoints', function() {
  let db;

  const {
    testPosts,
    testUsers,
    testComments
  } = helpers.makePostsFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('POST /api/comments', () => {
    beforeEach('insert posts', () =>
      helpers.seedPostsTables(
        db,
        testUsers,
        testPosts,
        testComments
      )
    );

    it('creates a comment, responding with 201 and the new comment', function() {
      this.retries(3);
      const testPost = testPosts[0];
      const testUser = testUsers[0];
      const newComment = {
        text: 'Test new comment',
        post_id: testPost.id
      };
      return supertest(app)
        .post('/api/comments')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newComment)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.body.text).to.eql(newComment.text);
          expect(res.body.post_id).to.eql(newComment.post_id);
          expect(res.body.user.id).to.eql(testUser.id);
          expect(res.headers.location).to.eql(`/api/comments/${res.body.id}`);
          const expectedDate = new Date().toLocaleString();
          const actualDate = new Date(res.body.date_created).toLocaleString();
          expect(actualDate).to.eql(expectedDate);
        })
        .expect(res =>
          db('cacophony_comments')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.text).to.eql(newComment.text);
              expect(row.post_id).to.eql(newComment.post_id);
              expect(row.user_id).to.eql(testUser.user_id);
              const expectedDate = new Date().toLocaleString();
              const actualDate = new Date(res.body.date_created).toLocaleString();
              expect(actualDate).to.eql(expectedDate);
            })
        );
    });


  });
});