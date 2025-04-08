import axios from "axios";

const API = axios.create({
    baseURL: "https://nasiya.takedaservice.uz/api",
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response && err.response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

export default API;
