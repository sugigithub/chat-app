const generatMeessage = (username, msg) => {
    return {
        username,
        msg,
        "createdAt": new Date().getTime(),
    }
}

const generateLocation = (username, url) => {
    return {
        username,
        url,
        "createdAt": new Date().getTime(),
    }
}

module.exports = {
    generatMeessage,
    generateLocation
}