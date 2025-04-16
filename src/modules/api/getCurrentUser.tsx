const getCurrentUser = async() => {
    const response = await fetch("api/user/current")
    const user = await response.json()
    return user
}

export default getCurrentUser