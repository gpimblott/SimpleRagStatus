# specify the node base image with your desired version node:<version>
FROM node:10

WORKDIR /app

# Copy in our application
COPY package.json /app
RUN npm install
COPY . /app

CMD npm start

# replace this with your application's default port
EXPOSE 3000
