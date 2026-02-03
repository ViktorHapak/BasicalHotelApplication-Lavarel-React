import {useStateContext} from "../../ContextProvider.js";
import {useEffect, useState} from "react";
import { useForm } from 'react-hook-form';
import {Link, Navigate, useNavigate} from 'react-router-dom';
import httpClient from "../../axios-client";

//import { ValidationRule } from 'react-validation-library';


export default function Login(){

  const {notification, user, role, token,
     setUser, setRole, setToken, setNotification} = useStateContext();

 let {
  register,
  getValues,
  formState: { errors, touchedFields },
 } = useForm({ mode: 'onTouched', reValidateMode: 'onChange' });

 const [error_response, setErrorResponse] = useState({
  message: null,
 })

 const nameRules = {
    required: 'Kötelező mező!',
    minLength: { value: 4, message: 'Min. 4 karakter' },
 };

 const emailRules = {
    required: 'Kötelező mező!',
    pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Érvénytelen email cím',
    },
 };

 const passwordRules = {
    required: 'Kötelező mező!',
 };

  function enable(){
     const nameOk = !errors.name && touchedFields.name;
     const emailOk = !errors.email && touchedFields.email;
     const passwordOk = !errors.password && touchedFields.password;

     return  passwordOk && (nameOk || emailOk);
 }

  const onSubmit = (e) => {
          e.preventDefault();
          const {name, email, password} = getValues();
          const payload = {login: name || email, password: password};
          httpClient.post('login', payload)
              .then(({data}) => {
                  setRole(data.user?.role);
                  setToken(data.token);
                  setUser(data.user?.name);
                  window.location.reload();
              })
              .catch((err) => {
                  const response = err?.response?.data;
                  console.log(response)
                  setErrorResponse({ message: err?.response?.data?.message ?? 'Szerver hiba!' });
              });

  }

  if (token){
        console.log(token ?? 'No token');

        setNotification("Bejelentkezve, mint: " + user + `\n` + role);
        return <Navigate to="/main/main-container"/>;
  }


  return (
   <div className="d-flex justify-content-center align-items-center min-vh-100">
       <div className="login-container card shadow-sm container col-6 px-0">
           <form noValidate={true} onSubmit={onSubmit}>
               <h1 className="title card-title text-center m-3">
                   Bejelentkezés
               </h1>
               <div className="name-container mb-3 mx-3">
                   <label className="form-label">Felhasználónév</label>
                   <input className="form-control text-bg-light"
                          placeholder="Felhasználónév" type="text" {...register('name', nameRules)}/>
                   {touchedFields.name && errors.name &&
                       <small style={{color:'red', whiteSpace:'pre-line'}}
                       className="invalid-feedback d-block text-center">{errors.name.message}</small>}
               </div>
               <div className="email-container mb-3 mx-3">
                   <label className="form-label">Email</label>
                   <input className="form-control text-bg-light"
                          placeholder="Email" type="email" {...register('email', emailRules)}/>
                   {touchedFields.email && errors.email && (
                       <small className="invalid-feedback d-block text-center">
                           {errors.email.message}
                       </small>
                   )}
               </div>
               <div className="password-container mb-3 mx-3">
                   <label className="form-label">Jelszó</label>
                   <input className="form-control text-bg-light"
                          placeholder="Jelszó" type="password" {...register('password' ,passwordRules)}/>
                   {touchedFields.password && errors.password && (
                       <small className="invalid-feedback d-block text-center">
                           {errors.password.message}
                       </small>
                   )}
               </div>
               <button className="btn btn-success btn-lg w-75 d-block mx-auto mt-4" type="submit"
                       disabled={!enable()}>
                   Bejelentkezés</button>
               {error_response.message && <a className="alert alert-danger d-block mx-5 mt-3">
                   {error_response.message}
               </a>}
               <small style={{color:'blue', display: 'block', overflow:'hidden', whiteSpace:'ellipse'}}
                className="card-footer d-block mt-4">
                   <Link className="link-secondary bg-white" to="/auth/signup">Felhasználó létrehozása</Link>
               </small>
           </form>
       </div>
   </div>
  )
}