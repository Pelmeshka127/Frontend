const getAllContacts = async() => {
  const response = await fetch("/api/contact")
  const contacts = response.json();
  return contacts
}

const createContact = async (nickname: string): Promise<void> => {
  const response = await fetch(`/api/contact?nickname=${encodeURIComponent(nickname)}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Не удалось добавить контакт");
  }
};


export { getAllContacts, createContact }