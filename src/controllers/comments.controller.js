import { ObjectId } from "bson";

import UsersDAO from "../dao/users.dao.js";
import CommentsDAO from "../dao/comments.dao.js";
import RestaurantsDAO from "../dao/restaurants.dao.js";
import { User } from "./users.controller.js";

export default class CommentsController {
    static async apiPostComment(req, res, next) {
        try {
            const userJwt = req.get("Authorization").slice("Bearer ".length); // pulling token from request error
            const user = await User.decoded(userJwt); // decoding token
            var { error } = user;
            if (error) {
                res.status(401).json({ error });
                return;
            }

            const restaurantId = req.body.restaurant_id;
            const comment = req.body.comment;
            const date = new Date();

            const commentResponse = await CommentsDAO.addComment(
                ObjectId(restaurantId),
                user,
                comment,
                date,
            );

            const updatedComments = await RestaurantsDAO.getRestaurantByID(restaurantId);

            res.json({ status: "success", comments: updatedComments.comments });
        } catch (e) {
            res.status(500).json({ e });
        }
    }

    static async apiUpdateComment(req, res, next) {
        try {
            const userJwt = req.get("Authorization").slice("Bearer ".length);
            const user = await User.decoded(userJwt);
            var { error } = user;
            if (error) {
                res.status(401).json({ error });
                return;
            }

            const commentId = req.body.comment_id;
            const text = req.body.updated_comment;
            const date = new Date();

            const commentResponse = await CommentsDAO.updateComment(
                ObjectId(commentId),
                user.email,
                text,
                date,
            );

            var { error } = commentResponse;
            if (error) {
                res.status(400).json({ error });
            }

            if (commentResponse.modifiedCount === 0) {
                throw new Error(
                    "unable to update comment - user may not be original poster",
                );
            }

            const restaurantId = req.body.restaurant_id;
            const updatedComments = await RestaurantDAO.getRestaurantByID(restaurantId);

            res.json({ comments: updatedComments.comments });
        } 
        catch (e) {
            res.status(500).json({ e });
        }
    }

    static async apiDeleteComment(req, res, next) {
        try {
            const userJwt = req.get("Authorization").slice("Bearer ".length);
            const user = await User.decoded(userJwt);
            var { error } = user;
            if (error) {
                res.status(401).json({ error });
                return;
            }

            const commentId = req.body.comment_id;
            const userEmail = user.email;
            const commentResponse = await CommentsDAO.deleteComment(
                ObjectId(commentId),
                userEmail,
            );

            const restaurantId = req.body.restaurant_id;

            const { comments } = await RestaurantsDAO.getRestaurantByID(restaurantId);
            res.json({ comments });
        } 
        catch (e) {
            res.status(500).json({ e });
        }
    }

    static async apiCommentReport(req, res, next) {
        try {
            const userJwt = req.get("Authorization").slice("Bearer ".length);
            const user = await User.decoded(userJwt);
            var { error } = user;
            if (error) {
                res.status(401).json({ error });
                return;
            }

            if (UsersDAO.checkAdmin(user.email)) {
                const report = await CommentsDAO.mostActiveCommenters();
                res.json({ report });
                return;
            }

            res.status(401).json({ status: "fail" });
        } 
        catch (e) {
            res.status(500).json({ e });
        }
    }
}
