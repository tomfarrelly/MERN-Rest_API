import { ObjectId } from "bson";

let comments

export default class CommentsDAO {
    static async injectDB(conn) {
        if (comments) {
            return;
        }
        try {
            comments = await conn.db(process.env.DB_NAME).collection("comments");
        } 
        catch (e) {
            console.error(`Unable to establish collection handles in userDAO: ${e}`);
        }
    }

    static async addComment(movieId, user, comment, date) {
        try {
            const commentDoc = {
                name: user.name,
                email: user.email,
                movie_id: ObjectId(movieId),
                text: comment,
                date: date
            };

            return await comments.insertOne(commentDoc);
        } 
        catch (e) {
            console.error(`Unable to post comment: ${e}`);
            return { error: e };
        }
    }

    static async updateComment(commentId, userEmail, text, date) {
        try {
            const updateResponse = await comments.updateOne(
                { _id: ObjectId(commentId), email: userEmail },
                { $set: { text: text, date: date } },
            );

            return updateResponse;
        } 
        catch (e) {
            console.error(`Unable to update comment: ${e}`);
            return { error: e };
        }
    }

    static async deleteComment(commentId, userEmail) {
        try {
            const deleteResponse = await comments.deleteOne({
                _id: ObjectId(commentId),
                email: userEmail
            });

            return deleteResponse;
        } 
        catch (e) {
            console.error(`Unable to delete comment: ${e}`);
            return { error: e };
        }
    }

    static async mostActiveCommenters() {
        try {
            const pipeline = [
                {
                    '$group': {
                        '_id': '$email', 
                        'count': {
                        '$sum': 1
                        }
                    }
                },
                {
                    '$sort': {
                        'count': -1
                    }
                }, 
                {
                    '$limit': 20
                }
            ];

            const readConcern = "majority";

            const aggregateResult = await comments.aggregate(pipeline, {
                readConcern,
            });

            return await aggregateResult.toArray();
        } 
        catch (e) {
            console.error(`Unable to retrieve most active commenters: ${e}`);
            return { error: e };
        }
    }
}