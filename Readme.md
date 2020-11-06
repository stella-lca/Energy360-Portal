## Energy360-Portal

#### - Prerequests
Please setup application configuration in env file.
- ######   Main Settings
```
SERVER_PORT = 3000
APP_NAME = Energy360-Web-Portal
API_URL = http://localhost:3000/api
APPSETTING_ADMIN_EMAIL =
APPSETTING_CLIENT_ID = 
APPSETTING_CLIENT_SECRET = 
APPSETTING_HOST = 
APPSETTING_JWT_EXPIRED = 
APPSETTING_JWT_SECRET = 
APPSETTING_SENDGRID_API_KEY =
APPSETTING_SUBSCRIPTION_KEY = 
```

- ###### Database Settings
```
SQLAZURECONNSTR_DB_HOST = localhost
SQLAZURECONNSTR_DB_USER = root
SQLAZURECONNSTR_DB_PASS = admin
SQLAZURECONNSTR_DB_NAME = energy360
```

#### - How to install dependencies
```
$ git clone git-url
$ cd project_root
$ npm install


```

#### - How to Run
```
$ cd project_root
$ npm start
```