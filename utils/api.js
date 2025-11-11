export function getApiBaseUrl() {
  // Если определен переменная окружения, используем её
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Для продакшена
  if (process.env.NODE_ENV === "production") {
    return "https://your-production-domain.com:4000";
  }

  // Для разработки
  return "http://localhost:4000";
}
