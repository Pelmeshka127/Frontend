import { useEffect } from "react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import './user.css'
import '../../modules/api/getUserById'
import getUserById from "../../modules/api/getUserById";

const User = () => {
    const [user, setUser] = useState()
    console.log("In user")

    const [searchParams] = useSearchParams()
    let id = +searchParams.get("id")!
    
    useEffect(() => {
        getUserById(id)
        .then(json => setUser(json))
    }, [])

    return (
        <div>
            {JSON.stringify(user)}
        </div>
    )
}

export default User