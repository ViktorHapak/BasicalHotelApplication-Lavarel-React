import {useForm, useWatch} from "react-hook-form";
import {useEffect, useState} from "react";
import httpClient from "../../../../axios-client";
import {useStateContext} from "../../../../ContextProvider";

export default function ReservationForm({id, onClose, onSaved}) {

  const {setNotification, user} = useStateContext();
  const [room, setRoom] = useState({});
  const [sum, setSum] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error_response, setErrorResponse] = useState({
        message: null,
        status: false
  })

    const {
        register,
        watch,
        getValues,
        formState: { errors, touchedFields },
    } = useForm({ mode: 'onTouched', reValidateMode: 'onChange' });

    const days = watch("days", 0);

    const dayRules = {
          required: 'Kötelező egész érték!',
          valueAsNumber: true,
          min: { value: 1, message: "Minimum érték: 1 nap" },
          max: { value: 30, message: "Maximum érték: 30 nap" },
          validate: (v) => Number.isInteger(v) || "Kötelező egész érték!"
    }

    function enable(){
        const daysOk = !errors.days && touchedFields.days;
        return (daysOk);
    }

  useEffect(() => {
      console.log(id);
      getRoom();
      console.log(room)
  }, [id]);

  useEffect(() => {
      if(days>30 || days<1) setSum(0)
      else setSum((Number(days) || 0) * Number(room.price || 0));
  }, [days, room.price])

  const getRoom = () => {
      setLoading(true);
      httpClient.get(`rooms/${id}`).then(({data}) => {
          setErrorResponse(null);
          setRoom(data.data);
          console.log("Requested room:");
          console.log(data.data)
          setLoading(false)
      }).catch((err) => {
          setLoading(false);
          alert("Szerver hiba!");
      })
  }

  const onSubmit = (e) => {
      e.preventDefault();
      const {days, room_number, user} = getValues();
      const payload = {"days": days, "room": room.room_number, "user": user};
      console.log(payload)
      httpClient.post('reservations', payload).then(({data}) => {
          setErrorResponse({message: null, status: false})
          setNotification(("Rendelés leadva: " + `\n ${data.id}`))
          onSaved();
      }).catch((err) => {
          const response = err.response;
          if (response && response.status === 422) {
              const apiErrors = response.data.errors;
              setErrorResponse({message:response.data.errors, status: true});
          } else {
              setErrorResponse({ message: 'Szerver hiba!' , status: true})
              console.log(err.response);
          }
      })
  }

  return (
      <div className="fade-background d-flex justify-content-center align-items-center min-vh-100">
          <div className="reservationform-container container card shadow-sm col-6 p-0 bg-light">
            <form noValidate={true} onSubmit={onSubmit}>
              <div className="card-header d-flex justify-content-between align-items-center">
                  <h1 className="title text-muted">Szoba foglalása</h1>
                  <button className="btn btn-outline-danger align-content-start btn-sm"
                          onClick={onClose}>X</button>
              </div>
                {loading &&
                    <div className="loading-div">
                        <a className="loading-title">Loading...</a>
                        <div className="loading-box">
                            <div className="loading-line">

                            </div>
                        </div>
                    </div>
                }
                {!loading && (
                  <div className="card-body d-block overflow-y-auto bg-white">
                     <div className="row g-3 justify-content-center mx-3 mt-2">
                      <div className="col-md-6 d-flex justify-content-center">
                          <div className="input-group w-100">
                              <label className="bg-primary text-white py-1 px-2 w-50">Szoba:</label>
                              <input className="w-50 text-end px-2" type="text" disabled={true}
                                     value={room.room_number} {...register('room_number')}/>
                          </div>
                      </div>
                      <div className="col-md-6 d-flex justify-content-center">
                          <div className="input-group w-100">
                              <label className="bg-primary text-white py-1 px-2 w-50">Felhasználó:</label>
                              <input className="w-50 text-end px-2" type="text" disabled={true}
                                     value={user} {...register('user')}/>
                          </div>
                      </div>
                     </div>
                     <div className="row g-3 justify-content-center mx-3 mt-2">
                        <div className="col-md-6">
                          <div className="input-group w-100">
                              <label className="bg-primary text-white py-1 px-2 w-50">Ár:</label>
                              <input className="w-50 text-end" type="number" disabled={true} value={room.price}/>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group w-100">
                              <label className="bg-primary text-white py-1 px-2 w-50">Napok száma:</label>
                              <input className="w-50 text-end" type="number"
                                     {...register('days',
                                         dayRules)}/>
                          </div>
                          {touchedFields.days && errors.days &&
                              <small style={{color: 'red', whiteSpace: 'pre-line'}}
                                     className="invalid-feedback d-block text-center">{errors.days.message}</small>
                          }
                        </div>
                     </div>
                     <div className="row g-3 justify-content-center mx-3 mt-2">
                         <div className="col-md-6 d-flex justify-content-center">
                             <div className="input-group w-100">
                                 <label className="bg-primary text-white py-1 px-2 w-50">Összeg:</label>
                                 <input className="w-50 text-end px-2" type="text" disabled={true} value={`${sum} Ft`} readOnly/>
                             </div>
                         </div>
                     </div>
                  </div>
                )}
              <button className="btn btn-success btn-lg w-75 d-block mx-auto mt-4 mb-4" type="submit"
                        disabled={!enable()}>
                    Művelet</button>
            </form>
          </div>
      </div>
  )
}