import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3004/api", // backend URL
});

export const createPayment = (data) => api.post("/alfa/create-payment", data);

export const confirmPayment = (data) => api.post("/alfa/confirm-payment", data);
                                                                        