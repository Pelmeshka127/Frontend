import { useEffect, useState } from 'react'

const useUsers = (apiUrl) => {
  const [users, setUsers] = useState([])

  useEffect(() => {
    const fetchUsers = async () => {
    const response = await fetch(apiUrl)
    if (!response.ok) {
        throw new Error("Ошибка загрузки пользователей")
    }
    const data = await response.json()
    setUsers(data)
    }

    fetchUsers()
  }, [apiUrl])

  return users
}

export default useUsers
