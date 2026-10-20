import axios from 'axios';


const httpClient = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true
})

httpClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    config.headers.authorization = `Bearer ${token}`;
    return config;
})

/*axiosClient.interceptors.response.use((response) => {
    return response;
}, (error) => {
    try{
        const {response} = error;
        if (response.status === 401) {
            localStorage.removeItem('ACCESS_TOKEN');
        }
    } catch(e) {
        console.error(e.response.message);
    }

    throw error;
})*/

export default httpClient;