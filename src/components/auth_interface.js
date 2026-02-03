import {useStateContext} from "../ContextProvider";
import {Navigate, Outlet, useNavigate} from "react-router-dom";
import {useEffect} from "react";

export default function Auth_interface(){

    const {token} = useStateContext();

    return (
        <Outlet />
    )
}