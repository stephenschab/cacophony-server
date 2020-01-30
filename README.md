#Cacophony Server

**Create User**
----
  This route is responsible for storing new users in the database.

* **URL**

  /users

* **Method**

  `POST`

* **DataParams**

  In order to make a successful POST request to this endpoint you must have an user name, email, and password.

  **Required** <br />
  `user_name: 'string'` <br />
  `email: 'string'` <br />
  `password: 'string'`

* **Success Response**

  If you make a successful POST the server will respond with a successful 201 and the user name and date created.

  * **Code:** 201 CREATED <br />
    **Content:** `{ user_name: 'string', date: new Date() }`

* **Error Response**

  If you fail to make a successful request there are several messages you may receive.

  * **Code:** 400 BAD REQUEST <br />
    **Content** `{ error: "Missing {field} in request body" }`

  OR

  * **Code** 400 BAD REQUEST <br />
    **Content** `{ error: {Password validation error} }`
  
  OR

  * **Code** 400 BAD REQUEST <br />
    **Content** `{ error: "User name already exists" }`
  
* **Sample Call**

  ```javascript
  fetch(`${config.API_ENDPOINT}/users`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: {
        user_name: 'TestUser'
        email: 'fakeEmail@gmail.com'
        password: 'FaKePaSsW0rD!'
      }
    })
  ```

**User Authorization**
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

  Upon a successful request this endpoint will take the username and password to create and respond with a JWT that is required for __Authorization__ to other endpoints.

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
  fetch(`${config.API_ENDPOINT}/auth/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: {
      user_name: 'TestUser',
      password: 'FaKePaSsW0rD'
    } 
  ```

**Create and Retrieve Posts**
----
  Responsible for storing each new user post and retrieves all users posts.