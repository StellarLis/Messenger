import { useContext, useEffect } from "react";
import { AccountContext } from '../AccountContext';

export const useSocketSetup = (setFriendList, setMessages, socket) => {
    const { setUser } = useContext(AccountContext);
    useEffect(() => {
        socket.connect();
        socket.on('friends', friendList => {
            setFriendList(friendList);
        });
        socket.on('messages', messages => {
            setMessages(messages);
        });
        socket.on('dm', message => {
            setMessages(prevMsg => [message, ...prevMsg]);
        })
        socket.on('connected', (status, username) => {
            setFriendList(prevFriends => {
                return [...prevFriends].map(friend => {
                    if (friend.username === username) {
                        friend.connected = status;
                    }
                    return friend;
                });
            });
        });
        socket.on('connect_error', () => {
            console.log('Socket connection error!');
            setUser({ loggedIn: false });
        });
        return () => {
            socket.off('connect_error');
            socket.off('connected');
            socket.off('friends');
            socket.off('messages');
        }
    }, [setUser, setFriendList, setMessages, socket]);
}