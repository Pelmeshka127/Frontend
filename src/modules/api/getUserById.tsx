const getUserById = async () => {
    return fetch("api/user?id=147")
    .then(response => response.json())

}

export default getUserById