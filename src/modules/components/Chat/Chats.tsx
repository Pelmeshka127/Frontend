import { useQuery } from "@tanstack/react-query";
import { getAllMyChats } from "../../api/getChats";

interface Chats {
    userId: number,
    chatId: number,
    joinDttm: Date,
}

const Chats = () => {

    const { data: chats = [] } = useQuery<Chats[]>({
        queryKey: ['chats'],
        queryFn: getAllMyChats,
      });

    const length =  chats.length

    return (
        <div>
            <p>Hello + {length}</p>
        </div>
    )
}

export { Chats }