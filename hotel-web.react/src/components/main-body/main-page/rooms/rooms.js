import {useEffect, useState} from "react";
import httpClient from "../../../../axios-client";
import Userform from "../../users/userform";
import RoomForm from "./roomForm";
import {useStateContext} from "../../../../ContextProvider";
import roomImg from "../../../../assets/room.png";

export default function Rooms(){

    const {demoRooms, filterRooms, demoMode,setNotification} = useStateContext();
    const [error_response, setErrorResponse] = useState({
        message: null,
        status: false
    })

    const [rooms, setRooms] = useState([{}]);

    const [floors, setFloors] = useState([]);
    let [loading, setLoading] = useState(false);
    let [err, setErr] = useState(null);
    let [parameters, setParameters] = useState({
        floor: null,
        status: 'all'
    })

    // modal control
    const [formActive, setFormActive] = useState(false);

    const [editMode, setEditMode] = useState({
        editStatus: false,
        editId: null,
        isChanged: false
    });
    const [editDraft, setEditDraft]   = useState(null);
    const [roomToUpdate, setRoomToUpdate] = useState({});

    const enableEdit = (id) => {
        setEditMode(prev => ({
            ...prev,
            editStatus: true,
            editId: id}
        ));
        // also set the room data
        const currentRoom = rooms.find(r => Number(r.id) === Number(id));
        setRoomToUpdate(currentRoom);
        setEditDraft({ price: String(currentRoom.price), floor: currentRoom.floor, serial_number: currentRoom.serial_number });
    };

    const saveEdit = () => {
        let id = editMode.editId;
        httpClient.put(`/rooms/${id}`, editDraft)
            .then(({data}) => {
                setNotification(("A szoba adatai módosultak: " + `\n ${data.room_number}`))
                setEditMode({editStatus: false, editId: null, isChanged: false});
                getRooms()
            })
            .catch((err) => {
                const response = err.response;
                if(response.status === 422){
                    alert(response.data.message)
                } else {
                    alert("Szerver hiba!");
                }
                setEditMode({editStatus: false, editId: null, isChanged: false});
            })
    }

    const cancelEdit = () => {
        setEditMode({editStatus: false, editId: null, isChanged: false});
        setRoomToUpdate(null);
    }

    // pick the single CTA for this row while editing
    const cta = !editMode.isChanged
        ? { text: 'Kilépés', cls: 'btn-primary', onClick: cancelEdit }
        : { text: 'Mentés',   cls: 'btn-warning', onClick: saveEdit };


    useEffect(() => {
        getFloors();
    }, [parameters]);

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
            const _rooms = structuredClone(rooms);
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
                }
            )
    }

    const deleteRoom = (id) => {
        console.log(`rooms/${id}`);
        httpClient.delete(`rooms/${id}`).then(
            () => {
                getRooms();
            }
        )
    }

    const openForm = () => {setFormActive(true); };
    const closeForm = () => {setFormActive(false); };

    // called by child after successful save
    const handleSaved = () => {
        setFormActive(false);
        getRooms(); // refresh list
        getFloors();
    };

    return (
        <div className="container py-3 h-100">
            <div className="row g-3 h-100">
                {/* LEFT: filters */}
                <div className="col-12 col-md-4 p-2 h-100">
                    <div className="card shadow-sm bg-secondary h-100 text-white p-3">
                        <h3 className="mb-3 text-decoration-underline">Épület szint</h3>

                        <select
                            className="form-select mb-4"
                            value={parameters.floor ?? ""}
                            onChange={(e) => setParameters(prev => ({ ...prev, floor: e.target.value || null }))}
                        >
                            <option value="">Összes</option>
                            {floors.map(f => (
                                <option value={f}>{f}</option>
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
                <div className="col-12 col-md-8 p-2 h-100">
                    {/* header row */}
                    <div className="d-flex justify-content-between align-items-center px-2 h-auto">
                        <h1 className="h3 m-0">Aktuális szobák</h1>
                        <button className="btn btn-success btn-sm mt-4"
                                onClick={() => openForm()}>Új szoba</button>
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
                        <div className="rooms-scroll d-block bg-light p-2 mt-3 shadow overflow-y-auto"
                        style={{height:'88%'}}>
                            <div className="row row-cols-1 row-cols-md-2 g-3 ">
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
                                                    {editMode.editStatus && editMode.editId == r.id ? (
                                                        <input type="number"
                                                               className="form-control w-50"
                                                        onChange={(e) => {
                                                            setEditDraft(prev => ({ ...prev, price: e.target.value }));
                                                            setEditMode(prev => ({
                                                                ...prev,
                                                                isChanged: String(roomToUpdate.price) !== String(e.target.value),  // compare to frozen original
                                                            }));
                                                        }}
                                                        defaultValue={r.price}/>
                                                    ) : (
                                                        <span className="text-muted">{r.price}</span>
                                                    )}
                                                </div>

                                                {/* buttons centered at bottom */}
                                                <div className="mt-auto d-flex flex-wrap justify-content-center gap-2">
                                                    {editMode.editStatus == true && editMode.editId == r.id ?
                                                            (
                                                                <button type="button" className={`btn ${cta.cls}`}
                                                                    onClick={cta.onClick}
                                                                >
                                                                    {cta.text}
                                                                </button>
                                                            ) : (
                                                        <button type="button" className="btn btn-primary"
                                                        onClick={() => enableEdit(r.id)}
                                                        disabled={editMode.editStatus == true}>Módosítás</button>
                                                    )}
                                                    <button type="button" className="btn btn-danger"
                                                            onClick={() => deleteRoom(r.id)}
                                                            disabled={editMode.editStatus == true}>Eltávolítás</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {formActive && (
                                <RoomForm
                                    onClose={closeForm}
                                    onSaved={handleSaved}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}