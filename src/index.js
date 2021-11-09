import dotenv from 'dotenv'; // 
import { MongoClient } from "mongodb";

import app from "./server.js";
import RestaurantsDAO from "./dao/restaurants.dao.js";
import UsersDAO from "./dao/users.dao.js";
import CommentsDAO from "./dao/comments.dao.js";

// calling the database configuration in the .env 
dotenv.config();

// set port
const port = process.env.PORT;
const dbUri = process.env.DB_URI;
//creating new MongoClient
const client = new MongoClient(dbUri);

try {
    //using connect method to connect to server
    await client.connect();
    // injecting database with data from dao
    await RestaurantsDAO.injectDB(client);
    await UsersDAO.injectDB(client);
    await CommentsDAO.injectDB(client);

    // listening for the port number
    app.listen(port, () => {
        console.log(`listening on port ${port}`)
    });
}
catch(err) {
    console.error(err.stack);
    process.exit(1);
}
