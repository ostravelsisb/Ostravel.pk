import axios from "axios";

const api = axios.create({
  baseURL: "https://alfalahpayemnt-production.up.railway.app/api", // Deployed backend (same as insurance payment)
});

export const createPayment = (data) => api.post("/alfa/create-payment", data);

export const confirmPayment = (data) => api.post("/alfa/confirm-payment", data);