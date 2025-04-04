const getUserById = async (id: number) => {
    const response = await fetch("api/user?id=" + id)
    const users = await response.json()
    return users[0]
}

export default getUserById