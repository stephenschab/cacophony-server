#Cacophony Server

**Create User**
----
  This route is responsible for storing new users in the database.

* **URL**

  /api/users

* **Method**

  `POST`

* **DataParams**

  In order for a successful POST request to this endpoint you must have an user name, email, and password.

  **Required**
  `user_name: ['string']`
  `email: ['string']`
  `password: ['string']`

* **Success Response**

  If you make a successful POSST the server will respond with a successful 200 and the user name and date created.

  * **Code:** 201 CREATED <br />
    **Content:** `{ user_name: 'string', date: new Date() }`

* **Error Response**

  If you fail to make a successful request there are several messages you can receive.

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