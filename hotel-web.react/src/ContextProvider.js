import { createContext, useContext, useState } from 'react';

const StateContext = createContext({
    user: null,
    token: null,
    notification: null,
    role: null,
    demoMode: null,
    demoRooms: null,
    demoUser: null,
    demoOrders: null,
    setUser: () => {},
    setToken: () => {},
    setNotification: () => {},
    setRole: () => {},
    setDemoMode: () => {},
    setLoading: () => {},
    removeToken: () => {},
    setDemoOrders: () => false,
    removeDemoOrder: () => {},
    filterRooms: () => {},
})

const DEMO_ROOMS = [
    {
        id: 1,
        floor: 1,
        serial_number: 1,
        room_number: '1-1',
        price: 10000,
        status: 'free'
    },
    {
        id: 2,
        floor: 1,
        serial_number: 2,
        room_number: '1-2',
        price: 15000,
        status: 'free'
    },
    {
        id: 3,
        floor: 1,
        serial_number: 3,
        room_number: '1-3',
        price: 18000,
        status: 'free'
    },
    {
        id: 4,
        floor: 2,
        serial_number: 1,
        room_number: '2-1',
        price: 25000,
        status: 'free'
    },
    {
        id: 5,
        floor: 2,
        serial_number: 2,
        room_number: '2-2',
        price: 27000,
        status: 'free'
    },
    {
        id: 6,
        floor: 3,
        serial_number: 1,
        room_number: '3-1',
        price: 35000,
        status: 'free'
    },
    {
        id: 7,
        floor: 3,
        serial_number: 2,
        room_number: '3-2',
        price: 50000,
        status: 'free'
    },
    {
        id: 8,
        floor: 4,
        serial_number: 1,
        room_number: '4-1',
        price: 65000,
        status: 'free'
    }
];

const DEMO_USER = {
    id: 1,
    name: "anonymus",
    email: "anonymous@demo.local",
    birth: "2000-01-01",
    created_at: "2026-10-19 00:00:00",
    role: "Anonymous"
};

export const ContextProvider = ({children}) => {
    const [user, _setUser] = useState(localStorage.getItem('USER_NAME'));
    const [notification, _setNotification] = useState('')
    const [token, _setToken] = useState(localStorage.getItem('ACCESS_TOKEN'));
    const [role, _setRole] = useState(localStorage.getItem('ROLE'));
    const [demoMode, setDemoMode] = useState(localStorage.getItem('DEMO_MODE') ?? false);
    const [demoOrders, _setDemoOrders] = useState([]);

    const demoRooms = structuredClone(DEMO_ROOMS);
    const demoUser = structuredClone(DEMO_USER);

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
        localStorage.setItem('DEMO_MODE', true);
        if (role === "Anonymous"){
            localStorage.setItem('DEMO_MODE', true);
            setDemoMode(true)
        }

    }

    const setUser = (user) => {
        localStorage.setItem('USER_NAME', user)
    }

    const setDemoOrders = (room_number, days) => {

        const room = DEMO_ROOMS.find(
            r => r.room_number === room_number
        );

        if (!room) return false;

        const numberOfDays = Number(days);

        if (!Number.isInteger(numberOfDays) ||
            numberOfDays < 1 ||
            numberOfDays > 30) {
            return false;
        }

        if (demoOrders.some(order =>
            order.room === room_number &&
            order.status === 'PENDING'
        )) {
            return false;
        }

        _setDemoOrders(prev => {
            const nextId = Math.max(
                0,
                ...prev.map(order => order.id)
            ) + 1;

            const newOrder = {
                id: nextId,
                user: 'anonymus',
                floor: room.floor,
                room: room.room_number,
                cost: numberOfDays * Number(room.price) + " HUF",
                days: numberOfDays,
                created_at: new Date().toLocaleString('sv-SE'),
                reserved_at: '-',
                status: 'PENDING'
            };

            console.log('New order:');
            console.log(newOrder);

            return [...prev, newOrder];
        });

        return true;
    };

    const removeDemoOrder = (id) => {
        let _demoOrders = structuredClone(demoOrders);
        _demoOrders = _demoOrders.filter(order => order.id !== id);
        _setDemoOrders(_demoOrders);
    };

    const removeToken = () => {
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('ROLE');
        localStorage.removeItem('USER_NAME');
        localStorage.removeItem('DEMO_MODE');
        setDemoMode(false)
    }


    const floors = () => {
        let _rooms = structuredClone(DEMO_ROOMS);
        return [...new Set(_rooms.map(room => room.floor))];
    }


    const filterRooms = (params) => {

        let _rooms = structuredClone(DEMO_ROOMS);

        // Filter by floor
        if (params.floor !== null &&
            params.floor !== undefined &&
            params.floor !== '') {

            _rooms = _rooms.filter(r =>
                Number(r.floor) === Number(params.floor)
            );
        }

        // Filter by reservation status
        if (params.status === 'free') {
            _rooms = _rooms.filter(r => r.status === 'free');
        }
        else if (params.status === 'reserved') {
            _rooms = _rooms.filter(r => r.status === 'reserved');
        }


        //Paginations

        const page = Number(params.page ?? 0);
        const size = Number(params.size ?? 10);

        const totalItems = _rooms.length;
        const totalPages = Math.ceil(totalItems / size);

        const from = page * size;
        const to = from + size;

        return _rooms.slice(from, to);
    }


    return (
        <StateContext.Provider value={{
            user, setUser,
            token, setToken, removeToken,
            notification, setNotification,
            role, setRole,
            demoMode,
            demoRooms,
            demoOrders, setDemoOrders,
            removeDemoOrder,
            filterRooms

        }}>
            {children}
        </StateContext.Provider>
    );
}

export const useStateContext = () => useContext(StateContext);