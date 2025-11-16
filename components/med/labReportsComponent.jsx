"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Text,
  Heading,
  Button,
  Select,
  Stack,
  Grid,
  GridItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
} from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";
import { getApiBaseUrl } from "../../utils/api";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function ReportsPage() {
  const [reportType, setReportType] = useState("general");
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();
  const api = getApiBaseUrl();

  useEffect(() => {
    loadReportData();
  }, [reportType, period]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${api}/report/generate?type=${reportType}&period=${period}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Report data loaded:", data);
      setReportData(data);
    } catch (err) {
      console.error("Error loading report:", err);
      setError(err.message || "Ошибка загрузки отчета");
      toast({
        title: "Ошибка",
        description: err.message || "Ошибка загрузки отчета",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    toast({
      title: "В разработке",
      description: "Функция экспорта в PDF скоро будет доступна",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  if (loading) {
    return (
      <Flex align="center" justify="center" minH="400px" w="100%">
        <Stack align="center" spacing={4}>
          <Spinner size="xl" />
          <Text>Загрузка отчета...</Text>
        </Stack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex align="center" justify="center" minH="400px" w="100%">
        <Card maxW="md" w="full">
          <CardHeader>
            <Heading size="md" color="red.600">
              Ошибка
            </Heading>
          </CardHeader>
          <CardBody>
            <Text mb={4}>{error}</Text>
            <Button onClick={loadReportData} colorScheme="blue">
              Попробовать снова
            </Button>
          </CardBody>
        </Card>
      </Flex>
    );
  }

  return (
    <Box
      maxW="container.xl"
      w="100%"
      mx="auto"
      p={6}
      bg="white"
      borderRadius="16px"
      boxShadow="lg"
      overflow="hidden"
    >
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="2xl" mb={2}>
            Отчеты и Аналитика
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Комплексная аналитика работы клиники
          </Text>
        </Box>
        <Stack direction="row" spacing={4}>
          <Button
            variant="outline"
            onClick={loadReportData}
            leftIcon={<RefreshCw size={16} />}
          >
            Обновить
          </Button>
          <Button
            onClick={handleDownloadPDF}
            leftIcon={<Download size={16} />}
            colorScheme="blue"
          >
            Экспорт PDF
          </Button>
        </Stack>
      </Flex>

      {/* Filters */}
      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Параметры отчета</Heading>
        </CardHeader>
        <CardBody>
          <Stack direction={{ base: "column", md: "row" }} spacing={4}>
            <Box flex={1}>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Тип отчета
              </Text>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="general">Общий отчет</option>
                <option value="patients">Пациенты</option>
                <option value="cashbox">Касса</option>
                <option value="laboratory">Лаборатория</option>
                <option value="doctors">Врачи</option>
              </Select>
            </Box>

            <Box flex={1}>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Период
              </Text>
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="today">Сегодня</option>
                <option value="yesterday">Вчера</option>
                <option value="week">Неделя</option>
                <option value="month">Месяц</option>
                <option value="quarter">Квартал</option>
                <option value="year">Год</option>
              </Select>
            </Box>
          </Stack>
        </CardBody>
      </Card>

      {/* Report Content */}
      {reportData && (
        <Box maxH="calc(100vh - 400px)" overflowY="auto">
          {reportType === "general" && <GeneralReport data={reportData.data} />}
          {reportType === "patients" && (
            <PatientsReport data={reportData.data} />
          )}
          {reportType === "cashbox" && <CashboxReport data={reportData.data} />}
          {reportType === "laboratory" && (
            <LaboratoryReport data={reportData.data} />
          )}
          {reportType === "doctors" && <DoctorsReport data={reportData.data} />}
        </Box>
      )}
    </Box>
  );
}

// ============================================
// PATIENTS REPORT COMPONENT
// ============================================
function PatientsReport({ data }) {
  if (!data || !data.summary) {
    return (
      <Card>
        <CardBody>
          <Text color="gray.500">Нет данных для отображения</Text>
        </CardBody>
      </Card>
    );
  }

  const { summary, demographics, registrators } = data;

  return (
    <Stack spacing={6}>
      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        <Card>
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel>Всего пациентов</StatLabel>
                  <StatNumber>{summary.total || 0}</StatNumber>
                </Box>
                <Icon as={Users} boxSize={6} color="gray.400" />
              </Flex>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel>Новые (месяц)</StatLabel>
                  <StatNumber>{summary.new || 0}</StatNumber>
                </Box>
                <Icon as={TrendingUp} boxSize={6} color="gray.400" />
              </Flex>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel>С задолженностью</StatLabel>
                  <StatNumber>{summary.withDebt || 0}</StatNumber>
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel>Общий долг</StatLabel>
                  <StatNumber>
                    {(summary.totalDebt || 0).toLocaleString()} UZS
                  </StatNumber>
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Charts */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {/* Gender Distribution */}
        {demographics?.byGender && demographics.byGender.length > 0 && (
          <Card>
            <CardHeader>
              <Heading size="md">Распределение по полу</Heading>
            </CardHeader>
            <CardBody>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demographics.byGender}
                      dataKey="count"
                      nameKey="sex"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {demographics.byGender.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        )}

        {/* Top Registrators */}
        {registrators && registrators.length > 0 && (
          <Card>
            <CardHeader>
              <Heading size="md">ТОП регистраторов</Heading>
            </CardHeader>
            <CardBody>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={registrators.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="registrator" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        )}
      </SimpleGrid>
    </Stack>
  );
}

// ============================================
// CASHBOX REPORT COMPONENT
// ============================================
function CashboxReport({ data }) {
  if (!data || !data.summary) {
    return (
      <Card>
        <CardBody>
          <Text color="gray.500">Нет данных для отображения</Text>
        </CardBody>
      </Card>
    );
  }

  const { summary, byStatus, byPaymentMethod, dailyRevenue } = data;

  return (
    <Stack spacing={6}>
      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 6 }} spacing={4}>
        <Card>
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel>Транзакций</StatLabel>
                  <StatNumber>{summary.totalTransactions || 0}</StatNumber>
                </Box>
                <Icon as={FileText} boxSize={6} color="gray.400" />
              </Flex>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel>Общая сумма</StatLabel>
                  <StatNumber>
                    {(summary.totalAmount || 0).toLocaleString()} UZS
                  </StatNumber>
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel>Выручка</StatLabel>
                  <StatNumber>
                    {(summary.revenue || 0).toLocaleString()} UZS
                  </StatNumber>
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel>Скидки</StatLabel>
                  <StatNumber>
                    {(summary.totalDiscount || 0).toLocaleString()} UZS
                  </StatNumber>
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel>Долг</StatLabel>
                  <StatNumber>
                    {(summary.totalDebt || 0).toLocaleString()} UZS
                  </StatNumber>
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel>Средний чек</StatLabel>
                  <StatNumber>
                    {(summary.averageCheck || 0).toLocaleString()} UZS
                  </StatNumber>
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Charts */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {/* By Status */}
        {byStatus && byStatus.length > 0 && (
          <Card>
            <CardHeader>
              <Heading size="md">По статусам оплаты</Heading>
            </CardHeader>
            <CardBody>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `${value.toLocaleString()} UZS`,
                        "Сумма",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="totalPaid" fill="#0088FE" name="Оплачено" />
                    <Bar dataKey="totalDebt" fill="#FF8042" name="Долг" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        )}

        {/* By Payment Method */}
        {byPaymentMethod && byPaymentMethod.length > 0 && (
          <Card>
            <CardHeader>
              <Heading size="md">По способам оплаты</Heading>
            </CardHeader>
            <CardBody>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byPaymentMethod}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="paymentMethod" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `${value.toLocaleString()} UZS`,
                        "Сумма",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="totalPaid" fill="#00C49F" name="Оплачено" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        )}
      </SimpleGrid>

      {/* Daily Revenue Chart */}
      {dailyRevenue && dailyRevenue.length > 0 && (
        <Card>
          <CardHeader>
            <Heading size="md">Динамика выручки (30 дней)</Heading>
          </CardHeader>
          <CardBody>
            <Box height="300px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [
                      `${value.toLocaleString()} UZS`,
                      "Выручка",
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    name="Выручка"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>
      )}
    </Stack>
  );
}

// ============================================
// LABORATORY REPORT COMPONENT - ДОБАВЛЕННЫЙ
// ============================================
function LaboratoryReport({ data }) {
  if (!data || !data.summary) {
    return (
      <Card>
        <CardBody>
          <Text color="gray.500">Нет данных для отображения</Text>
        </CardBody>
      </Card>
    );
  }

  const { summary, byTestType, byDoctor } = data;

  return (
    <Stack spacing={6}>
      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        <Card>
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel>Всего анализов</StatLabel>
                  <StatNumber>{summary.total || 0}</StatNumber>
                </Box>
                <Icon as={FileText} boxSize={6} color="gray.400" />
              </Flex>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel>Завершено</StatLabel>
                  <StatNumber>{summary.completed || 0}</StatNumber>
                  <StatHelpText>
                    {summary.completionRate || 0}% завершения
                  </StatHelpText>
                </Box>
                <Icon as={TrendingUp} boxSize={6} color="gray.400" />
              </Flex>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel>В работе</StatLabel>
                  <StatNumber>{summary.pending || 0}</StatNumber>
                </Box>
                <Icon as={Calendar} boxSize={6} color="gray.400" />
              </Flex>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel>С отклонениями</StatLabel>
                  <StatNumber>{summary.abnormal || 0}</StatNumber>
                  <StatHelpText>
                    {summary.abnormalRate || 0}% от завершенных
                  </StatHelpText>
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Charts */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {/* Top Tests */}
        {byTestType && byTestType.length > 0 && (
          <Card>
            <CardHeader>
              <Heading size="md">ТОП-10 анализов</Heading>
            </CardHeader>
            <CardBody>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byTestType.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="testCode" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        )}

        {/* Doctors Performance */}
        {byDoctor && byDoctor.length > 0 && (
          <Card>
            <CardHeader>
              <Heading size="md">Производительность врачей</Heading>
            </CardHeader>
            <CardBody>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byDoctor.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="executedBy" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#82ca9d" name="Анализов" />
                    <Bar
                      dataKey="abnormalCount"
                      fill="#ff8042"
                      name="С отклонениями"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        )}
      </SimpleGrid>
    </Stack>
  );
}

// ============================================
// DOCTORS REPORT COMPONENT
// ============================================
function DoctorsReport({ data }) {
  if (!data || !data.doctorPerformance) {
    return (
      <Card>
        <CardBody>
          <Text color="gray.500">Нет данных для отображения</Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Stack spacing={6}>
      <Card>
        <CardHeader>
          <Heading size="md">Производительность врачей</Heading>
          <Text color="gray.600">Выполненные анализы и отклонения</Text>
        </CardHeader>
        <CardBody>
          <Box height="400px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.doctorPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="executedBy" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="testsCompleted"
                  fill="#8884d8"
                  name="Анализов выполнено"
                />
                <Bar
                  dataKey="abnormalTests"
                  fill="#ff8042"
                  name="С отклонениями"
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardBody>
      </Card>
    </Stack>
  );
}

// ============================================
// GENERAL REPORT COMPONENT
// ============================================
function GeneralReport({ data }) {
  if (!data) {
    return (
      <Card>
        <CardBody>
          <Text color="gray.500">Нет данных для отображения</Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Tabs>
      <TabList>
        <Tab>Пациенты</Tab>
        <Tab>Касса</Tab>
        <Tab>Лаборатория</Tab>
        <Tab>Врачи</Tab>
      </TabList>

      <TabPanels>
        <TabPanel px={0}>
          {data.patients ? (
            <PatientsReport data={data.patients} />
          ) : (
            <Card>
              <CardBody>
                <Text color="gray.500">
                  {data.patients?.error || "Нет данных о пациентах"}
                </Text>
              </CardBody>
            </Card>
          )}
        </TabPanel>

        <TabPanel px={0}>
          {data.cashbox ? (
            <CashboxReport data={data.cashbox} />
          ) : (
            <Card>
              <CardBody>
                <Text color="gray.500">
                  {data.cashbox?.error || "Нет данных о кассе"}
                </Text>
              </CardBody>
            </Card>
          )}
        </TabPanel>

        <TabPanel px={0}>
          {data.laboratory ? (
            <LaboratoryReport data={data.laboratory} />
          ) : (
            <Card>
              <CardBody>
                <Text color="gray.500">
                  {data.laboratory?.error || "Нет данных о лаборатории"}
                </Text>
              </CardBody>
            </Card>
          )}
        </TabPanel>

        <TabPanel px={0}>
          {data.doctors ? (
            <DoctorsReport data={data.doctors} />
          ) : (
            <Card>
              <CardBody>
                <Text color="gray.500">
                  {data.doctors?.error || "Нет данных о врачах"}
                </Text>
              </CardBody>
            </Card>
          )}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
