import {useStateContext} from "../../../../ContextProvider";
import {useState} from "react";
import httpClient from "../../../../axios-client";
import {useForm} from "react-hook-form";

export default function RoomForm({onClose, onSaved }){

    const {setNotification} = useStateContext();
    const [room, setRoom] = useState(null);
    const [error_response, setErrorResponse] = useState({
        message: null,
        status: false
    })

    let {
        register,
        getValues,
        formState: { errors, touchedFields },
    } = useForm({ mode: 'onTouched', reValidateMode: 'onChange' });

    // React Hook Form validation rules (client mirrors server)
    const floorRules = {
        required: "Kötelező egész érték!",
        valueAsNumber: true,
        min: { value: 1, message: "Minimum érték: 1" },
        max: { value: 100, message: "Maximum érték: 100" },
        validate: (v) => Number.isInteger(v) || "Kötelező egész érték!",
    };

    const serialNumberRules = {
        required: "Kötelező egész érték!",
        valueAsNumber: true,
        min: { value: 1, message: "Minimum érték: 1" }, // szerver csak integer-t kér, de ez életszerű
        validate: (v) => Number.isInteger(v) || "Kötelező egész érték!",
    };

    const priceRules = {
        required: "Kötelező mező!",
        valueAsNumber: true,
        min: { value: 1, message: "Minimum érték: 1" },
        max: { value: 1_000_000, message: "Maximum érték: 1 000 000" },
        validate: (v) => Number.isInteger(v) || "Csak egész szám lehet",
    };

    function enable(){
        const floorOk = !errors.floor && touchedFields.floor;
        const serialNumberOk = !errors.serial_number && touchedFields.serial_number;
        const priceOk = !errors.price_ok && touchedFields.price;

        return (floorOk && serialNumberOk && priceOk);
    }

    const onSubmit = (e) => {
        e.preventDefault();
        const payload = getValues();
        console.log(payload)
        httpClient.post(`/rooms`, payload)
            .then(({data}) => {
                setErrorResponse({message: null, status: null})
                setNotification(("Új szoba hozzáadva: " + `\n ${data.room_number}`))
                onSaved();
            })
            .catch((err) => {
                const { response } = err || {};
                setErrorResponse({status: true})
                if (response?.status === 422) {
                    const apiMsg = response.data?.message || response.data?.errors?.serial_number?.[0]
                    errors.serial_number = {...{message: apiMsg ?? null}};
                } else {
                    setErrorResponse({ message: 'Szerver hiba!' })
                    console.log(err.response);
                }
            })

    }

  return (
      <div className="fade-background d-flex justify-content-center align-items-center min-vh-100">
          <div className="roomform-container container card shadow-sm col-6 p-0 bg-light">
              <form noValidate={true} onSubmit={onSubmit}>
                  <div className="card-header d-flex justify-content-between align-items-center">
                      <h1 className="title text-muted">Új szoba</h1>
                      <button className="btn btn-outline-danger align-content-start btn-sm"
                              onClick={onClose}>X</button>
                  </div>
                  <div className="card-body p-3 bg-light shadow-sm rounded-3">
                      <div className="input-container d-block m-2 p-2 bg-white">
                          <div className="floor-container m-3">
                              <label className="form-label">Emelet</label>
                              <input className="form-control text-bg-light "
                                     placeholder="" type="number" {...register('floor', floorRules)}
                                     onChange={(e) =>
                                     {setRoom((prev) => ({ ...prev, floor: e.target.value }))}}/>
                              {touchedFields.floor && errors.floor &&
                                  <small style={{color:'red', whiteSpace:'pre-line'}}
                                         className="invalid-feedback d-block text-center">{errors.floor.message}</small>}
                          </div>
                          <div className="floor-container m-3">
                              <label className="form-label">Szobaszám</label>
                              <input className="form-control text-bg-light "
                                     placeholder="" type="number" {...register('serial_number', serialNumberRules)}
                                     onChange={(e) =>
                                     {setRoom((prev) => ({ ...prev, serial_number: e.target.value }))}}/>
                              {touchedFields.serial_number && errors.serial_number &&
                                  <small style={{color:'red', whiteSpace:'pre-line'}}
                                         className="invalid-feedback d-block text-center">{errors.serial_number.message}</small>}
                          </div>
                          <div className="price-container m-3">
                              <label className="form-label">Ár</label>
                              <input className="form-control text-bg-light "
                                     placeholder="" type="number" {...register('price', priceRules)}
                                     onChange={(e) =>
                                     {setRoom((prev) => ({ ...prev, price: e.target.value }))}}/>
                              {touchedFields.price && errors.price &&
                                  <small style={{color:'red', whiteSpace:'pre-line'}}
                                         className="invalid-feedback d-block text-center">{errors.price.message}</small>}
                          </div>
                      </div>
                      <button className="btn btn-success btn-lg w-75 d-block mx-auto mt-4" type="submit"
                              disabled={!enable()}>
                          Létrehozás
                      </button>
                      {error_response?.message && <a className="alert alert-danger d-block mx-5 mt-3">
                          {error_response.message}
                      </a>}
                  </div>
              </form>

          </div>
      </div>
  )
}