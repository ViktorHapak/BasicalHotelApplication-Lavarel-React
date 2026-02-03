import { createContext, useContext, useState } from 'react';

const StateContext = createContext({
    user: null,
    token: null,
    notification: null,
    role: null,
    setUser: () => {},
    setToken: () => {},
    setNotification: () => {},
    setRole: () => {},
    setLoading: () => {},
    removeToken: () => {}
})

export const ContextProvider = ({children}) => {
    const [user, _setUser] = useState(localStorage.getItem('USER_NAME'));
    const [notification, _setNotification] = useState('')
    const [token, _setToken] = useState(localStorage.getItem('ACCESS_TOKEN'));
    const [role, _setRole] = useState(localStorage.getItem('ROLE'));

    const setNotification = (message) => {
        _setNotification(message);
        setTimeout(() => _setNotification(''), 5000)
    }

    const setToken = (token) => {
        //_setToken(token)
        localStorage.setItem('ACCESS_TOKEN', token)
    }

    const setRole = (role) => {
        //_setRole(role)
        localStorage.setItem('ROLE', role);
    }

    const setUser = (user) => {
        localStorage.setItem('USER_NAME', user)
    }


    const removeToken = () => {
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('ROLE');
        localStorage.removeItem('USER_NAME');
    }


    return (
        <StateContext.Provider value={{
            user, setUser,
            token, setToken,
            notification, setNotification,
            role, setRole,
            removeToken
        }}>
            {children}
        </StateContext.Provider>
    );
}

export const useStateContext = () => useContext(StateContext);