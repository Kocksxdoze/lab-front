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

function GraphTwo() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const api = getApiBaseUrl();

  useEffect(() => {
    // Берём последние 60 записей — достаточно для графика за месяц
    fetch(`${api}/clients?page=1&limit=60`)
      .then((res) => res.json())
      .then((result) => {
        // После наших изменений бэкенд возвращает { data, total, page }
        const all = Array.isArray(result) ? result : result.data || [];

        // Фильтруем за последний месяц прямо на фронте (данных уже мало)
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const recent = all
          .filter((c) => new Date(c.createdAt) >= oneMonthAgo)
          .reverse(); // хронологический порядок для графика

        setClients(recent);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching clients:", error);
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

  // Группируем по датам — один столбец на день, а не на каждого клиента
  const groupedByDate = clients.reduce((acc, client) => {
    const date = formatDate(client.createdAt);
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(groupedByDate),
    datasets: [
      {
        label: "Новые пациенты",
        data: Object.values(groupedByDate),
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
        text: "Новые пациенты за последний месяц",
        color: "#333",
        font: { size: 22, weight: "bold" },
      },
      tooltip: {
        backgroundColor: "rgba(255,255,255,0.9)",
        titleColor: "#000",
        bodyColor: "#000",
        callbacks: {
          label: (ctx) => `Пациентов: ${ctx.parsed.y}`,
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
        ticks: { color: "#555", font: { size: 12 }, stepSize: 1 },
      },
    },
  };

  return (
    <Box p={8} boxShadow="xl" borderRadius="xl" bg="white">
      <Line data={chartData} options={options} />
    </Box>
  );
}

export default GraphTwo;
