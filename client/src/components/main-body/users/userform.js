import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import httpClient from "../../../axios-client";
import {useStateContext} from "../../../ContextProvider";

export default function Userform({ id, operation, onClose, onSaved }){

    const {setNotification} = useStateContext();

    const [user, setUser] = useState(null);
    const [originalUser, setOriginalUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error_response, setErrorResponse] = useState({
      message: null,
      status: false
    })

    let {
     register,
     getValues,
     formState: { errors, touchedFields },
    } = useForm({ mode: 'onTouched', reValidateMode: 'onChange' });

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

    function isChanged() {
        if (!originalUser) return false;

        return (
            user.name !== originalUser.name ||
            user.email !== originalUser.email ||
            user.birth !== originalUser.birth ||
            user.role !== originalUser.role
        );
    }

    function enable(){
        const nameOk = !errors.name;
        const emailOk = !errors.email;
        const birthOk = !errors.birth;

        return (operation == "update") ? (nameOk && emailOk && birthOk &&
                isChanged()) :
            (nameOk && emailOk && birthOk && (touchedFields.name && touchedFields.email &&
                touchedFields.birth));
    }

    useEffect(() => {
            getUser();
    }, [id]);



    const getUser = () => {
        if (operation == "add") return;
        setLoading(true);
        httpClient.get(`users/${id}`).then(({data}) => {
            setErrorResponse(null);
            setUser(data.data)
            setOriginalUser(data.data);
            console.log(data.data)
            //console.log(user);
            //Object.entries(user).map((key) => console.log(key[0] + ": " + key[1]));
            setLoading(false)
        }).catch((err) => {

        })

    }

    const onSubmit = (e) => {
        e.preventDefault();
        switch (operation) {
            case "update": {
                console.log("update");
                httpClient.put(`/users/${id}`, user)
                    .then(({data}) => {
                        setErrorResponse({message: null, status: null})
                        setNotification(("A felhasználó adatai módosultak: " + `\n ${user.name}`))
                        onSaved();
                    })
                    .catch((err) => {
                        const response = err.response;
                        setErrorResponse({status: true})
                        if (response && response.status === 422) {
                            const apiErrors = response.data.errors;
                            console.log(apiErrors)
                            errors.name = {...{message: apiErrors.name ?? null}};
                            errors.email = {...{message: apiErrors.email ?? null}};
                        } else {
                            setErrorResponse({ message: 'Szerver hiba!' })
                            console.log(err.response);
                        }
                    })
            }
            case "add": {
                const payload = getValues();
                console.log(payload)
                httpClient.post(`/users`, payload)
                    .then(({data}) => {
                        setErrorResponse({message: null, status: null})
                        setNotification(("Új felhasználó hozzáadva: " + `\n ${user.name}`))
                        onSaved();
                    })
                    .catch((err) => {
                        const response = err.response;
                        setErrorResponse({status: true})
                        if (response && response.status === 422) {
                            const apiErrors = response.data.errors;
                            console.log(apiErrors)
                            errors.name = {...{message: apiErrors.name ?? null}};
                            errors.email = {...{message: apiErrors.email ?? null}};
                        } else {
                            setErrorResponse({ message: 'Szerver hiba!' })
                            console.log(err.response);
                        }
                    })

            }
            default: {}
        }

    }

  return (
   <div className="fade-background d-flex justify-content-center align-items-center min-vh-100">
       <div className="userform-container container card shadow-sm col-6 p-0 bg-light">
         <form noValidate={true} onSubmit={onSubmit}>
           <div className="card-header d-flex justify-content-between align-items-center">
               <h1 className="title text-muted">
                   {(operation == "update") ? 'Felhasználó módosítása' : 'Új felhasználó' }</h1>
               <button className="btn btn-outline-danger align-content-start btn-sm"
                       onClick={onClose}>X</button>
           </div>
           <div className="card-body p-3 bg-light shadow-sm rounded-3">
               <div className="input-container d-block m-2 p-2 bg-white">
                   <div className="name-container m-3">
                       <label className="form-label">Felhasználónév</label>
                       <input className="form-control text-bg-light "
                              placeholder="Felhasználónév" type="text" {...register('name', nameRules)}
                              defaultValue={user?.name}
                              onChange={(e) =>
                              {setUser((prev) => ({ ...prev, name: e.target.value }))}}/>
                       {touchedFields.name && errors.name &&
                           <small style={{color:'red', whiteSpace:'pre-line'}}
                                  className="invalid-feedback d-block text-center">{errors.name.message}</small>}
                   </div>
                   <div className="email-container m-3">
                       <label className="form-label">Email</label>
                       <input className="form-control text-bg-light"
                              placeholder="Email" type="email" {...register('email', emailRules)}
                              defaultValue={user?.email}
                              onChange={(e) =>
                              {setUser((prev) => ({ ...prev, email: e.target.value }))}}/>
                       {touchedFields.email && errors.email && (
                           <small className="invalid-feedback d-block text-center">
                               {errors.email.message}
                           </small>
                       )}
                   </div>
                   <div className="birth-container m-3">
                       <label className="form-label">Szül. dátum</label>
                       <input className="form-control text-bg-light"
                              placeholder="Email" type="date" {...register('birth', birthRules)}
                              defaultValue={user?.birth}
                              onChange={(e) =>
                              {setUser((prev) => ({ ...prev, birth: e.target.value }))}}/>
                       {touchedFields.birth && errors.birth && (
                           <small className="invalid-feedback d-block text-center">
                               {errors.birth.message}
                           </small>
                       )}
                   </div>
                   {(operation == "add") &&
                       <div className="password-container m-3">
                           <label className="form-label">Jelszó</label>
                           <input className="form-control text-bg-light"
                                  placeholder="Jelszó" type="password" {...register('password', passwordRules)}
                                  onChange={(e) =>
                                  {setUser((prev) => ({ ...prev, password: e.target.value }))}}/>
                           {touchedFields.password && errors.password && (
                               <small className="invalid-feedback d-block text-center">
                                   {errors.password.message}
                               </small>
                           )}
                       </div>
                   }
                   <div className="role-container m-3">
                       <label className="role-label">Jogosultság</label>
                       <div className="d-flex form-input-group m-3 mx-4 justify-content-center gap-5">
                           <div className="form-check-inline">
                               <input
                                   className="form-check-input"
                                   type="radio"
                                   name="role"
                                   value="ROLE_User"
                                   checked={user?.role == "ROLE_User"}
                                   onChange={(e) =>
                                    {setUser((prev) => ({ ...prev, role: "ROLE_User" }))}}/>
                               <label className="form-check-label mx-2" htmlFor="role-user">Látogató</label>
                           </div>

                           <div className="form-check-inline">
                               <input
                                   className="form-check-input"
                                   type="radio"
                                   name="role"
                                   value="ROLE_Admin"
                                   checked={user?.role == "ROLE_Admin"}
                                   onChange={(e) =>
                                    {setUser((prev) => ({ ...prev, role: "ROLE_Admin" }))}
                                   }
                               />
                               <label className="form-check-label mx-2" htmlFor="role-admin">Admin</label>
                           </div>
                       </div>
                   </div>


               </div>
               <button className="btn btn-success btn-lg w-75 d-block mx-auto mt-4" type="submit"
                       disabled={!enable()}>
                   Művelet</button>
               {error_response?.message && <a className="alert alert-danger d-block mx-5 mt-3">
                   {error_response.message}
               </a>}
           </div>
         </form>
       </div>
   </div>
  )
}