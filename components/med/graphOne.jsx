import React, { useEffect, useState } from "react";
import { Box, Spinner } from "@chakra-ui/react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { getApiBaseUrl } from "../../utils/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

function GraphOne() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const api = getApiBaseUrl();

  useEffect(() => {
    // Берём только последние 30 записей для графика — не нужно грузить всё
    fetch(`${api}/cashbox?page=1&limit=30`)
      .then((res) => res.json())
      .then((result) => {
        // После наших изменений бэкенд возвращает { data, total, page }
        const records = Array.isArray(result) ? result : result.data || [];
        // Разворачиваем — бэкенд отдаёт DESC, для графика нужен хронологический порядок
        setData([...records].reverse());
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching cashbox:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner size="xl" />;

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
    });
  };

  const gradientFill = (context, color) => {
    const { ctx, chartArea } = context.chart;
    if (!chartArea) return null;
    const gradient = ctx.createLinearGradient(
      0,
      chartArea.top,
      0,
      chartArea.bottom,
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, "rgba(0, 50, 150, 0.3)");
    gradient.addColorStop(1, "rgba(0, 50, 150, 0)");
    return gradient;
  };

  const chartData = {
    // Используем createdAt — поле которое реально существует в Cashbox
    labels: data.map((item) => formatDate(item.createdAt || item.date)),
    datasets: [
      {
        label: "Оплачено",
        // paidAmount — реальное поле из модели Cashbox
        data: data.map((item) => item.paidAmount || item.sum || 0),
        borderColor: "#0033AA",
        backgroundColor: (ctx) => gradientFill(ctx, "rgba(0, 50, 150, 0.9)"),
        borderWidth: 4,
        pointRadius: 8,
        pointBackgroundColor: "#00A3FF",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: "Долг",
        data: data.map((item) => item.debtAmount || item.debt || 0),
        borderColor: "#FF0000",
        backgroundColor: (ctx) => gradientFill(ctx, "rgba(255, 0, 0, 0.6)"),
        borderWidth: 3,
        pointRadius: 6,
        pointBackgroundColor: "#FF4C4C",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: { color: "#333", font: { size: 18, weight: "bold" } },
      },
      title: {
        display: true,
        text: "Статистика кассы (последние 30 операций)",
        color: "#333",
        font: { size: 22, weight: "bold" },
      },
      tooltip: {
        backgroundColor: "rgba(255,255,255,0.9)",
        titleColor: "#000",
        bodyColor: "#000",
        callbacks: {
          label: (ctx) =>
            `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} сум`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(0,0,0,0.1)" },
        ticks: { color: "#555", font: { size: 12 } },
      },
      y: {
        grid: { color: "rgba(0,0,0,0.1)" },
        ticks: {
          color: "#555",
          font: { size: 12 },
          callback: (val) => val.toLocaleString(),
        },
      },
    },
  };

  return (
    <Box p={8} boxShadow="xl" borderRadius="xl" bg="white">
      <Line data={chartData} options={options} />
    </Box>
  );
}

export default GraphOne;
