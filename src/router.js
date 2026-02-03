import { createBrowserRouter, Navigate, Link } from 'react-router-dom';
import Navigation from "./components/navigation.js";
import Signup from "./components/signup+login/signup.js";
import Login from "./components/signup+login/login.js";
import MainPage from "./components/main-body/main-page/main-page.js";
import Users from "./components/main-body/users/users.js";
import Profile from "./components/main-body/profile.js";
import Auth_interface from "./components/auth_interface";
import Rooms from "./components/main-body/main-page/rooms/rooms";
import Own_reservation from "./components/main-body/main-page/own_reservation/own_reservation";
import Reservations from "./components/main-body/main-page/reservations/reservations";
import Reserve from "./components/main-body/main-page/room_reserve/room_reserve";

export const router = createBrowserRouter([
    { path: '/', element: <Navigate to="/main/main-container" /> },
    {
        path: '/main',
        element: <Navigation/>,
        children: [
            {
                path: 'main-container',
                element: <MainPage/>,
                children: [
                    {
                        path: 'own_reservation',
                        element: <Own_reservation/>,
                        children: []
                    },
                    {
                        path: 'reservations',
                        element: <Reservations/>,
                        children: []
                    },
                    {
                        path: 'room_reserve',
                        element: <Reserve/>,
                        children: []
                    },
                    {
                        path: 'rooms',
                        element: <Rooms/>,
                        children: []
                    }
                ]
            },
            {
                path: 'users',
                element: <Users/>,
                children: []
            },
            {
                path: 'profile',
                element: <Profile/>,
                children: []
            }
        ]
    },
    {
        path:'/auth',
        element: <Auth_interface/>,
        children: [
            {
                path: 'signup',
                element: <Signup/>,
                children: []
            },
            {
                path: 'login',
                element: <Login/>,
                children: []
            }
        ]
    }
]);