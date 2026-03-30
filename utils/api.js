export function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    console.log(host);
    return `http://${host}:4000`;
  }

  return "https://punk-regulation-introduced-tourism.trycloudflare.com";
}
