const getAllMyChats = async() => {
    const response = await fetch("api/chat_member/my")
    const chats = response.json()
    return chats
}

const getAllChatMembers = async () => {
    const response = await fetch("/api/chat_member/all")
    return await response.json()
  }

export { getAllMyChats, getAllChatMembers }