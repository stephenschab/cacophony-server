const knex = require('knex');
const bcrypt = require('bcryptjs');

const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Users Endpoints', function() {
  let db;

  const { testUsers } = helpers.makePostsFixtures();
  const testUser = testUsers[0];

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

  describe('POST /api/users', () => {
    context('User Validation', () => {
      beforeEach('insert users', () => 
        helpers.seedUsers(
          db,
          testUsers
        )
      );

      const requiredFields = ['user_name', 'email', 'password'];

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          user_name: 'test user_name',
          email: 'test@gmail.com',
          password: 'Testpassw0rd!'
        };

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .post('/api/users')
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`
            });
        });
      });

      it('responds 400 \'Password must be longer than 8 characters\' when short password', () => {
        const userShortPassword = {
          user_name: 'test1',
          email: 'fakeEmail@gmail.com',
          password: 'P2ol!'
        };
        return supertest(app)
          .post('/api/users')
          .send(userShortPassword)
          .expect(400, { error: 'Password must be longer than 8 characters'});
      });

      it('responds 400 \'Password must be less than 72 characters\' when long password', () => {
        const userLongPassword = {
          user_name: 'test1',
          email: 'fakeEmail@gmail.com',
          password: '*'.repeat(73)
        };

        return supertest(app)
          .post('/api/users')
          .send(userLongPassword)
          .expect(400, { error: 'Password must be less than 72 characters' });
      });

      it('responds 400 error when password starts with spaces', () => {
        const passwordStartsWithSpaces = {
          user_name: 'test1',
          email: 'fakeEmail@gmail.com',
          password: ' P4ssw0rd!',
        };

        return supertest(app)
          .post('/api/users')
          .send(passwordStartsWithSpaces)
          .expect(400, { error: 'Password must not start or end with empty spaces'});
      });

      it('responds 400 error when password ends with spaces', () => {
        const passwordEndsWithSpaces = {
          user_name: 'test1',
          email: 'fakeEmail@gmail.com',
          password: 'Passw0rd! ',
        };

        return supertest(app)
          .post('/api/users')
          .send(passwordEndsWithSpaces)
          .expect(400, { error: 'Password must not start or end with empty spaces'});
      });

      it('responds 400 error when password isn\'t complex enough', () => {
        const passwordNotComplex = {
          user_name: 'test1',
          email: 'fakeEmail@gmail.com',
          password: 'password'
        };

        return supertest(app)
          .post('/api/users')
          .send(passwordNotComplex)
          .expect(400, { error: 'Password must contain at least one upper case, lower case, number, and special character'});
      });

      it('responds 400 \'User name already exists\' when user_name isn\'t unique', () => {
        const duplicateUser = {
          user_name: testUser.user_name,
          email: 'fakeEmail@gmail.com',
          password: 'Passw0rd!'
        };

        return supertest(app)
          .post('/api/users')
          .send(duplicateUser)
          .expect(400, { error: 'User name already exists' });
      });
    });

    context('Happy path', () => {
      it('responds 201, serialized user, storing bcrypted password', () => {
        const newUser = {
          user_name: 'test43',
          email: 'fakeEmail43@gmail.com',
          password: 'Passw0rd!'
        };

        return supertest(app)
          .post('/api/users')
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.user_name).to.eql(newUser.user_name);
            expect(res.body.email).to.eql(newUser.email);
            expect(res.body).to.not.have.property('password');
            expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
          })
          .expect(res =>
            db('cacophony_users')
              .select('*')
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.user_name).to.eql(newUser.user_name);
                expect(row.email).to.eql(newUser.email);

                return bcrypt.compare(newUser.password, row.password);
              })
              .then(compareMatch => {
                expect(compareMatch).to.be.true;
              })
          );
      });
    });
  });
});