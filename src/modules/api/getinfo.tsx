import { useUsers } from "./api"

const UsersList = () => {
  const { data: users, isLoading, error } = useUsers()

  if (isLoading) return <p>Загрузка...</p>
  if (error) return <p>Ошибка: {error.message}</p>

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}

export default UsersList