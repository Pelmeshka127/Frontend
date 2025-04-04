import { useEffect } from "react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import './user.css'
import '../../modules/api/getUserById'
import getUserById from "../../modules/api/getUserById";

interface User {
    id: number;
    nickname: string;
}

const User = () => {
    const [user, setUser] = useState<User | null>(null)

    const [searchParams] = useSearchParams()
    let id = +searchParams.get("id")!
    
    useEffect(() => {
        getUserById(id)
        .then(json => setUser(json))
    }, [])

    return (
        <div>
            {user?.nickname}
        </div>
    )
}

export default User