import { Router } from 'express';

import RestaurantsController from '../controllers/restaurants.controller.js';

const router = Router();

router.get('/', RestaurantsController.apiGetRestaurants);
router.get('/:id', RestaurantsController.apiGetRestaurantById);
router.post('/', RestaurantsController.apiPostRestaurant);
router.post('/:id', RestaurantsController.apiUpdateRestaurant);
router.delete('/delete', RestaurantsController.apiDeleteRestaurant);


export default router;