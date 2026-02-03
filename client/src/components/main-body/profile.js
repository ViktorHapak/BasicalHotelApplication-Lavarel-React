import {useContext, useEffect, useState} from "react";
import httpClient from "../../axios-client";
import {useStateContext} from "../../ContextProvider";

export default function Profile() {

    const [user, setUser] = useState(null);
    let [loading, setLoading] = useState(false);
    let [err, setErr] = useState(null);
    const {token} = useStateContext()

    useEffect(() => {
        setLoading(true);
        httpClient.get('user').then(({data}) => {
            setErr(null)
            setUser(data.data)
            console.log(data.data)
            //console.log(user);
            //Object.entries(user).map((key) => console.log(key[0] + ": " + key[1]));
            setLoading(false)
        }).catch((err) => {
            setErr(err)
            alert("Szerver hiba!");
            setLoading(false)
        })
    }, [])

    return (
        <div className="card container shadow-sm py-4-0 mt-5 col-lg-6 p-0" style={{minHeight: "200px"}}>
            <h2 className="card-header">Felhasználó adatai</h2>
            <div className="card-body">
                {loading &&
                    <div className="loading-div">
                        <a className="loading-title">Loading...</a>
                        <div className="loading-box">
                            <div className="loading-line">

                            </div>
                        </div>
                    </div>
                }
                {!loading && !err && user && Object.entries(user).map((key) => (
                    <div className="row g-3">
                        <a className="field_name col-12 col-md-4 text-white bg-primary p-1 px-2">
                            {key[0]}</a>
                        <a className="field_value col-12 col-md-8 text-break bg-light p-1 px-2">
                            {key[1]}</a>
                    </div>
                ))}
                {!loading && !err && user &&
                    <div className="row g-3">
                        <a className="field_name col-12 col-md-4 text-white bg-primary p-1 px-2">
                            Token</a>
                        <a className="field_value col-12 col-md-8 text-break bg-light p-1 px-2">
                            {token}</a>
                    </div>
                }
            </div>
        </div>
    )
}