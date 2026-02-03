import {useContext, useEffect, useState} from "react";
import httpClient from "../../../axios-client";
import {data} from "react-router-dom";
import Userform from "./userform";

export default function Users(){

    const [users, setUsers] = useState([{}]);
    let [loading, setLoading] = useState(false);
    let [err, setErr] = useState(null);
    let [parameters, setParameters] = useState({
        name: '',
        role: 'all'
    })

    // modal control
    const [formActive, setFormActive] = useState(false);
    const [formId, setFormId] = useState(null);
    const [formOperation, setFormOperation] = useState("");

    useEffect(() => {
        getUsers();
        console.log("Fetched users: ");
        console.log(users);
    }, [parameters]);

    const getUsers = () => {
        setLoading(true)
        httpClient.get("users",  { params: parameters }).then(
            ({data}) => {
                //let {name, email, birth, role} = data;
                console.log(data.data);
                setErr(null)
                setLoading(false)
                setUsers(data.data);
            }
        )
            .catch((err) => {
                alert("Szerver hiba!");
                setErr(err)
                setLoading(false)
            })
    }

    const removeUser = (id) => {
        console.log(`users/${id}`);
        httpClient.delete(`users/${id}`).then(
            () => {
                getUsers();
            }
        )
    }

    const openEdit = (id, operation) => { setFormId(id); setFormOperation(operation); setFormActive(true); };
    const closeEdit = () => {setFormActive(false); setFormOperation(""); };

    // called by child after successful save
    const handleSaved = () => {
        setFormActive(false);
        getUsers(); // refresh list
        setFormOperation("");
    };

    return (
      <div className="container py-3">
          {/* Filters card */}
          <div className="card shadow-sm mb-3">
              <div className="card-body">
                  <div className="row g-3 align-items-center justify-content-between">
                      {/* Search */}
                      <div className="col-12 col-lg-4">
                          <div className="input-group col-12 col-lg-4">
                              <input
                                  type="search"
                                  id="user-search"
                                  className="form-control"
                                  placeholder="Keresés név vagy email szerint…"
                                  aria-label="Keresés"
                                  onChange={(e) =>
                                      setParameters((prev) => ({ ...prev, name: e.target.value }))
                                  }
                              />
                              <button type="button" className="btn btn-primary"
                                      onClick={() => getUsers()}
                              >
                                  <i className="fa fa-search" aria-hidden="true"></i>
                                  {/* or Bootstrap Icons: <i className="bi bi-search"></i> */}
                              </button>
                          </div>
                      </div>


                      {/* Role radios */}
                      <div className="col-6 col-lg-6">
                          <div className="d-flex flex-wrap gap-3 justify-content-lg-end">
                              <div className="form-check form-check-inline">
                                  <input
                                      className="form-check-input"
                                      type="radio"
                                      name="role"
                                      id="role-all"
                                      value="all"
                                      onChange={(e) =>
                                          {setParameters((prev) => ({ ...prev, role: "all" }));}
                                      }
                                  />
                                  <label className="form-check-label" htmlFor="role-all">Összes</label>
                              </div>

                              <div className="form-check form-check-inline">
                                  <input
                                      className="form-check-input"
                                      type="radio"
                                      name="role"
                                      id="role-user"
                                      value="ROLE_User"
                                      onChange={(e) =>
                                          {setParameters((prev) => ({ ...prev, role: "ROLE_User" }))}
                                      }
                                  />
                                  <label className="form-check-label" htmlFor="role-user">Látogató</label>
                              </div>

                              <div className="form-check form-check-inline">
                                  <input
                                      className="form-check-input"
                                      type="radio"
                                      name="role"
                                      id="role-admin"
                                      value="ROLE_Admin"
                                      onChange={(e) =>
                                          {setParameters((prev) => ({ ...prev, role: "ROLE_Admin" }))}
                                      }
                                  />
                                  <label className="form-check-label" htmlFor="role-admin">Admin</label>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Title */}
          <h1 className="h3 mb-3 mx-4">Felhasználók</h1>

          {/* Table card */}
          <div className="card shadow-sm">
              <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                      <tr>
                          <th className="text-center">Név</th>
                          <th className="text-center">Email</th>
                          <th className="text-center">Szül. dátum</th>
                          <th className="text-center">Műveletek</th>
                      </tr>
                      </thead>
                      <tbody>
                      {loading &&
                          <tr>
                              <td colSpan={4}>
                                  <div className="loading-div">
                                      <a className="loading-title">Loading...</a>
                                      <div className="loading-box">
                                          <div className="loading-line">

                                          </div>
                                      </div>
                                  </div>
                              </td>
                          </tr>
                      }

                       {!err && !loading && users?.map(u => (
                         <tr>
                          <td className="text-center">{u.name}</td>
                          <td className="text-center">{u.email}</td>
                          <td className="text-center">{u.birth}</td>
                          <td className="text-center">
                           <div className="btn-group-sm d-flex gap-2 justify-content-center">
                              <button className="btn btn-danger"
                                      onClick={() => removeUser(u.id)}>
                                 <i className="fa fa-trash" ></i>
                              </button>
                              <button
                                  className="btn btn-warning"
                                  onClick={() => openEdit(u.id, "update")}>
                                  <i className="fa fa-pencil" ></i>
                              </button>
                              <button
                                 className="btn btn-success"
                                 onClick={() => openEdit(null, "add")}>
                                 <i className="fa fa-user-plus" ></i>
                              </button>
                           </div>
                          </td>
                         </tr>
                        ))
                       }
                      </tbody>
                  </table>
                  {/* conditional render of the child modal */}
                  {formActive && (
                      <Userform
                          id={formId}
                          operation={formOperation}
                          onClose={closeEdit}
                          onSaved={handleSaved}
                      />
                  )}
              </div>
          </div>

          <div className="container d-flex justify-content-lg-end p-4">
              <button className="btn btn-success btn-block"
                      onClick={() => openEdit(null, "add")}>
                  Hozzáadás</button>
          </div>
      </div>
    );
}