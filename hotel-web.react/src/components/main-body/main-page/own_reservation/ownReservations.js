import {useStateContext} from "../../../../ContextProvider";
import {useEffect, useState} from "react";
import httpClient from "../../../../axios-client";
import ReservationInfo from "../reservations/reservationInfo";
import OwnReservationInfo from "./ownReservationInfo";
import {useNavigate} from "react-router-dom";

export default function OwnReservations(){

    const {demoMode, demoOrders, token, removeDemoOrder, setNotification} = useStateContext();
    const [error_response, setErrorResponse] = useState({
        message: null,
        status: false
    })

    // modal control
    const [formActive, setFormActive] = useState(false);
    const [formId, setFormId] = useState(null);

    const [reservations, setReservations] = useState([{}]);
    const [floors, setFloors] = useState([]);
    const [user, setUser] = useState(null);

    const navigate = useNavigate();

    let [loading, setLoading] = useState(false);
    let [err, setErr] = useState(null);
    let [parameters, setParameters] = useState({user: '', floor: '', status: 'all'})

    useEffect(() => {
        getReservations();
    }, [parameters, demoOrders, demoMode]);

    useEffect(() => {
        getUser();
    }, []);

    useEffect(() => {
        if (user?.name) {
            setParameters(prev => ({
                ...prev,
                user: user.name
            }));
        }
    }, [user?.name]);

    const getReservations = () => {
        setLoading(true);
        if (demoMode){
            setReservations(demoOrders.filter(_order =>
                    _order.status === parameters.status || parameters.status.toLowerCase() === 'all'
            ));

            setErr(null);
            setLoading(false);
        }
        else
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

    const cancelReservation = (id) => {
        if (demoMode) {
            removeDemoOrder(id);
            setNotification("Szobafoglalás visszavonva!");
            return;
        }
        else
            httpClient.delete(`reservations/delete/${id}`).then(({data}) => {
                setNotification("Szobafoglalás visszavonva!");
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
              <div className="card-body d-block bg-white">
                  <div className="d-flex col-12">
                      <div className="col-12 col-md-4">
                          <h4 className="text-decoration-underline">Rendelés állapot</h4>
                      </div>
                  </div>
                  <div className="d-flex col-12 mt-2 ">
                      <div className="col-12 col-md-12">
                          <div className="d-flex justify-content-center gap-3 m-2 flex-wrap">
                              <div className="form-check">
                                  <input
                                      className="form-check-input"
                                      type="radio"
                                      name="status"
                                      id="status-all"
                                      value="all"
                                      checked={parameters.status === 'all'}
                                      onChange={() => setParameters(prev => ({...prev, status: 'all'}))
                                      }
                                  />
                                  <label className="form-check-label ms-1" htmlFor="status-all">Összes</label>
                              </div>

                              <div className="form-check">
                                  <input
                                      className="form-check-input"
                                      type="radio"
                                      name="status"
                                      id="status-pending"
                                      value="PENDING"
                                      checked={parameters.status === "PENDING"}
                                      onChange={() => setParameters(prev => ({ ...prev, status: "PENDING" }))}
                                  />
                                  <label className="form-check-label ms-1" htmlFor="status-pending">Függő</label>
                              </div>

                              <div className="form-check">
                                  <input
                                      className="form-check-input"
                                      type="radio"
                                      name="status"
                                      id="status-accepted"
                                      value="ACCEPTED"
                                      checked={parameters.status === "ACCEPTED"}
                                      onChange={() => setParameters(prev => ({ ...prev, status: "ACCEPTED" }))}
                                  />
                                  <label className="form-check-label ms-1" htmlFor="status-accepted">Elfogadott</label>
                              </div>

                              <div className="form-check">
                                  <input
                                      className="form-check-input"
                                      type="radio"
                                      name="status"
                                      id="status-expired"
                                      value="EXPIRED"
                                      checked={parameters.status === "EXPIRED"}
                                      onChange={() => setParameters(prev => ({ ...prev, status: "EXPIRED" }))}
                                  />
                                  <label className="form-check-label ms-1" htmlFor="status-expired">Lejárt</label>
                              </div>
                          </div>
                      </div>
                  </div>

              </div>
          </div>
          <div className="container">

              {/* empty result */}
              {!loading && !err && reservations?.length === 0 && (
                  <div className="reservations-empty-message bg-light p-2 mt-3 shadow">
                      Üres eredménylista!
                  </div>
              )}

              <div className="reservations-scroll d-block bg-white px-2 mt-3 overflow-y-auto"
                   style={{height:'80%'}}>

                  {/* loading */}
                  {loading && (
                      <div className="loading-div">
                          <a className="loading-title">Loading...</a>
                          <div className="loading-box">
                              <div className="loading-line">
                              </div>
                          </div>
                      </div>
                  )
                  }

                  {!loading && !err && reservations.map((res) => (
                      <div className="table-responsive ounded-2 shadow-sm my-4">
                          <table className="table table-hover mb-0">
                              <thead className="bg-primary text-white">
                              <tr className="">
                                  <th className="text-left bg-primary text-white" colSpan={4}>Id: {res.id}</th>
                              </tr>
                              </thead>
                              <tbody>
                              <tr>
                                  <td className="text-muted w-25">{res.user}</td>
                                  <td className="text-muted w-25">{res.room}</td>
                                  {res.status === "ACCEPTED" &&
                                      <td className="text-muted w-25 bg-success text-success">
                                          <i className="fa fa-check" ></i> {res.status}
                                      </td>
                                  }
                                  {res.status === "PENDING" &&
                                      <td className="text-muted w-25 bg-warning text-warning">
                                          <i className="fa fa-refresh" ></i> {res.status}
                                      </td>
                                  }
                                  {res.status === "EXPIRED" &&
                                      <td className="text-muted w-25 bg-danger text-danger">
                                          <i className="fa fa-close" ></i> {res.status}
                                      </td>
                                  }
                                  <td className="text-muted w-25">
                                      <div className="d-flex btn-group-sm gap-2 justify-content-center">
                                          <button className="btn btn-danger"
                                                  onClick={() => cancelReservation(res.id)}>
                                              <i className="fa fa-trash" ></i>
                                          </button>
                                          <button className="btn btn-info"
                                                  onClick={() => readInfo(res.id)}>
                                              <i className="fa fa-book" ></i>
                                          </button>
                                      </div>
                                  </td>
                              </tr>
                              </tbody>
                          </table>
                      </div>
                  ))
                  }
              </div>
          </div>
          {formActive && <OwnReservationInfo id = {formId} onClose={onClose} />}
      </div>
  )
}