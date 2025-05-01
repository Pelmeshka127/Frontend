const getAllContacts = async() => {
    const response = await fetch("/api/contact")
    const contacts = response.json();
    return contacts
}

export { getAllContacts }