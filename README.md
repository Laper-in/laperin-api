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





