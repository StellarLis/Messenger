import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AccountContext = createContext();

const UserContext = ({children}) => {
    const [user, setUser] = useState({loggedIn: null, token: localStorage.getItem('token')});
    const navigate = useNavigate();
    useEffect(() => {
        axios.get('http://localhost:4000/auth/login', {
            withCredentials: true,
            headers: {
                'authorization': `Bearer ${user.token}`
            }
        })
            .catch(err => {
                setUser({loggedIn: false});
                return;
            }).then(res => {
                if (!res || res.status >= 400) {
                    setUser({loggedIn: false});
                    return;
                }
                setUser({ ...res.data });
                navigate('/home');
            })
    }, []);
    return (
        <AccountContext.Provider value={{user, setUser}}>
            {children}
        </AccountContext.Provider>
    );
}

export default UserContext;