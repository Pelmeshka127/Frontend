import React from 'react'
import useUsers from './api'

const UsersList = () => {
  const users = useUsers("https://localhost:8080/users/")

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}

export default UsersList
