import {useEffect, useState} from "react";
import httpClient from "../../../../axios-client";
import {useStateContext} from "../../../../ContextProvider";

export default function OwnReservationInfo({id, onClose}){

    const {demoMode, demoOrders} = useStateContext();
    const [reservation, setReservation] = useState({});
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    useEffect(() => {
        setLoading(true);
        if (demoMode){
            setReservation(demoOrders.find(order => order.id === id));
            setLoading(false)
            setErr(null);
        }
        else
            httpClient.get(`reservations/show/${id}`).then(({data}) => {
                setReservation(data.data);
                setLoading(false)
            }).catch((err) => {
                setErr(err);
                setLoading(false);
            })
    }, [])

    return (
        <div className="fade-background d-flex justify-content-center align-items-center min-vh-100">
            <div className="reservationform-container container card shadow-sm col-6 p-0 bg-light">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h2 className="title text-muted">Rendelés adatai</h2>
                    <button className="btn btn-outline-danger align-content-start btn-sm"
                            onClick={onClose}>X</button>
                </div>
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
                    <div className="overflow-y-auto" style={{ maxHeight: '50vh' }}>
                        {!loading && !err && reservation && Object.entries(reservation).map((key) => (
                            <div className="row g-0 overflow-y-auto">
                                <a className="field_name col-12 col-md-4 text-white bg-primary p-1 px-2">
                                    {key[0]}</a>
                                <a className="field_value col-12 col-md-8 text-break text-dark bg-white p-1 px-2 text-end">
                                    {key[1]}</a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    )
}