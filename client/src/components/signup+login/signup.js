import httpClient from "../../axios-client.js";
import {useState} from "react";
import {useStateContext} from "../../ContextProvider.js";
import {Link} from "react-router-dom";
import {useForm} from "react-hook-form";

export default function Signup() {

 const {notification,setNotification} = useStateContext();


 let {
    register,
    getValues,
    formState: { errors, touchedFields },
 } = useForm({ mode: 'onTouched', reValidateMode: 'onChange' });

 const [error_response, setErrorResponse] = useState({
    message: null,
    status: false,
 });


 const nameRules = {
    required: 'Kötelező mező!',
    maxLength: { value: 55, message: 'Max. 55 karakter' },
    pattern: {
        // allows latin letters incl. accents, numbers, space, underscore, hyphen
        value: /^[^!\.\?\;\,\:\&@]+$/,
        message: 'Nem megengedett karakter (!?;,:&@) !',
    },
 };


// EMAIL: required + looks like an email
 const emailRules = {
    required: 'Kötelező mező!',
    pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Érvénytelen email cím',
    },
 };

 // BIRTH: required + valid date + after 1910-01-01
 const birthRules = {
    required: 'Kötelező mező!',
    validate: {
        isDate: (v) => !isNaN(Date.parse(v)) || 'Érvénytelen formátum',
        afterMin: (v) =>
            new Date(v) > new Date('1910-01-01') ||
            '1910-01-01 előtti dátum nem kezelt!',
        isAdult: (v) =>
            new Date(v) <= eighteenAgo() || 'Legalább 18 évesnek kell lennie',
    },
 };

 // PASSWORD: required + min 8 + 1 lower + 1 upper + 1 digit + 1 special from .!?,;:@
 const passwordRules = {
    required: 'Kötelező mező!',
    minLength: { value: 6, message: 'Min. 6 karakter' },
    pattern: {
        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.!?,;:@]).{8,}$/,
        message:
            'Legalább 1 kis- és nagybetű, 1 szám és 1 speciális karakter (. ! ? , ; : @)',
    },
 };

 //Adult age-check
 function eighteenAgo(){
     const toYMD = (d) =>
         new Date(d.getTime() - d.getTimezoneOffset() * 60000)
             .toISOString()
             .slice(0, 10);

     // compute dynamic limits
     const minBirth = new Date('1910-01-02'); // > 1910-01-01 (to match your rule)
     const eighteenAgo = new Date();
     eighteenAgo.setFullYear(eighteenAgo.getFullYear() - 18);
     return eighteenAgo
 }

 function enable(){
     const nameOk = !errors.name && touchedFields.name;
     const emailOk = !errors.email && touchedFields.email;
     const birthOk = !errors.birth && touchedFields.birth;
     const passwordOk = !errors.password && touchedFields.password;

     return (nameOk && emailOk && birthOk && passwordOk);
 }



 function onSubmit(e) {
    e.preventDefault();
    const payload = getValues();
    console.log(payload)
      httpClient.post('signup', payload)
        .then(({data}) => {
            setErrorResponse({message: null, status: null})
            setNotification("Új felhasználó: " + `\n ${data.name}` );
            console.log('Új felhasználó');
        })
        .catch((err) => {
            const response = err.response;
            setErrorResponse({status: true})
            if (response && response.status === 422) {
                const apiErrors = response.data.errors;

                console.log(apiErrors)

                errors.name = {...{message: apiErrors.name ?? null}};
                errors.email = {...{message: apiErrors.email ?? null}};

                //console.log(errors.name)
                //console.log(errors.email)
            } else {
                setErrorResponse({ message: 'Szerver hiba!' })
                //console.log(err.response);
            }
        });
 }



 return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
        {notification  &&
        <div className="message-container container">
                <a className="message-title">{notification}</a>
                <button className="btn btn-primary ok"
                        onClick={() => setNotification(null)}>OK</button>

        </div>}
        <div className="signup-container card shadow-sm container col-6 px-0">
            <form onSubmit={onSubmit}>
                <h1 className="title card-title text-center m-3">
                    Regisztráció
                </h1>

                <div className="row g-3 justify-content-center mx-3 mt-2">
                    <div className="name-container col-md-6">
                        <label>Felhasználónév</label>
                        <input className="form-control text-bg-light" placeholder="Felhasználónév"
                               type="text" {...register('name', nameRules)}/>
                        {(touchedFields.name || error_response.status) && errors.name &&
                            <small style={{color: 'red', whiteSpace: 'pre-line'}}
                            className="invalid-feedback d-block text-center">{errors.name.message}</small>}
                        {/*error_response.status && errors.name &&
                            <small style={{color: 'red', whiteSpace: 'pre-line'}}
                            className="invalid-feedback d-block text-center">{errors.name}</small>
                        */}
                    </div>
                    <div className="email-container col-md-6">
                        <label>Felhasználónév</label>
                        <input className="form-control text-bg-light" placeholder="Email"
                               type="email" {...register('email', emailRules)}/>
                        {(touchedFields.email || error_response.status) && errors.email &&
                            <small style={{color: 'red', whiteSpace: 'pre-line'}}
                            className="invalid-feedback d-block text-center">{errors.email.message}</small>}
                        {/*error_response.status && errors.email &&
                            <small style={{color: 'red', whiteSpace: 'pre-line'}}
                                   className="invalid-feedback d-block text-center">{errors.email}</small>*/}
                    </div>
                </div>
                <div className="row g-3 justify-content-center mx-3 mt-2">
                    <div className="birth-container col-md-6">
                        <label>Felhasználónév</label>
                        <input className="form-control text-bg-light" placeholder="Szül. dátum"
                               type="date" {...register('birth', birthRules)}/>
                        {touchedFields.birth && errors.birth &&
                            <small style={{color: 'red', whiteSpace: 'pre-line'}}
                            className="invalid-feedback d-block text-center">{errors.birth.message}</small>}
                    </div>
                    <div className="password form-group col-md-6">
                        <label>Jelszó</label>
                        <input className="form-control text-bg-light"
                               {...register('password', passwordRules)} className="form-control text-bg-light"
                               placeholder="Jelszó" type="password"/>
                        {touchedFields.password && errors.password &&
                            <small style={{color: 'red', whiteSpace: 'pre-line'}}
                            className="invalid-feedback d-block text-center">{errors.password.message}</small>}
                    </div>
                </div>
                <button className="btn btn-success btn-lg w-75 d-block mx-auto m-4 mb-4" type="submit"
                        disabled={!enable()}>Regisztráció
                </button>
                {error_response.message && <a className="alert alert-danger d-block mx-5 mt-3">
                    {error_response.message}
                </a>}
                <small style={{color: 'blue', display: 'block', overflow: 'hidden', whiteSpace: 'ellipse'}}
                       className="card-footer d-block border-0 mx-0">
                    <Link className="link-secondary bg-white" to="/auth/login">Bejelentkezés</Link>
                </small>
            </form>
        </div>
    </div>
  )
 }