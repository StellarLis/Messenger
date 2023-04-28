# Messenger

Web messenger where you can chat with your friends.

## Stack:
### Frontend:
* Html, CSS and JS
* React
* ChakraUI
* Formik + Yup
### Backend:
* Node.js
* Express.js
* PostgreSQL and Redis
* Socket.io
* JWT

## How to use:
* Clone this repository
* Make sure you have opened PostgreSQL and Redis instances on your computer on ports **5432** and **6379**.
* Open */server/.env* file and provide `DATABASE_NAME`, `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD` for your PostgreSQL database.
* Open */server/database.sql* file, copy the command. Then, in your PostgreSQL database's terminal, create *chatapp_db* database, connect to it and paste this command.
* Go to the */server* folder and run `npm install`, then run `npm run start:dev`
* Go to the */client* folder and run `npm install`, then run `npm start`
If all works fine, you can now go to http://localhost:3000/.

## Screenshots:
![Screenshot_1](https://user-images.githubusercontent.com/86295320/235249965-7c2e8615-3122-4e5a-9fee-b3eda78f7429.png)
![Screenshot_2](https://user-images.githubusercontent.com/86295320/235250049-af37913b-99e7-461f-b35d-97c474830f33.png)