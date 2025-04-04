import { useEffect } from "react";
import { useState } from "react";
import './user.css'
import '../../modules/api/getUserById'
import getUserById from "../../modules/api/getUserById";

const User = () => {
    const [user, setUser] = useState()
    console.log("In user")

    useEffect(() => {
        getUserById()
        .then(json => setUser(json))
    }, [])

    return (
        <div>
            {JSON.stringify(user)}
        </div>
    )
}

export default User