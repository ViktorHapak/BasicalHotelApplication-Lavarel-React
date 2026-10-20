import {Navigate} from "react-router-dom";
import {useStateContext} from "../../../ContextProvider";


export default function MainRedirect() {
    const { role, demoMode } = useStateContext();

    const isAdmin = !demoMode && (role === "ROLE_Admin" || role === 1 || role === "1");

    return (
        <Navigate
            to={
                isAdmin
                    ? "/main/main-container/reservations"
                    : "/main/main-container/room_reserve"
            }
            replace
        />
    );
}