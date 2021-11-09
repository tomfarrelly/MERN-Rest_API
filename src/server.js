import express from 'express'; // middleware
import cors from 'cors'; // importing cors for security

// Importing router objects
import usersRouter from './routes/users.router.js';
import restaurantsRouter from './routes/restaurants.router.js';
import commentsRouter from './routes/comments.router.js';

// applying third party middleware to application to add functionality
const app = express();

//parsing incoming requests 
//bounding application level middleware to the app object
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/users', usersRouter);
//  if any request begins with "/restaurants" get the restaurantsRouter
app.use('/restaurants', restaurantsRouter);
app.use('/comments', commentsRouter);

export default app;