import httpClient from "../../../../axios-client";
import {useStateContext} from "../../../../ContextProvider";
import {useEffect, useState} from "react";
import ReservationInfo from "./reservationInfo";

export default function Reservations() {

    const {setNotification} = useStateContext();
    const [error_response, setErrorResponse] = useState({
        message: null,
        status: false
    })

    // modal control
    const [formActive, setFormActive] = useState(false);
    const [formId, setFormId] = useState(null);

    const [reservations, setReservations] = useState([{}]);
    const [floors, setFloors] = useState([]);
    let [loading, setLoading] = useState(false);
    let [err, setErr] = useState(null);
    let [parameters, setParameters] = useState({
        user: '',
        floor: null,
        status: 'all'
    })

    useEffect(() => {
        getFloors();
    }, []);

    useEffect(() => {
        getReservations();
    }, [parameters]);

    const getFloors = () => {
        httpClient.get("floors").then(
            ({data}) => {
                //let {name, email, birth, role} = data;
                setFloors(data.data);
                setErr(null);
            }
        )
            .catch((err) => {
                setErr(err)
            })
    }

    const getReservations = () => {
        setLoading(true);
        httpClient.get("reservations", { params: parameters }).then(
            ({data}) => {
                //let {name, email, birth, role} = data;
                setReservations(data.data);
                setErr(null);
                setLoading(false);
            }
        )
            .catch((err) => {
                setErr(err)
                alert("Szerver hiba!");
                setLoading(false);
            })

    }

    const acceptReservation = (id) => {
        httpClient.put(`reservations/update/${id}`).then(({data}) => {
            setNotification("Rendelés elfogadva");
            getReservations();
        })
            .catch((err) => {
                const response = err.response;
                if (response.status === 422) {
                    alert(response.data.message);
                } else {
                    alert("Szerver hiba!");
                }
            })
    }

    const rejectReservation = (id) => {
        httpClient.delete(`reservations/delete/${id}`).then(({data}) => {
            setNotification("Rendelés elutasítva");
            getReservations();
        })
            .catch((err) => {
                const response = err.response;
                if (response.status === 422) {
                    if (window.confirm(response.data.message)) {
                        httpClient.delete(`reservations/delete/confirm/${id}`).then(
                            ({data}) => {
                                setNotification("Szobafoglalás törölve!");
                                getReservations();
                            })
                    }
                } else {
                    alert("Szerver hiba!");
                }
            })
    }

    const actualization = () => {
        httpClient.put(`actualize`).then(({data}) => {
            setNotification("A rendelési adatok aktualizálva!")
            getReservations();
        })
    }

    const readInfo = (id) => {
        //httpClient.get(`reservations/${id}`).then(({data}) => {})
        setFormId(id);
        setFormActive(true);
    }

    const onClose = () => {
        setFormActive(false);
        setFormId(null);
    }

    return (
        <div className="container py-3 h-100">
            <div className="card shadow-sm p-0">
                <div className="card-body bg-white">

                    {/* Filters */}
                    <div className="row g-3">

                        {/* User filter */}
                        <div className="col-12 col-md-4">
                            <h6 className="text-decoration-underline mb-3">
                                Felhasználó
                            </h6>

                            <div className="input-group w-100">
                                <input type="search" id="user-search" className="form-control" placeholder="Keresés név vagy email szerint…" aria-label="Keresés"
                                    onChange={(e) =>
                                        setParameters((prev) => ({...prev,
                                            user: e.target.value})
                                        )
                                    }
                                />
                                <button type="button" className="btn btn-primary">
                                    <i className="fa fa-search" aria-hidden="true"></i>
                                    {/* or Bootstrap Icons: <i className="bi bi-search"></i> */}
                                </button>
                            </div>
                        </div>

                        {/* Floor filter */}
                        <div className="col-12 col-md-4">
                            <h6 className="text-decoration-underline mb-3">Épületszint</h6>

                            <select className="form-select w-100" value={parameters.floor ?? ""}
                                onChange={(e) =>
                                    setParameters(prev => ({...prev, floor: e.target.value || null}))
                                }
                            >
                                <option value="">Összes</option>
                                {floors.map(f => (
                                    <option key={f} value={f}>
                                        {f}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Reservation status filter */}
                        <div className="col-12 col-md-4">
                            <h6 className="text-decoration-underline mb-3">
                                Rendelés állapot
                            </h6>

                            <div className="d-flex flex-column gap-2">

                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="status"
                                        id="status-pending" value="PENDING" checked={parameters.status === "PENDING"}
                                        onChange={() =>
                                            setParameters(prev => ({...prev, status: "PENDING"}))
                                        }
                                    />
                                    <label className="form-check-label ms-1" htmlFor="status-pending">
                                        Függő
                                    </label>
                                </div>

                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="status"
                                        id="status-accepted" value="ACCEPTED" checked={parameters.status === "ACCEPTED"}
                                        onChange={() => setParameters(prev => ({...prev, status: "ACCEPTED"}))}
                                    />
                                    <label className="form-check-label ms-1" htmlFor="status-accepted">
                                        Elfogadott
                                    </label>
                                </div>

                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="status"
                                        id="status-expired" value="EXPIRED"
                                        checked={parameters.status === null || parameters.status === "EXPIRED"}
                                        onChange={() =>
                                            setParameters(prev => ({...prev, status: "EXPIRED"}))
                                        }
                                    />
                                    <label className="form-check-label ms-1" htmlFor="status-expired">
                                        Lejárt
                                    </label>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* empty result */}
            {!loading && !err && reservations?.length === 0 && (
                <div className="reservations-empty-message bg-light p-2 mt-3 shadow">
                    Üres eredménylista!
                </div>
            )}

            {/* Reservations list */}
            <div className="container">
                <div
                    className="reservations-scroll d-block bg-white px-2 mt-3 overflow-y-auto"
                    style={{ height: "80%" }}
                >

                    {/* loading */}
                    {loading && (
                        <div className="loading-div">
                            <a className="loading-title">
                                Loading...
                            </a>
                            <div className="loading-box">
                                <div className="loading-line"></div>
                            </div>
                        </div>
                    )}

                    {/* Reservations table */}
                    {!loading && !err && reservations.map((res) => (
                        <div key={res.id} className="table-responsive rounded-2 shadow-sm my-4">
                            <table className="table table-hover mb-0">
                                <thead className="bg-primary text-white">
                                <tr>
                                    <th className="text-left bg-primary text-white" colSpan={4}>
                                        Id: {res.id}
                                    </th>
                                </tr>
                                </thead>

                                <tbody>
                                <tr>
                                    <td className="text-muted w-25">{res.user}</td>

                                    <td className="text-muted w-25">{res.room}</td>

                                    {res.status === "ACCEPTED" && (
                                        <td className="text-muted w-25 bg-success text-success">
                                            <i className="fa fa-check"></i>
                                            {" "}{res.status}
                                        </td>
                                    )}

                                    {res.status === "PENDING" && (
                                        <td className="text-muted w-25 bg-warning text-warning">
                                            <i className="fa fa-refresh"></i>
                                            {" "}{res.status}
                                        </td>
                                    )}

                                    {res.status === "EXPIRED" && (
                                        <td className="text-muted w-25 bg-danger text-danger">
                                            <i className="fa fa-close"></i>
                                            {" "}{res.status}
                                        </td>
                                    )}

                                    <td className="text-muted w-25">
                                        <div className="d-flex btn-group-sm gap-2 justify-content-center">
                                            <button className="btn btn-danger" onClick={() => rejectReservation(res.id)}>
                                                <i className="fa fa-trash"></i>
                                            </button>

                                            {res.status === "PENDING" && (
                                                <button className="btn btn-success" onClick={() => acceptReservation(res.id)}>
                                                    <i className="fa fa-check"></i>
                                                </button>
                                            )}

                                            <button className="btn btn-info" onClick={() => readInfo(res.id)}>
                                                <i className="fa fa-book"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    ))}

                    {/* Actualization */}
                    {!loading && !err && (
                        <div className="d-flex justify-content-end w-100">
                            <button className="btn btn-secondary btn-sm mb-2 mx-1" onClick={() => actualization()}>Aktualició</button>
                        </div>
                    )}

                </div>
            </div>

            {/* Reservation details */}
            {formActive && (
                <ReservationInfo id={formId} onClose={onClose}/>
            )}
        </div>
    );


};