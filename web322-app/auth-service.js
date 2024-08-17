const { default: mongoose } = require("mongoose");
let Schema = mongoose.Schema;

const bcrypt = require('bcryptjs');

let userSchema = new Schema({
    userName: {
        type: String,
        unique: true,
    },
    password: String,
    email: String,
    loginHistory: [{
        dateTime: Date,
        userAgent: String
    }]
});

let User; // to be defined on new connection

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://burnedthatbridge1:57zkN9q4MPnvO5F0@nathanp.jkrnf.mongodb.net/?retryWrites=true&w=majority&appName=NathanP");
        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise((resolve, reject) => {

        if (userData.password != userData.password2) {
            return reject("Passwords do not match");
        }

        bcrypt.hash(userData.password, 10).then((hash) => {
            userData.password = hash;
            let newUser = new User(userData);

            newUser.save().then(() => {
                return resolve();
            }).catch((err) => {
                if (err.code === 11000) {
                    return reject("Username is already taken");
                } else {
                    return reject("There was an error creating your account: " + err);
                }
            });
        }).catch(err => {
            console.log(err); // Show any errors that occurred during the process
        });
    });
};

module.exports.checkUser = function (userData) {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName }).then((users) => {
            if (users.length === 0) {
                return reject("No match found");
            }

            let user = users[0];

            bcrypt.compare(userData.password, user.password).then((result) => {
                if (result === false) {
                    return reject("Password is incorrect for user: " + userData.userName);
                } else {
                    user.loginHistory.push({
                        dateTime: (new Date()).toString(),
                        userAgent: userData.userAgent
                    });

                    User.updateOne(
                        { userName: users[0].userName },
                        { $set: { loginHistory: user.loginHistory } }
                    ).then(() => {
                        //console.log(user);
                        return resolve(user);
                    }).catch((err) => {
                        return reject("There was an error verifiying the user: " + err);
                    });
                }
            }).catch((err) => {
                return reject("Unknown error: " + err);
            });
        });
    });
}