const users = [];

const addUser = ({ id, username, room }) => {
    console.log(id, username, room);
    // clean the data 
    username = username?.trim().toLowerCase()
    room = room?.trim().toLowerCase();
    console.log(username,room,"from users")
    // data validation
    if (!username || !room) {
        return {
            error: "both username and room are required"
        }
    };

    // check for existing user

    const existingUser = users.find(user =>
        user.room === room && user.username === username
    );

    if (existingUser) {
        return {
            error: "username in use"
        }
    };

    // store error

    const user = { id, username, room };
    users.push(user);
    return { user };
};

const removeUser = id => {
    const idx = users.findIndex(user => user.id === id);
    if (idx !== -1) return users.splice(idx, 1)[0];
};

const getUser = id => {
    return users.find(user => user.id === id);
}

const getUserInRoom = room => {
    return users.filter(user => user.room === room)
}


// addUser({ id: 22, username: "sugi", room: "new room" });
// addUser({ id: 25, username: "sugi2", room: "new room" });
// addUser({ id: 25, username: "sugi room1", room: "new room1" });
// // console.log(removeUser(22));
// console.log(getUser(20))
// console.log("user in room ",getUserInRoom("new room"))
// console.log(users)

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
};