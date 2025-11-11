import { getApiBaseUrl } from "./api";
const api = getApiBaseUrl();

export default async function fetcher(url) {
  const response = await fetch(`${api}/${url}`);
  const data = await response.json();
  return data;
}
