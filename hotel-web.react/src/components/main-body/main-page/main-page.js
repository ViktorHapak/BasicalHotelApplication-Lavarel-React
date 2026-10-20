import {Link, Outlet} from "react-router-dom";
import {useContext} from "react";
import {useStateContext} from "../../../ContextProvider";

export default function MainPage(){

   const {role} = useStateContext();

    const isAdmin = () => role?.toLowerCase() === "admin";

    const isUser = () => ["user", "anonymous"].includes(role?.toLowerCase());

  return (
   <div className="main-page">
    <aside className="side-menu">
        {isAdmin() && (
            <>
                <Link to="/main/main-container/rooms" className="menu-link">Szobák</Link>
                <Link to="/main/main-container/reservations" className="menu-link">Foglalások</Link>
            </>
        )}
        {isUser() && (
            <>
                <Link to="/main/main-container/room_reserve" className="menu-link">Szoba foglalása</Link>
                <Link to="/main/main-container/own_reservation" className="menu-link">Saját foglalások</Link>
            </>
        )}
    </aside>
    <main>
        <Outlet/>
    </main>
   </div>
  )
}