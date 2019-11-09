# RAGe (RAG editor)

Simple application that provides RAG dashboards for a number of projects on a programme. Individual projects can
update their RAG status against a report date which will update the dashboard.



* COOKIE_KEY - Secret cookie key
* COOKIE_NAME - Name of the cookie
* ENV - set to 'development' to get debug output

##Installation



Clone this repo
npm install

## Database creation
(It expects DATABASE_URL to contain the connection string)

npm run migrate-up 

## Test account setup

npm run create-test-data


To run:

npm run start



