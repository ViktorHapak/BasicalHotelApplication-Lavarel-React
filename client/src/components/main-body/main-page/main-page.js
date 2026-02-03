import {Link, Outlet} from "react-router-dom";

export default function MainPage(){
  return (
   <div className="main-page">
    <aside className="side-menu">
        <Link to="/main/main-container/rooms" className="menu-link">Szobák</Link>
        <Link to="/main/main-container/room_reserve" className="menu-link">Szoba foglalása</Link>
        <Link to="/main/main-container/reservations" className="menu-link">Foglalások</Link>
        <Link to="/main/main-container/own_reservation" className="menu-link">Saját foglalás</Link>
    </aside>
    <main>
        <Outlet/>
    </main>
   </div>
  )
}