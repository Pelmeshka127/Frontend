const getAllMyChats = async() => {
    const response = await fetch("api/chat_member/my")
    const chats = response.json()
    return chats
}

export { getAllMyChats }