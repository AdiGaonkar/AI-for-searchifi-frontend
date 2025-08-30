import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: "https://backendfor-ai-thesearchifi.onrender.com",  // your backend link
    headers: {
        "Authorization": `Bearer ${localStorage.getItem('token')}`
    }
});

export default axiosInstance;
