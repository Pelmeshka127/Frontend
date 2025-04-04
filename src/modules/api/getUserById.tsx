const getUserById = async (id: number) => {
    return fetch("api/user?id=" + id)
    .then(response => response.json())

}

export default getUserById