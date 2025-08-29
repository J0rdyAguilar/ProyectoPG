import axios from "axios";
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const auth = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || localStorage.getItem("userToken")}`,
  Accept: "application/json",
});

export async function getDashboard() {
  const { data } = await axios.get(`${API}/api/dashboard`, { headers: auth() });
  return data;
}
