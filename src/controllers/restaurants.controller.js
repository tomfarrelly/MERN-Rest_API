import RestaurantsDAO from "../dao/restaurants.dao.js"
import { User } from "./users.controller.js"; // importing user object

export default class RestaurantsController {
    
    static async apiGetRestaurants(req, res, next) {
        const  RESTAURANTS_PER_PAGE = 20
        const { restaurantsList, totalNumRestaurants } = await RestaurantsDAO.getRestaurants();
        let response = {
            restaurants: restaurantsList,
            page: 0,
            filters: {},
            entries_per_page: RESTAURANTS_PER_PAGE,
            total_results: totalNumRestaurants,
        }
        res.json(response);
    }

    static async apiGetRestaurantById(req, res, next) {
        try {
            let id = req.params.id || {};
            let restaurant = await RestaurantsDAO.getRestaurantByID(id);
            if (!restaurant) {
                res.status(404).json({ error: "Not found" });
                return;
            }
            let updated_type = restaurant.lastupdated instanceof Date ? "Date" : "other";
            res.json({ restaurant, updated_type });
        }
        catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiPostRestaurant(req, res, next) {
        try {
            const userJwt = req.get("Authorization").slice("Bearer ".length); // pulling token from request error
            const user = await User.decoded(userJwt); // decoding token
            var { error } = user;
            if (error) {
                res.status(401).json({ error });
                return;
            }

            const restaurant_id = req.body.restaurant_id;
            const borough = req.body.borough;
            const cuisine = req.body.cuisine;
            const name = req.body.name;
           

            const restaurantResponse = await RestaurantsDAO.addRestaurant(
               
               borough,
               cuisine,
               name,
               restaurant_id
            );

            const updatedRestaurant = await RestaurantsDAO;//.getRestaurantByID(restaurant_id);

            res.json({ status: "success", restaurantResponse });
        } catch (e) {
            res.status(500).json({ e });
        }
    }

    static async apiUpdateRestaurant(req, res, next) {
        // USer Authorization
        try {
            // gets authorization bearer token
           const userJwt = req.get("Authorization").slice("Bearer ".length);
           const user = await User.decoded(userJwt);
           var { error } = user;
           if (error) {
               res.status(401).json({ error });
               return;
           }

           
           // passing restaurant id to DAO 
            const restaurantID = req.params.id;
            const restaurant = req.body;
            const restaurantResponse = await RestaurantsDAO.updateRestaurant(restaurant, restaurantID);
            

            
            var { error } = restaurantResponse;
            if (error) {
                res.status(400).json({ error });
            }
            
            if (restaurantResponse.modifiedCount === 0) {
                throw new Error(
                    "unable to update comment - user may not be original poster",
                );
            }

            const updatedRestaurant = await RestaurantsDAO.getRestaurantByID(restaurantID);
            
            res.json({ restaurants: updatedRestaurant });
        } 
        catch (e) {
            res.status(500).json({ e });
        }
    }

    static async apiDeleteRestaurant(req, res) {
        try {
            const userJwt = req.get("Authorization").slice("Bearer ".length);
            const user = await User.decoded(userJwt);
            var { error } = user;
            if (error) {
                res.status(401).json({ error });
                return;
            }

            const restaurantID = req.params.id;
            const restaurantResponse = await RestaurantsDAO.deleteRestaurant(
                ObjectId(restaurantID)
            );

            const { restaurants } = await RestaurantsDAO.getRestaurantByID(restaurantID);
            res.json({  success: "restaurant is deleted" });
        } 
        catch (e) {
            res.status(500).json({ e });
        }
    }
}
