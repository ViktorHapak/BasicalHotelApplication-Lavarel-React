import {useStateContext} from "../ContextProvider.js";
import {Link, Navigate, NavLink, Outlet, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";


export default function Navigation () {

    const  {user, role, token,  notification,
        setNotification, removeToken} = useStateContext();

    if(!token){
        return <Navigate to="/auth/login" />
    }

    function logout() {
        removeToken(null);
        window.location.reload();
    }

    return (
     <div className="main-container">
        {notification  &&
             <div className="message-container container">
                 <a className="message-title">{notification}</a>
                 <button className="btn btn-primary ok"
                         onClick={() => setNotification(null)}>OK</button>

             </div>
        }
       <nav className="navbar navbar-expand-sm navbar-dark bg-primary sticky-top">
         <a className="navbar-brand ms-3">MyHotel</a>
         <div className="collapse navbar-collapse" id="mynavbar">
             <ul className="navbar-nav me-auto">
                 <li className="nav-item">
                     <Link className="nav-link" to="/main/main-container">Főoldal</Link>
                 </li>
                 <li className="nav-item">
                     <Link className="nav-link" to="/main/users">Felhasználók</Link>
                 </li>
             </ul>

             {/* dropdown on the right */}
             <ul className="navbar-nav me-2">
                 <li className="nav-item dropdown">
                     <a className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown">Profile</a>
                     <ul className="dropdown-menu dropdown-menu-end">
                         <li> <Link className="dropdown-item" to="/main/profile">Profil adatok</Link></li>
                         <li><a className="dropdown-item nav-item" onClick={logout}>Kijelentkezés</a></li>
                         <li><Link className="dropdown-item" to="/auth/signup">Új felhasználó</Link></li>
                     </ul>
                 </li>
             </ul>
         </div>
       </nav>
       <div className="body-part">
           <Outlet />
       </div>
     </div>
    );
}