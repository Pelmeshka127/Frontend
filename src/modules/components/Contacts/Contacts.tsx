import { useQuery } from "@tanstack/react-query"
import { getAllContacts } from "../../api/getContacts"
import { getCurrentUser } from "../../api/getUser"

interface Contact {
  ownerId: number,
  userId: number
}

interface User {
  userId: number;
  nickname: string;
  profilePictureLink: string;
}

const Contact = () => {

  const { data: currentUser } = useQuery<User>({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: getAllContacts,
    enabled: !!currentUser
  })

  return (
    <div>
      <h2>Мои чаты</h2>
      {contacts.length === 0 ? (
        <p>Нет контактов</p>
      ) : (
        <ul>
          {contacts.map(({ ownerId, userId }) => (
            <li key={ownerId}>
              <p>{userId}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Contact