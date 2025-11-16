import React, { useEffect, useState } from "react";
import {
  Box,
  Spinner,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
import { getApiBaseUrl } from "../../utils/api";

function GraphOne() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const api = getApiBaseUrl();
  useEffect(() => {
    fetch(`${api}/cashbox`)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Spinner size="xl" />;
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const gradientFill = (context, color) => {
    const chart = context.chart;
    const { ctx, chartArea } = chart;
    if (!chartArea) {
      return null;
    }
    const gradient = ctx.createLinearGradient(
      0,
      chartArea.top,
      0,
      chartArea.bottom
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, "rgba(0, 50, 150, 0.3)");
    gradient.addColorStop(1, "rgba(0, 50, 150, 0)");
    return gradient;
  };

  const chartData = {
    labels: data.map((item) => formatDate(item.date)),
    datasets: [
      {
        label: "Прибыль",
        data: data.map((item) => item.sum),
        borderColor: "#0033AA",
        backgroundColor: (context) =>
          gradientFill(context, "rgba(0, 50, 150, 0.9)"),
        borderWidth: 4,
        pointRadius: 8,
        pointBackgroundColor: "#00A3FF",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: "Долги",
        data: data.map((item) => item.debt ?? 0),
        borderColor: "#FF0000",
        backgroundColor: (context) =>
          gradientFill(context, "rgba(255, 0, 0, 0.6)"),
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
        text: "Статистика кассы",
        color: "#333",
        font: { size: 22, weight: "bold" },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#000",
        bodyColor: "#000",
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(0, 0, 0, 0.1)" },
        ticks: { color: "#555", font: { size: 14, weight: "bold" } },
      },
      y: {
        grid: { color: "rgba(0, 0, 0, 0.1)" },
        ticks: { color: "#555", font: { size: 14, weight: "bold" } },
      },
    },
  };

  return (
    <Box p={8} boxShadow="xl" borderRadius="xl" bg="white">
      <Line data={chartData} options={options} />
      <TableContainer mt={6}>
        <Table
          variant="striped"
          colorScheme="blue"
          boxShadow="lg"
          borderRadius="xl"
        >
          <Thead bg="blue.500">
            <Tr>
              <Th color="white" fontSize="lg">
                Дата
              </Th>
              <Th color="#fff" fontSize="lg">
                Сумма
              </Th>
              <Th color="white" fontSize="lg">
                Долг
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((item, index) => (
              <Tr key={index} _hover={{ bg: "blue.100" }}>
                <Td
                  fontSize="md"
                  fontWeight="bold"
                  color="black"
                  borderBottom="2px solid #0033AA"
                >
                  {formatDate(item.date)}
                </Td>
                <Td
                  fontSize="md"
                  fontWeight="bold"
                  color="#000"
                  borderBottom="2px solid #0033AA"
                >
                  {item.sum.toLocaleString()}
                </Td>
                <Td
                  fontSize="md"
                  fontWeight="bold"
                  color="red.600"
                  borderBottom="2px solid #AA0000"
                >
                  {(item.debt ?? 0).toLocaleString()}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default GraphOne;
