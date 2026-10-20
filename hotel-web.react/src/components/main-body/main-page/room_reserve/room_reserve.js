import httpClient from "../../../../axios-client";
import {useEffect, useState} from "react";
import {useStateContext} from "../../../../ContextProvider";
import RoomForm from "../rooms/roomForm";
import ReservationForm from "./reservationForm";
import {useNavigate} from "react-router-dom";
import roomImg from "../../../../assets/room.png";

export default function Reserve(){
    const {demoRooms, demoOrders, filterRooms, demoMode, token, setNotification} = useStateContext();
    const [error_response, setErrorResponse] = useState({
        message: null,
        status: false
    })

    const [rooms, setRooms] = useState([{}]);
    const [floors, setFloors] = useState([]);
    const [reservations, setReservations] = useState([{}]);
    const [user, setUser] = useState(null);

    let [loading, setLoading] = useState(false);
    let [err, setErr] = useState(null);
    let [parameters, setParameters] = useState({
        floor: null,
        status: 'all'
    })
    const navigate = useNavigate();

    // modal control
    const [formActive, setFormActive] = useState(false);
    const [formId, setFormId] = useState(null);

    useEffect(() => {
        getFloors();
        getReservations();
        getUser();
    }, []);

    useEffect(() => {
        getRooms();
    }, [parameters]);



    const getFloors = () => {
        if (demoMode){
            setFloors([...new Set(demoRooms.map(room => room.floor))]);
            setErr(null)
        }
        else
            httpClient.get("floors").then(
                ({data}) => {
                    //let {name, email, birth, role} = data;
                    setFloors(data.data);
                }
            )
            .catch((err) => {
                setErr(err)
            })
    }

    const getRooms = () => {
        setLoading(true)
        if (demoMode){
            setRooms(filterRooms(parameters));
            setErr(null)
            setLoading(false)
        }
        else
            httpClient.get("rooms",  { params: parameters }).then(
                ({data}) => {
                    //let {name, email, birth, role} = data;
                    setErr(null)
                    setLoading(false)
                    setRooms(data.data);
                }
            )
            .catch((err) => {
                alert("Szerver hiba!");
                setErr(err)
                setLoading(false)
            })
    }

    const getReservations = () => {
        setLoading(true);
        if (demoMode){
            setReservations(demoOrders);
            setErr(null);
            setLoading(false);
        }
        else
            httpClient.get("reservations", { user: user.name }).then(
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

    const getUser = () => {
        if (demoMode){
            setUser({
                id: 1,
                name: "anonymus",
                email: "anonymous@demo.local",
                birth: "2000-01-01",
                created_at: "2026-10-19 00:00:00",
                role: "Anonymous",
                token: token,
            });
        }
        else
            httpClient.get('user').then(({data}) => {
                setUser(data.data)
            }).catch((err) => {
                setErr(err)
            })
    }

    const openForm = (id) => {setFormActive(true); setFormId(id)};
    const closeForm = () => {setFormActive(false); setFormId(null); };
    const handleSaved = () => {
        setFormActive(false);
        setFormId(null);
        navigate("/main/main-container");
    };

    const isRequestedByUser = (room_number) => {
        const orders = demoMode ? demoOrders : reservations;

        return reservations.some(reservation =>
            reservation.room === room_number &&
            reservation.user === user.name &&
            reservation.status === 'PENDING'
        );
    }

    return (
        <div className="room-layout container py-3">
            <div className="row g-3">
                {/* LEFT: filters */}
                <div className="room-filter-div col-12 col-md-4 p-2">
                    <div className="card shadow-sm bg-secondary text-white p-3">
                        <h3 className="mb-3 text-decoration-underline">Épület szint</h3>

                        <select
                            className="form-select mb-4"
                            value={parameters.floor ?? ""}
                            onChange={(e) => setParameters(prev => ({ ...prev, floor: e.target.value || null }))}
                        >
                            <option value="">Összes</option>
                            {floors.map(f => (
                                <option key={f} value={f}>{f}</option>
                            ))}
                        </select>

                        <h3 className="mb-3 text-decoration-underline">Szoba státusz</h3>

                        <div className="d-block px-5">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="status"
                                    id="status-free"
                                    value="free"
                                    checked={parameters.status === "free"}
                                    onChange={() => setParameters(prev => ({ ...prev, status: "free" }))}
                                />
                                <label className="form-check-label ms-1" htmlFor="status-free">Szabad</label>
                            </div>

                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="status"
                                    id="status-reserved"
                                    value="reserved"
                                    checked={parameters.status === "reserved"}
                                    onChange={() => setParameters(prev => ({ ...prev, status: "reserved" }))}
                                />
                                <label className="form-check-label ms-1" htmlFor="status-reserved">Foglalt</label>
                            </div>

                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="status"
                                    id="status-all"
                                    value=""
                                    checked={parameters.status === null || parameters.status === "all"}
                                    onChange={() => setParameters(prev => ({ ...prev, status: null }))}
                                />
                                <label className="form-check-label ms-1" htmlFor="status-all">Összes</label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: header + grid */}
                <div className="room-results-div col-12 col-md-8 p-2">
                    {/* header row */}
                    <div className="title-div d-flex justify-content-between align-items-center px-2 h-auto">
                        <h1 className="h3 m-0">Aktuális szobák</h1>
                    </div>

                    {/* loading */}
                    {loading &&
                        <div className="container mt-3">
                            <div className="loading-div">
                                <a className="loading-title">Loading...</a>
                                <div className="loading-box">
                                    <div className="loading-line">
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                    {!loading && !err && rooms?.length === 0 && (
                        <div className="rooms-empty-message bg-light p-2 mt-3 shadow">
                            Üres eredménylista!
                        </div>
                    )}

                    {/* cards grid */}
                    {!loading && !err && rooms?.length > 0 && (
                        <div className="rooms-scroll d-block bg-light p-2 mt-3 shadow">
                            <div className="room-cards row row-cols-1 row-cols-md-2 g-3 ">
                                {rooms.map(r => (
                                    <div className="col" key={r.id}>
                                        <div className="card shadow-sm">
                                            <div className="card-body d-flex flex-column">

                                                {/* title centered */}
                                                <h5 className="text-center mb-3">{r.room_number}</h5>

                                                {/* image centered */}
                                                <div className="d-flex justify-content-center align-content-center w-100">
                                                    <img
                                                        src={roomImg}
                                                        alt="room"
                                                        className="room-img"
                                                    />
                                                </div>

                                                {/* label/value rows */}
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="fw-semibold text-muted">ID:</span>
                                                    <span className="text-muted">{r.id}</span>
                                                </div>

                                                <div className="d-flex justify-content-between mb-3">
                                                    <span className="fw-semibold text-muted">Ár:</span>
                                                    <span className="text-muted">{r.price}</span>
                                                </div>

                                                {/* buttons centered at bottom */}
                                                <div className="mt-auto d-flex flex-wrap justify-content-center">
                                                    <button type="button" className="btn btn-success w-100"
                                                            onClick={() => openForm(r.id)}
                                                            disabled={r.status !== "free" || isRequestedByUser(r.room_number)}
                                                    >
                                                        Szoba foglalás
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {formActive && (
                <ReservationForm
                    id={formId}
                    onClose={closeForm}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}