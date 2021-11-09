let users;
let sessions;

export default class UsersDAO {
    static async injectDB(conn) {
        if (users && sessions) {
            return;
        }
        try {
            // referencing collection in db
            users = await conn.db(process.env.DB_NAME).collection("users");
            sessions = await conn.db(process.env.DB_NAME).collection("sessions");
        } 
        catch (e) {
            console.error(`Unable to establish collection handles in userDAO: ${e}`);
        }
    }

    
    
    // defining getUser and taking parameters setting default values
    static async getUser(email) {
        return await users.findOne({ email: email });
    }

    // definign addUser taking parameters from userInfo 
    static async addUser(userInfo) {
        try {
            await users.insertOne({ 
                email : userInfo.email,
                name : userInfo.name,
                password : userInfo.password
            });
            return { success: true };
        }
        catch (e) {
            if (String(e).startsWith("MongoError: E11000 duplicate key error")) {
                return { error: "A user with the given email already exists." };
            }
            console.error(`Error occurred while adding new user, ${e}.`);
            return { error: e };
        }
    }

    static async loginUser(email, jwt) {
        try {
            await sessions.updateOne(
                { user_id: email }, // comparing user email
                { $set: { jwt: jwt } }, // comparing authorization token
                { upsert: true } // allows to insert or update
            );
            return { success: true };
        } 
        catch (e) {
            console.error(`Error occurred while logging in user, ${e}`)
            return { error: e }
        }
    }

    static async logoutUser(email) {
        try {
            await sessions.deleteOne({ user_id: email });
            return { success: true };
        }
        catch (e) {
            console.error(`Error occurred while logging out user, ${e}`);
            return { error: e };
        }
  }

    static async getUserSession(email) {
        try {
            return sessions.findOne({ user_id: email }); // find a user correlating to email
        } 
        catch (e) {
            console.error(`Error occurred while retrieving user session, ${e}`);
            return null;
        }
    }

    static async deleteUser(email) {
        try {
            await users.deleteOne({ email }); //deletes user based on email
            await sessions.deleteOne({ user_id: email }); // deletes session correlating to the user
            if (!(await this.getUser(email)) && !(await this.getUserSession(email))) {
                return { success: true };
            } 
            else {
                console.error(`Deletion unsuccessful`);
                return { error: `Deletion unsuccessful` };
            }
        } 
        catch (e) {
            console.error(`Error occurred while deleting user, ${e}`);
            return { error: e };
        }
    }

    static async updatePreferences(email, preferences) {
        try {
            preferences = preferences || {}
            const updateResponse = await users.updateOne(
                { email: email },
                { $set: { preferences: preferences } },
            );

            if (updateResponse.matchedCount === 0) {
                return { error: "No user found with that email" };
            }
            return updateResponse;
        } 
        catch (e) {
            console.error(
                `An error occurred while updating this user's preferences, ${e}`,
            );
            return { error: e };
        }
    }

    static async checkAdmin(email) {
        try {
            const { isAdmin } = await this.getUser(email);
            return isAdmin || false;
        } 
        catch (e) {
            return { error: e };
        }
    }

    static async makeAdmin(email) {
        try {
            const updateResponse = users.updateOne(
                { email },
                { $set: { isAdmin: true } },
            )
            return updateResponse;
        } 
        catch (e) {
            return { error: e }
        }
    }
}
