import { getApiBaseUrl } from "./api";
const api = getApiBaseUrl();
const fetchClients = async () => {
  const response = await fetch(`${api}/clients`);
  const data = await response.json();
  return data;
};

export default fetchClients;
