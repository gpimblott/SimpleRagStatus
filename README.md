# Example NodeJS application

This is an example application written using NodeJS, Express, Handlebars and Passport.
It includes a login page and a main application index page, any unauthenticated requests
are redirected to the login page.  Only a single user is created by default (or possible).

The following environment variables can be used to configure the application:



* COOKIE_KEY - Secret cookie key
* COOKIE_NAME - Name of the cookie
* ENV - set to 'development' to get debug output
* DEFAULT_USER - Single default user (default='admin')
* DEFAULT_PASSWORD - Password for default user (default='password')

##Installation


```
Clone this repo
npm install
run './bin.www.js'
```



