import axios from "axios";

const apiRequest = axios.create({
  baseURL: "https://dubium-back-10apg1bp4-arthrok.vercel.app",
});

// apiRequest.defaults.headers.common['Authorization'] = "Bearer " + localStorage.getItem("token");

export default apiRequest;
