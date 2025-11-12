export function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    console.log(host);
    return `http://${host}:4000`;
  }

  return "http://localhost:4000";
}
