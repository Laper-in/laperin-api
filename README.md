<div align="center">

<!-- <img src="public\assets\LAPERINS LOGO.png" alt="Logo" width="500"/> -->
<img src="public\assets\LOGO NORMALS.png" alt="Logo" width="500"/>

#### LaperinAPI
[![GitHub total commits](https://img.shields.io/github/commit-activity/y/Laper-in/laperin-api/main)](https://github.com/Laper-in/laperin-api/commits/main)
[![GitHub commits](https://img.shields.io/github/last-commit/Laper-in/laperin-api)](https://github.com/Laper-in/laperin-api/commits/main)
[![GitHub contributors](https://img.shields.io/github/contributors/Laper-in/laperin-api)](https://github.com/Laper-in/laperin-api/graphs/contributors)
[![GitHub license](https://img.shields.io/github/license/Laper-in/laperin-api)](https://github.com/Laper-in/laperin-api/blob/main/LICENSE)



</div>

## **About**
Laperin API is a server-side JavaScript application built with Node.js and Express.js, offering developers a powerful platform for creating high-performance and scalable APIs. Leveraging the strengths of Node.js and the flexibility of Express.js, Laperin API simplifies the development process and streamlines the creation of web APIs.


<br>

## **Using LaperinAPI**
To leverage the capabilities of this API, developers can follow a straightforward process. Begin by reviewing the API documentation, which provides comprehensive insights into available endpoints, request/response formats, and any required authentication. Next, obtain the necessary API key or authentication credentials to access protected resources. With the API key in hand, integrate the API into your application by making HTTP requests to the specified endpoints. Pay attention to response codes and data formats to ensure seamless communication with the API. Implement error handling mechanisms to gracefully manage unexpected scenarios. Regularly check for updates or version changes in the API documentation to stay informed about new features or improvements. By adhering to these steps and guidelines, developers can effectively harness the functionality offered by this API within their applications.

#### Prerequisites
* Git
* [Node.js](https://nodejs.org/en/) (16.x) - [Download](https://nodejs.org/en/)
* [XAMPP](https://www.apachefriends.org/download.html) (Version 8.0.30)
* [MySQL](https://www.mysql.com/downloads/)

#### Installation
1. [Download laperin-api](google.com) or [GIT CLONE](https://github.com/Laper-in/laperin-api.git) and unzip the download.
2. Open the unzipped folder in your terminal.
3. Install the dependencies by running `npm install` in your terminal. 
4. Configure the `config.json` `.env` file. See below for more details.
5. Generate database table by running `npx sequelize-cli db:migrate`
6. Start laperin-api by running `npm start` in your terminal.


<br>

## **Configuring**
Laperin API simplifies database configuration through a JSON configuration file. By default, the configuration file is named [config.json](/src/database/config/config.json) and [.env](.env)  resides in the laperin-api directory. Ensure that the config file adheres to valid JSON syntax for seamless integration with your database.

### **Database Configuration**
To customize your database settings, locate and modify the config.json file. Adjust parameters such as database host, port, username, password, and database name according to your specific requirements.

<details>
  <summary>Database</summary>

### config.json configuration

The following section of the configuration contains information about your config.json.

  ```json

  "development": {
    "username": "your_dev_username",
    "password": "your_dev_password",
    "database": "your_dev_database",
    "host": "your_dev_host",
    "dialect": "mysql"
  },
  "test": {
    "username": "your_test_username",
    "password": "your_test_password",
    "database": "your_test_database",
    "host": "your_test_host",
    "dialect": "mysql"
  },
  "production": {
    "username": "your_prod_username",
    "password": "your_prod_password",
    "database": "lyour_prod_database",
    "host": "your_prod_host",
    "dialect": "mysql"
  }
  ```
* `username` - The name of the user for database access.
* `password` - The password for database access.
* `database` - The name of the database in use.
* `host` - The IP address or host of the database server.
* `dialect` - The type of database being used (in this case, MySQL).

  ---
</details>


### **JWT and Google Cloud Storage Configuration**
For JWT (JSON Web Token) and Google Cloud Storage configuration, create a .env file in the root directory of your laperin-api. Include the following details in the .env file:
<details>
  <summary>Environment</summary>

### .env configuration

The following section of the configuration contains information about your .env config.

  ```bash
  
    JWT_SECRET=your_jwt_secret_key
    REFRESH_TOKEN_SECRET=your_refresh_token_secret_key
    GCLOUD_PROJECT=your_gcloud_project_id
    GCS_KEYFILE=your_gcs_keyfile_path
    GCS_BUCKET=your_gcs_bucket_name
  
  ```
* `JWT_SECRET` - Secret key used for JWT (JSON Web Token) generation and verification.
* `REFRESH_TOKEN_SECRET` - Secret key used for refreshing JWT tokens.
* `GCLOUD_PROJECT` - Google Cloud Project ID.
* `GCS_KEYFILE` - Path to the JSON key file for Google Cloud Storage authentication.
*  `GCS_BUCKET` - Name of the Google Cloud Storage bucket.
  ---
</details>

## **API**
The following is a list of API built into laperinapi, you can click their title for more information:

#### **USERS**
The user management API encompasses a range of endpoints to facilitate diverse operations on user accounts. Beginning with user registration, the `/signup` endpoint processes POST requests to create new accounts, while the `/signin` endpoint handles logins for existing users. To prioritize security, token-based authentication is enforced across various endpoints, including `/signout` for secure logouts and `/id` for updating user profiles and optional image uploads. The API maintains stringent access controls by verifying authentication, ownership, and authorization for actions like updating online status through `/status`, deleting accounts via `/delete/:id`, retrieving detailed user information using `/id`, and allowing administrators to search for users with the `/search/username` endpoint. These measures collectively ensure the protection of user data and reinforce the API's robust security architecture.
<details>
  <summary>Users model</summary>

#### User Model

  
* `id`: A string field with a maximum length of 10 characters, serving as the primary key for user identification. It is set as the primary key and has a default value generated using the nanoid library, ensuring uniqueness.
* `username`: A string field with a maximum length of 50 characters, representing the user's chosen username for identification.
* `email`: A string field with a maximum length of 100 characters, storing the user's email address for communication and login purposes.
* `fullname`: A string field with a maximum length of 100 characters, capturing the user's full name.
* `password`: A string field with a maximum length of 255 characters, storing the hashed password to secure user accounts.
* `image`: A string field with a maximum length of 100 characters, storing the path or URL to the user's profile image.
* `alamat`: A string field with a maximum length of 255 characters, storing the user's address information.
* `telephone`: A numeric field with a maximum length of 20 digits, representing the user's telephone number.
* `role`: A string field with a maximum length of 10 characters, indicating the role of the user (e.g., admin, regular user).
* `updatedBy`: An integer field representing the ID of the user who last updated this record.
* `deletedBy`: An integer field representing the ID of the user who deleted this record.
* `deletedA`t: A date field indicating the timestamp when the record was deleted.
* `isDeleted`: A boolean field indicating whether the user account has been marked as deleted.
* `isPro`: A boolean field indicating whether the user has a professional account.
* `isChef`: A boolean field indicating whether the user is identified as a chef.
* `isOnline`:  A boolean field indicating the user's online status, helping track their presence on the platform.

  ---
</details>

<details>
  <summary>End Point</summary>

#### User Request Response

  
```json
{
  "endpoints": [
    {
      "method": "GET",
      "path": "/users",
      "description": "Get all users",
      "authorization": "Bearer YOUR_ACCESS_TOKEN",
      "request": null,
      "response": {
        "message": "Get All Users Success",
        "total_count": 20,
        "total_pages": 2,
        "current_page": 1,
        "data": [
          {
            "id": "1",
            "username": "john_doe",
            "email": "john.doe@example.com",
            "role": "user",
            "isDeleted": false,
            "createdAt": "2023-01-01T12:00:00.000Z",
            "updatedAt": "2023-01-02T14:30:00.000Z"
            // ... other user fields
          },
          // ... additional user objects
        ]
      }
    },
    {
      "method": "POST",
      "path": "/users/signup",
      "description": "Sign up a new user",
      "authorization": null,
      "request": {
        "body": {
          "username": "new_user",
          "email": "new.user@example.com",
          "password": "password123"
          // ... other required fields
        }
      },
      "response": {
        "message": "Register user with username new_user Success",
        "accessToken": "YOUR_ACCESS_TOKEN",
        "data": {
          "id": "21",
          "username": "new_user",
          "email": "new.user@example.com",
          "role": "user",
          "isDeleted": false,
          "createdAt": "2023-01-03T10:45:00.000Z",
          "updatedAt": "2023-01-03T10:45:00.000Z"
          // ... other user fields
        }
      }
    },
    {
      "method": "POST",
      "path": "/users/signin",
      "description": "Sign in an existing user",
      "authorization": null,
      "request": {
        "body": {
          "username": "john_doe",
          "password": "password123"
        }
      },
      "response": {
        "message": "Login User ID 1 Success",
        "accessToken": "YOUR_ACCESS_TOKEN",
        "data": {
          "id": "1",
          "username": "john_doe",
          "email": "john.doe@example.com",
          "role": "user",
          "createdAt": "2023-01-01T12:00:00.000Z",
          "updatedAt": "2023-01-02T14:30:00.000Z"
          // ... other user fields
        }
      }
    },
    {
      "method": "POST",
      "path": "/users/signout",
      "description": "Sign out the current user",
      "authorization": "Bearer YOUR_ACCESS_TOKEN",
      "request": null,
      "response": {
        "message": "Sign-out successful for user ID 1 Username john_doe",
        "userId": 1,
        "username": "john_doe"
      }
    },
    {
  "endpoints": [
    // ... endpoint sebelumnya
    {
      "method": "PATCH",
      "path": "/users/id",
      "description": "Update user information",
      "authorization": "Bearer YOUR_ACCESS_TOKEN",
      "request": {
        "body": {
          "email": "updated.email@example.com",
          "fullname": "Updated Full Name",
          "alamat": "Updated Address",
          "telephone": "1234567890",
          "password": "new_password"
          // ... other fields to update
        },
        "file": "profile_image.jpg" // FormData with the image file
      },
      "response": {
        "message": "Success update data"
      }
    },
    {
      "method": "PATCH",
      "path": "/users/status",
      "description": "Update user online status",
      "authorization": "Bearer YOUR_ACCESS_TOKEN",
      "request": {
        "body": {
          "isOnline": true
        }
      },
      "response": {
        "message": "User status updated successfully for user with ID 1",
        "data": {
          "userId": 1,
          "isOnline": true
        }
      }
    },
    {
      "method": "DELETE",
      "path": "/users/:id",
      "description": "Soft delete a user",
      "authorization": "Bearer YOUR_ACCESS_TOKEN",
      "request": null,
      "response": {
        "message": "Soft Delete Success for user with ID 1",
        "data": {
          "id": 1,
          "username": "john_doe",
          "email": "john.doe@example.com",
          "role": "user",
          "isDeleted": true,
          "deletedBy": 2,
          "deletedAt": "2023-01-04T08:00:00.000Z"
          // ... other user fields
        }
      }
    },
    {
      "method": "GET",
      "path": "/users/id",
      "description": "Get detailed information about the current user",
      "authorization": "Bearer YOUR_ACCESS_TOKEN",
      "request": null,
      "response": {
        "message": "Get Detail ID 1 Success",
        "data": {
          "id": 1,
          "username": "john_doe",
          "email": "john.doe@example.com",
          "role": "user",
          "createdAt": "2023-01-01T12:00:00.000Z",
          "updatedAt": "2023-01-02T14:30:00.000Z"
          // ... other user fields
        }
      }
    },
    {
      "method": "GET",
      "path": "/users/search/username",
      "description": "Search users by username",
      "authorization": "Bearer YOUR_ACCESS_TOKEN",
      "request": {
        "query": {
          "q": "john"
        }
      },
      "response": {
        "message": "Success Search",
        "result": {
          "total_count": 1,
          "total_pages": 1,
          "current_page": 1,
          "data": [
            {
              "id": 1,
              "username": "john_doe",
              "email": "john.doe@example.com",
              "role": "user",
              "createdAt": "2023-01-01T12:00:00.000Z",
              "updatedAt": "2023-01-02T14:30:00.000Z"
              // ... other user fields
            }
          ]
        }
      }
```

  ---
</details>

#### **RECIPES**
This set of API endpoints enables the management of recipes. The POST endpoint creates a new recipe, requiring authentication tokens, admin rights, and blacklist verification, supporting image and video uploads. The GET endpoint retrieves all recipes, and GET `/:id` fetches details for a specific recipe. The PATCH `/:id` endpoint updates a recipe, allowing image replacement, with authentication, admin, and blacklist checks. The DELETE `/:id` endpoint deletes a recipe, requiring user ownership validation. Additional GET endpoints enable recipe searches by name, ID, category, and ingredient. Each endpoint serves a specific function in the recipe management system.
<details>
  <summary>Recipe model</summary>

#### Recipe Model

* `id`: A string field with a maximum length of 10 characters, serving as the primary key for recipe identification. It is set as the primary key and has a default value generated using the nanoid library, ensuring uniqueness.
* `name`: A string field with a maximum length of 50 characters, representing the name of the recipe.
* `ingredient`: A string field with a maximum length of 1200 characters, storing information about the ingredients required for the recipe.
* `description`: A string field with a maximum length of 1200 characters, providing a detailed description of the recipe.
* `category`: A string field with a maximum length of 20 characters, indicating the category to which the recipe belongs.
* `guide`: A string field with a maximum length of 1200 characters, offering step-by-step instructions or a guide for preparing the recipe.
* `time`: A time field, representing the estimated time required to prepare the recipe.
* `video`: A string field with a maximum length of 255 characters, storing the path or URL to a video demonstration of the recipe.
* `image`: A string field with a maximum length of 50 characters, storing the path or URL to an image representing the recipe.
* `createdAt`: A date field indicating the timestamp when the recipe record was created.
* `createdBy`: A string field with a maximum length of 50 characters, representing the user who created the recipe.
* `updatedAt`: A date field indicating the timestamp when the recipe record was last updated.
* `updatedBy`: A string field with a maximum length of 50 characters, representing the user who last updated the recipe.



  ---
</details>

<details>
  <summary>End Point</summary>

#### Recipe Request Response

  
```json
  "endpoints":
    {
      "method": "POST",
      "path": "/recipes",
      "description": "Create a new recipe",
      "authorization": "Bearer YOUR_ACCESS_TOKEN",
      "request": {
        "body": {
          "name": "New Recipe",
          "ingredient": "Ingredient 1, Ingredient 2",
          "description": "Recipe description",
          "category": "Main Dish",
          "guide": "Step-by-step guide",
          "time": "30 minutes",
          "video": "base64 encoded video",
          "image": "base64 encoded image"
        }
      },
      "response": {
        "message": "Recipe Created Successfully",
        "data": {
          "id": "2",
          "name": "New Recipe",
          "ingredient": "Ingredient 1, Ingredient 2",
          "description": "Recipe description",
          "category": "Main Dish",
          "guide": "Step-by-step guide",
          "time": "30 minutes",
          "video": "new_video_url",
          "image": "new_image_url",
          "createdAt": "2023-01-04T08:00:00.000Z",
          "updatedAt": "2023-01-04T08:00:00.000Z"
          // ... other recipe fields
        }
      }
    },
    {
      "method": "GET",
      "path": "/recipes",
      "description": "Get a list of all recipes",
      "authorization": null,
      "request": {
        "query": {
          "page": 1,
          "pageSize": 10
        }
      },
      "response": {
        "message": "Success fetch recipe",
        "total_count": 15,
        "total_pages": 2,
        "current_page": 1,
        "data": [
          {
            "id": "1",
            "name": "Recipe 1",
            // ... other recipe fields
          },
          // ... additional recipe objects
        ]
      }
    },
    {
      "method": "GET",
      "path": "/recipes/1",
      "description": "Get details of a specific recipe",
      "authorization": null,
      "request": {
        "params": {
          "id": "1"
        }
      },
      "response": {
        "message": "Success",
        "data": {
          "id": "1",
          "name": "Recipe 1",
          // ... other recipe fields
        }
      }
    },
    {
      "method": "PATCH",
      "path": "/recipes/1",
      "description": "Update details of a specific recipe",
      "authorization": "Bearer YOUR_ACCESS_TOKEN",
      "request": {
        "params": {
          "id": "1"
        },
        "body": {
          "name": "Updated Recipe",
          // ... other fields to update
        }
      },
      "response": {
        "message": "Success update data",
        "data": {
          "id": "1",
          "name": "Updated Recipe",
          // ... other updated fields
        }
      }
    },
    {
      "method": "DELETE",
      "path": "/recipes/1",
      "description": "Delete a specific recipe",
      "authorization": "Bearer YOUR_ACCESS_TOKEN",
      "request": {
        "params": {
          "id": "1"
        }
      },
      "response": {
        "message": "Success Delete Data",
        "data": {
          // ... deleted recipe details
        }
      }
    },
    {
      "method": "GET",
      "path": "/recipes/search/name",
      "description": "Search recipes by name",
      "authorization": null,
      "request": {
        "query": {
          "q": "Recipe 1"
        }
      },
      "response": {
        "message": "Success fetch recipe by name",
        "total_count": 1,
        "total_pages": 1,
        "current_page": 1,
        "data": [
          {
            "id": "1",
            "name": "Recipe 1",
            // ... other recipe fields
          }
        ]
      }
    },
    {
      "method": "GET",
      "path": "/recipes/search/id",
      "description": "Search recipes by IDs",
      "authorization": null,
      "request": {
        "query": {
          "ids": "1,2,3"
        }
      },
      "response": {
        "message": "Success fetch recipe by id",
        "total_count": 3,
        "total_pages": 1,
        "current_page": 1,
        "data": [
          {
            "id": "1",
            "name": "Recipe 1",
            // ... other recipe fields
          },
          // ... additional recipe objects
        ]
      }
    },
    {
      "method": "GET",
      "path": "/recipes/search/category",
      "description": "Search recipes by category",
      "authorization": null,
      "request": {
        "query": {
          "q": "Main Dish"
        }
      },
      "response": {
        "message": "Search recipes by category success",
        "total_count": 5,
        "total_pages": 1,
        "current_page": 1,
        "data": [
          {
            "id": "1",
            "name": "Main Dish Recipe 1",
            // ... other recipe fields
          },
          // ... additional recipe objects
        ]
      }
    },
    {
      "method": "GET",
      "path": "/recipes/search/ingredient",
      "description": "Search recipes by ingredient",
      "authorization": null,
      "request": {
        "query": {
          "q": "Ingredient 1"
        }
      },
      "response": {
        "message": "Search recipes by ingredients success",
        "total_count": 2,
        "total_pages": 1,
        "current_page": 1,
        "data": [
          {
            "id": "1",
            "name": "Recipe with Ingredient 1",
            // ... other recipe fields
          },
        ]
      }
    }

```

  ---
</details>

#### **BOOKMARKS**
This collection of API endpoints empowers the administration of bookmarked items. The POST endpoint facilitates the creation of new bookmarks, demanding authentication tokens, refresh tokens, and blacklist verification, while also implementing image and video upload functionalities. The GET endpoint retrieves all bookmarks associated with a particular user, and the GET `/search` endpoint allows users to explore bookmarks by category. The DELETE `/:id` endpoint enables users to delete a bookmark based on its unique identifier, ensuring secure removal. Each endpoint plays a crucial role in providing diverse and secure functionalities for the management of bookmarked items within the system.
<details>
  <summary>Bookmarks model</summary>

#### Bookmarks Model
  ---
</details>

<details>
  <summary>End Point</summary>

#### Bookmarks Request Response
```json

```
</details>

#### **DONATIONS**
This set of API endpoints facilitates the management of donations. The POST endpoint, accessible via the `"/"` route, allows users to create new donations, supporting image uploads through the use of the upload.single("image") middleware. Authentication tokens, refresh tokens, and blacklist verification are required for secure donation creation. The GET endpoint, accessed through` "/"`, retrieves all donations, ensuring authenticated access and blacklist checks. For user-specific donations, the GET `"/user/"` endpoint filters and returns donations associated with a particular user, implementing ownership verification and blacklist checks. The GET `"/closest/:lon/:lat"` endpoint retrieves donations based on proximity using longitude and latitude parameters. Individual donation details are accessible through the GET `"/:id"` endpoint, and the DELETE `"/:id"` endpoint enables the removal of a specific donation, enforcing ownership validation and blacklist verification. Lastly, the PATCH `"/:id"` endpoint allows users to update a donation, supporting image replacement while enforcing authentication, ownership, and blacklist checks. Each endpoint serves a specific function in the comprehensive donation management system, combining security and functionality to enhance the overall user experience.
<details>
  <summary>Donations model</summary>

#### Donations Model
  ---
</details>

<details>
  <summary>End Point</summary>

#### Donations Request Response
```json

```
</details>

#### **INGREDIENTS**
This collection of API endpoints facilitates the management of ingredients within the system. The GET endpoint, accessed via the `"/"` route, retrieves a comprehensive list of all available ingredients. The POST endpoint, available through `"/"`, enables authenticated users with administrative rights to create new ingredients, requiring authentication tokens, refresh tokens, and blacklist verification. Image uploads are supported through the upload.single('image') middleware. The PATCH `"/:id"` endpoint allows users to update an existing ingredient, supporting image replacement while enforcing authentication and blacklist checks. To remove a specific ingredient, the DELETE `"/:id"` endpoint requires authentication tokens, refresh tokens, user ownership validation, and blacklist verification. The GET `"/search"` endpoint allows users to search for ingredients by name, requiring authentication tokens, refresh tokens, and executing the search based on the ingredient's name. Each endpoint serves a specific function in the ingredient management system, ensuring both functionality and security are paramount in enhancing the overall user experience.
<details>
  <summary>Ingredients model</summary>

#### Ingredients Model
  ---
</details>

<details>
  <summary>End Point</summary>

#### Ingredients Request Response
```json

```
</details>

#### **MESSAGE**
This collection of API endpoints focuses on message management within the system. The GET endpoint, accessible via the `"/"` route, retrieves all messages, providing users with a comprehensive overview. The POST endpoint, available through `"/"`, allows users to create new messages, necessitating authentication tokens, refresh tokens, and blacklist verification for secure message creation. The PATCH "`/:id`" endpoint facilitates the modification of an existing message, enforcing authentication and blacklist checks. To delete a specific message, the DELETE `"/:id"` endpoint requires authentication tokens, refresh tokens, and checks for ownership validation and blacklist verification. Each endpoint serves a distinct function in the message management system, combining security measures with practical features to enhance the overall user experience.
<details>
  <summary>Message model</summary>

#### Message Model
  ---
</details>

<details>
  <summary>End Point</summary>

#### Message Request Response
```json

```