import { Router } from 'express'; // router level middleware

import UsersController from '../controllers/users.controller.js';


const router = Router();// instance of express.Router()

router.post('/register', UsersController.register);
router.post('/login', UsersController.login);
router.post('/logout', UsersController.logout);
router.delete('/delete', UsersController.delete);
router.post('/make-admin', UsersController.createAdminUser);

export default router;