const getUserById = async (id: number) => {
    // uncomment it if you want to feast your eyes on an amazing loading spinner thingy but backend is too fast
    // await new Promise(resolve => setTimeout(resolve, 3000));
    const response = await fetch("api/user?id=" + id)
    const users = await response.json()
    return users[0]
}

export default getUserById