import { ObjectId } from 'bson';

// variables created when file is loaded
let restaurants;
let restdb;
const DEFAULT_SORT = [["name.viewer.numReviews", -1]]

class RestaurantsDAO {
    // inject method gives reference to connection & stores it in restaurants
    static async injectDB(conn) {
        if (restaurants) { // checks if restaurants has a value
            return // if it does, return 
        }
        try {
            // connecting to restaurants db
            restdb = await conn.db(process.env.DB_NAME);
            // reference to restaurants collection inside the db
            restaurants = await restdb.collection("restaurants");
        } 
        catch (e) {
            console.error(`Unable to establish a collection handle in restaurantsDAO: ${e}`);
        }
    }

    // defining getRestaurants and taking parameters setting their deafult values
    static async getRestaurants(query = {}, project = {}, sort = DEFAULT_SORT, page = 0, restaurantsPerPage = 20) {
        let cursor;
        try {
            cursor = await restaurants.find(query).project(project).sort(sort);
        } 
        catch (e) {
            console.error(`Unable to issue find command, ${e}`)
            return { restaurantsList: [], totalNumRestaurants: 0 }
        }
        // cursor fetches documents in batches 
        const displayCursor = cursor.skip(restaurantsPerPage*page).limit(restaurantsPerPage);
    
        try {
            // converting cursor object into array 
            const restaurantsList = await displayCursor.toArray();
            const totalNumRestaurants = (page === 0) ? await restaurants.countDocuments(query) : 0;
        
            return { restaurantsList, totalNumRestaurants }
        } 
        catch (e) {
            console.error(`Unable to convert cursor to array or problem counting documents, ${e}`);
            return { restaurantsList: [], totalNumRestaurants: 0 }
        }
    }

    static async getRestaurantByID(id) {
        try {
            // creating an array pipeline
            const pipeline = [
                {
                    // matching objectId to corresponding id
                    '$match': {'_id': new ObjectId(id)}
                }, 
                {
                    '$lookup': {
                        'from': 'restaurants', 
                        'let': {'id': '$_id'}, // using $ gives us the corresponding field
                        // pipeline of operations
                        'pipeline': [
                            {
                                '$match': { 
                                    '$expr': {
                                        '$eq': [
                                        '$restaurant_id', '$$id' // $$ 
                                        ]
                                    }
                                }
                            }, 
                            {
                                '$sort': {'date': -1}
                            }
                        ], 
                        'as': 'restaurants' // will add this all as a comments property of the movie object
                    }
                }
            ];
    
          return await restaurants.aggregate(pipeline).next();
        }
        catch (e) {
            console.error(`Something went wrong in getRestaurantsByID: ${e}`);
            console.error(`e log: ${e.toString()}`);
            return null;
        }
    }  

    // parameters must be fulfilled in restaurantDoc to add restaurant to db
    static async addRestaurant(borough, cuisine, name, restaurant_id) { 
        try {
            const restaurantDoc = {
               
            borough: borough,
            cuisine: cuisine,
            name: name,
            restaurant_id: restaurant_id

            };

            return await restaurants.insertOne(restaurantDoc);
        } 
        catch (e) {
            console.error(`Unable to post restaurant: ${e}`);
            return { error: e };
        }
    }

    static async updateRestaurant(restaurant, restaurantID) {
        try {
            const updateResponse = await restaurants.updateOne(
                {_id: ObjectId(restaurantID)}, // matching id to the objects restaurant id
                // setting each parameter
                {$set: {borough: restaurant.borough, cuisine: restaurant.cuisine, name: restaurant.name, restaurant_id: restaurant.restaurant_id}}
                
            );

            return updateResponse;
        } 
        catch (e) {
            console.error(`Unable to update restaurant: ${e}`);
            return { error: e };
        }
    }

    static async deleteRestaurant(restaurantId) {
        try {
            const deleteResponse = await restaurants.deleteOne({
                _id: ObjectId(restaurantId)
               // email: userEmail
            });

            return deleteResponse;
        } 
        catch (e) {
            console.error(`Unable to delete restaurant: ${e}`);
            return { error: e };
        }
    }
};

export default RestaurantsDAO;