# Cacophony Server

This server handles all of the backend processes for the Cacophony client. This stores Cacophony's user infromation, handles the user authentication, and stores any posts or comments a user makes on the client side.

[Client Repo](https://github.com/stephenschab/cacophony-client)

**Server URL:** [https://shielded-ridge-85753.herokuapp.com/api](https://shielded-ridge-85753.herokuapp.com/api)

**Tech Stack:** NodeJS, Express, Mocha & Chai

## **Create User**
----
  This route is responsible for storing new users in the database.

* **URL**

  /users

* **Method**

  `POST`

* **DataParams**

  In order to make a successful POST request to this endpoint you must have a user name, email, and password.

  **Required** <br />
  `user_name: 'string'` <br />
  `email: 'string'` <br />
  `password: 'string'`

* **Success Response**

  If you make a successful POST the server will respond with a successful 201 and the user name and date created.

  * **Code:** 201 CREATED <br />
    **Header:** Location: /users/:user_id <br />
    **Content:** `{ user_name: 'string', date: new Date() }`

* **Error Response**

  If you fail to make a successful request there are several messages you may receive.

  * **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: "Missing {field} in request body" }`

  OR

  * **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: "Password must {requirement}" }`
  
  OR

  * **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: "User name already exists" }`
  
* **Sample Call**

  ```javascript
  fetch(`${config.API_ENDPOINT}/users`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        user_name: 'TestUser',
        email: 'fakeEmail@gmail.com',
        password: 'FaKePaSsW0rD!'
      })
    })
  ```

## **User Authorization**
----

  Handles the authorization of user credentials.

* **URL**

  /login

* **Method**

  `POST`

* **Data Params**

  A POST to this endpoint requires a user name and password.

  **Required:** <br />
  `user_name: 'string'` <br />
  `password: 'string'`

* **Success Response**

  Upon a successful request this endpoint will take the username and password. With correct credentials this endpoint creates a JWT and responds with it.

  * **Code:** 200 SUCCESS <br />

* **Error Response**

  Request will fail if made with a user name and password are not found in the database.

  * **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: "Missing {field} in request body" }`
  OR

  * **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: "Incorrect user_name or password" }`

* **Sample Call**

  ```javascript
  fetch(`{server url}/auth/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: {
      user_name: 'TestUser',
      password: 'FaKePaSsW0rD'
    } 
  ```

## **Create and Retrieve Posts**
----
  Responsible for storing each new user post and retrieves all users posts, a single post based off of the post id or all of the comments for a single post.

* **URL**

  /posts <br />
  /posts/:post_id <br />
  /posts/:post_id/comments

* **Method**

  `GET` | `POST`

* **URL Params**

  In order to reach the single post or post comments endpoints you must have the id of the post you are trying to access.

  **Required**

  `post_id= integer`

* **Data Params**

  * /posts

  Requires a JWT in order to access this endpoint.

  **Required**

  `JWT={generated on login}`

  * POST /posts

  In order to add a post to the database you must send a title, content, and genre.

  **Required**

  `title='string'` <br />
  `content='string'` <br />
  `genre='string'`

  * GET /posts/:post_id

  This endpoint requires the id of a post in order to retrieve that post

  **Required**

  `post_id=integer`

  * GET /posts/:post_id/comments

  In order to retrieve the comments for a specific post you need to send theid of the post.

  **Required**

  `post_id=integer`

* **Success Response**

  * GET /posts

    * **Code:** 200 <br />
      **Content:** `[ array of posts ]`

  * POST /posts

    * **Code:** 201 <br />
      **Headers:** Location: /posts/:post_id <br />
      **Content:**
      ```javascript 
      {
        title='Fake Post',
        content='This is my really cool project check it out!',
        genre='Rock'
      }
      ```
  
  * GET /posts/:post_id

    * **Code:** 200 <br />
      **Content:**
      ```javascript
      {
        title='Fake Post',
        content='This is my really cool project check it out!',
        genre='Rock'
      }
      ```
  
  * GET /posts/:post_id/comments

    * **Code:** 200 <br />
      **Content:** `[ array of comments ]`

* **Error Response**

  * /posts

    If you do not provide a bearer token when attempting to access the endpoint you will receive an error

    * **Code:** 401 <br />
      **Content:** `{ error: 'Missing bearer token' }`
  
  * POST /posts

    If you attempt to make a post without sending a title, content, and genre will result in an error.

    * **Code:** 400 <br />
      **Content:** `{ error: `Missing '{field}' in request body` }`
  
  * GET /posts/:post_id | GET /posts/:post_id/comments

    If the post that you are trying to access in the database does not exist you will receive an error.

    * **Code:** 404
      **Content:** `{ error: 'Post doesn't exist' }`

* **Sample Call**

  * GET /posts
    ```javascript
    fetch(`${config.API_ENDPOINT}/posts`, {
      headers: {
        'authorization': `bearer {JWT}`
      }
    })
    ```
  
  * POST /posts
    ```javascript
    fetch(`{server url}/posts`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `bearer {JWT}`
      },
      body: JSON.stringify({
        title='Fake Post',
        content='This is my really cool project check it out!',
        genre='Rock',
        user_id=1
      })
    })
    ```

  * GET /posts/:post_id
    ```javascript
    fetch(`{server url}/posts/{post_id}`, {
      headers: {
        'authorization': `bearer {JWT}`
      }
    })
    ```

  * GET /posts/:post_id/comments
    ```javascript
    fetch(`{server url}/posts/{post_id}/comments`, {
      headers: {
        'authorization': `bearer {JWT}`
      }
    })
    ```

## **Create Comments**
----
  This endpoint handles the creation of all of the comments in the database

* **URL**

  /comments

* **Method:**

  POST

* **Data Params**

  In order to make a successful post to the comments database you are required to have a JWT, send text, and the id of the post you want to comment on.

  **Required**

  `JWT={generated on login}` <br />
  `text='string'` <br />
  `post_id=integer`

* **Success Response**

  Upon a successful request the endpoint will respond with a 201 code, the location of the comment, and the comment itself

  * **Code:** 201 <br />
    **Headers:** Location: /comments/:comment_id <br />
    **Content:**
    ```javascript
    {
      id: 1,
      text: 'This is a totally fake comment',
      post_id: 4,
      dateCreated: new Date(),
      user: 5
    }
    ```

* **Error Response**

  if you do not submit the required JWT or appropriate fields for a comment you will receive an error.

  * **Code:** 401 <br />
    **Content:** `{ error: 'Missing bearer token' }`

  OR

  * **Code:** 400 <br />
    **Content:** `{ error: 'Missing '{field}' in request body'}`

* **Sample Call**

  ```javascript
  fetch(`{server url}/comments`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `bearer {JWT}`
      },
      body: JSON.stringify({
        text: 'This is a totally fake comment',
        post_id: 4
      })
    })
  ```
