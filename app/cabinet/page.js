"use client";
import React, { useEffect, useState } from "react";
import {
  Flex,
  Box,
  Text,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  useDisclosure,
  Input,
  useToast,
  VStack,
  HStack,
  Badge,
  FormControl,
  FormLabel,
  Checkbox,
  Divider,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  CalendarIcon,
  TimeIcon,
  CheckCircleIcon,
  WarningIcon,
  SettingsIcon,
} from "@chakra-ui/icons";
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";
import { getApiBaseUrl } from "../../utils/api";
import Header from "../../components/med/header";
import Footer from "../../components/med/footer";
import ParticlesComponent from "../../components/med/particles";

function Cabinet() {
  const [user, setUser] = useState(null);
  const [labTests, setLabTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("work");
  const toast = useToast();
  const api = getApiBaseUrl();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [testResult, setTestResult] = useState({
    result: "",
    conclusion: "",
    isAbnormal: false,
    ready: false,
    method: "",
    notes: "",
  });

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwt.decode(token);
        const userData = Array.isArray(decoded) ? decoded[0] : decoded;
        setUser(userData);
        loadLabTests();
      } catch (error) {
        console.error("Ошибка декодирования токена:", error);
      }
    }
  }, []);

  const loadLabTests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/labs`);
      if (!response.ok) throw new Error("Ошибка загрузки анализов");

      const data = await response.json();

      const testsWithClients = await Promise.all(
        data.map(async (test) => {
          try {
            const clientResponse = await fetch(
              `http://localhost:4000/client/${test.clientId}`
            );
            if (clientResponse.ok) {
              const client = await clientResponse.json();
              return { ...test, client };
            }
          } catch (err) {
            console.error(`Ошибка загрузки клиента ${test.clientId}:`, err);
          }
          return test;
        })
      );

      setLabTests(testsWithClients);
    } catch (error) {
      console.error("Ошибка загрузки анализов:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список анализов",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTest = (test) => {
    setSelectedTest(test);
    setTestResult({
      result: test.result || "",
      conclusion: test.conclusion || "",
      isAbnormal: test.isAbnormal || false,
      ready: test.ready || false,
      method: test.method || "",
      notes: test.notes || "",
    });
    onOpen();
  };

  const handleSaveTest = async () => {
    if (!selectedTest) return;

    if (!testResult.result && testResult.ready) {
      toast({
        title: "Ошибка",
        description: "Укажите результат анализа",
        status: "warning",
      });
      return;
    }

    try {
      setLoading(true);

      let isAbnormal = testResult.isAbnormal;
      if (
        testResult.result &&
        selectedTest.referenceMin !== null &&
        selectedTest.referenceMax !== null
      ) {
        const numResult = parseFloat(testResult.result);
        if (!isNaN(numResult)) {
          isAbnormal =
            numResult < selectedTest.referenceMin ||
            numResult > selectedTest.referenceMax;
        }
      }

      const updateData = {
        ...testResult,
        isAbnormal,
        readyDate: testResult.ready ? new Date().toISOString() : null,
        executedBy: user ? `${user.surname} ${user.name}` : "Неизвестно",
      };

      const response = await fetch(
        `http://localhost:4000/lab/update/${selectedTest.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) throw new Error("Ошибка сохранения результатов");

      toast({
        title: "Успешно",
        description: "Результаты анализа сохранены",
        status: "success",
      });

      onClose();
      await loadLabTests();
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить результаты",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Статистика
  const pendingTests = labTests.filter((t) => !t.ready);
  const completedTests = labTests.filter((t) => t.ready);
  const abnormalTests = labTests.filter((t) => t.isAbnormal);

  const today = new Date().toISOString().split("T")[0];
  const todayTests = labTests.filter((t) => t.createdAt?.includes(today));

  const completionRate =
    labTests.length > 0 ? (completedTests.length / labTests.length) * 100 : 0;

  if (!user) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Flex flexDir="column" minH="100vh" position="relative">
      <ParticlesComponent />

      {/* Header */}
      <Box position="relative" zIndex={10} px="50px">
        <Header />
      </Box>

      {/* Main Content */}
      <Box
        flex="1"
        position="relative"
        zIndex={5}
        px="50px"
        py={8}
        display="flex"
        justifyContent="center"
        alignItems="flex-start"
        minH="calc(100vh - 160px)" // Вычитаем примерную высоту header и footer
      >
        <Box w="full" maxW="1400px">
          {/* Профиль доктора */}
          <Card mb={8} shadow="lg" borderRadius="2xl" w="full">
            <CardBody p={6}>
              <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={8}>
                {/* Боковая панель профиля */}
                <Card bg="blue.50" borderRadius="xl" p={6}>
                  <VStack spacing={6} align="center">
                    <Avatar
                      size="2xl"
                      name={`${user.name} ${user.surname}`}
                      bg="blue.500"
                      color="white"
                    />
                    <VStack spacing={2} textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold">
                        {user.name} {user.surname}
                      </Text>
                      <Text color="blue.600" fontWeight="medium">
                        {user.profession || "Врач-лаборант"}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        ID: {user.id}
                      </Text>
                    </VStack>

                    <Divider />

                    <VStack spacing={3} w="100%">
                      <Stat textAlign="center">
                        <StatLabel>Стаж работы</StatLabel>
                        <StatNumber>5 лет</StatNumber>
                      </Stat>

                      <Stat textAlign="center">
                        <StatLabel>Специализация</StatLabel>
                        <StatNumber fontSize="md">
                          Лабораторная диагностика
                        </StatNumber>
                      </Stat>
                    </VStack>
                  </VStack>
                </Card>

                {/* Основная информация и статистика */}
                <Box>
                  <Flex justify="space-between" align="center" mb={6}>
                    <Text fontSize="3xl" fontWeight="bold" color="blue.700">
                      Личный кабинет
                    </Text>
                    <Menu>
                      <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                        {activeTab === "work" && "Рабочая область"}
                        {activeTab === "stats" && "Статистика"}
                        {activeTab === "profile" && "Профиль"}
                      </MenuButton>
                      <MenuList>
                        <MenuItem onClick={() => setActiveTab("work")}>
                          🏥 Рабочая область
                        </MenuItem>
                        <MenuItem onClick={() => setActiveTab("stats")}>
                          📊 Статистика
                        </MenuItem>
                        <MenuItem onClick={() => setActiveTab("profile")}>
                          👤 Настройки профиля
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>

                  <Tabs
                    index={
                      activeTab === "work" ? 0 : activeTab === "stats" ? 1 : 2
                    }
                    isFitted
                  >
                    <TabList mb={6}>
                      <Tab onClick={() => setActiveTab("work")}>
                        <HStack>
                          <TimeIcon />
                          <Text>Рабочая область</Text>
                        </HStack>
                      </Tab>
                      <Tab onClick={() => setActiveTab("stats")}>
                        <HStack>
                          <CalendarIcon />
                          <Text>Статистика</Text>
                        </HStack>
                      </Tab>
                      <Tab onClick={() => setActiveTab("profile")}>
                        <HStack>
                          <SettingsIcon />
                          <Text>Профиль</Text>
                        </HStack>
                      </Tab>
                    </TabList>

                    <TabPanels>
                      {/* Панель рабочей области */}
                      <TabPanel p={0}>
                        <SimpleGrid
                          columns={{ base: 1, md: 3 }}
                          spacing={6}
                          mb={8}
                        >
                          <Card
                            bg="yellow.50"
                            borderLeft="4px"
                            borderColor="yellow.400"
                          >
                            <CardBody>
                              <Stat>
                                <StatLabel color="gray.600">В работе</StatLabel>
                                <StatNumber color="yellow.600">
                                  {pendingTests.length}
                                </StatNumber>
                                <StatHelpText>
                                  <WarningIcon mr={1} />
                                  Требуют внимания
                                </StatHelpText>
                              </Stat>
                            </CardBody>
                          </Card>

                          <Card
                            bg="green.50"
                            borderLeft="4px"
                            borderColor="green.400"
                          >
                            <CardBody>
                              <Stat>
                                <StatLabel color="gray.600">
                                  Завершено
                                </StatLabel>
                                <StatNumber color="green.600">
                                  {completedTests.length}
                                </StatNumber>
                                <StatHelpText>
                                  <CheckCircleIcon mr={1} />
                                  Готовы к выдаче
                                </StatHelpText>
                              </Stat>
                            </CardBody>
                          </Card>

                          <Card
                            bg="red.50"
                            borderLeft="4px"
                            borderColor="red.400"
                          >
                            <CardBody>
                              <Stat>
                                <StatLabel color="gray.600">
                                  Отклонения
                                </StatLabel>
                                <StatNumber color="red.600">
                                  {abnormalTests.length}
                                </StatNumber>
                                <StatHelpText>
                                  <WarningIcon mr={1} />
                                  Требуют консультации
                                </StatHelpText>
                              </Stat>
                            </CardBody>
                          </Card>
                        </SimpleGrid>

                        {/* Таблица анализов с фиксированной высотой и скроллом */}
                        <Card>
                          <CardHeader>
                            <Text fontSize="xl" fontWeight="bold">
                              Список анализов
                            </Text>
                          </CardHeader>
                          <CardBody p={0}>
                            {loading ? (
                              <Flex justify="center" py={10}>
                                <Spinner size="xl" />
                              </Flex>
                            ) : labTests.length > 0 ? (
                              <Box
                                overflowX="auto"
                                maxH="500px" // Фиксированная высота для скролла
                                overflowY="auto"
                              >
                                <Table variant="simple" size="sm">
                                  <Thead
                                    bg="gray.100"
                                    position="sticky"
                                    top={0}
                                    zIndex={1}
                                  >
                                    <Tr>
                                      <Th>ID</Th>
                                      <Th>Пациент</Th>
                                      <Th>Тест</Th>
                                      <Th>Результат</Th>
                                      <Th>Статус</Th>
                                      <Th>Дата</Th>
                                      <Th>Действия</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    {labTests.map((test) => (
                                      <Tr
                                        key={test.id}
                                        _hover={{ bg: "gray.50" }}
                                      >
                                        <Td fontWeight="bold">{test.id}</Td>
                                        <Td>
                                          <VStack align="start" spacing={0}>
                                            <Text fontWeight="medium">
                                              {test.client?.surname}{" "}
                                              {test.client?.name}
                                            </Text>
                                            <Text
                                              fontSize="xs"
                                              color="gray.600"
                                            >
                                              {test.client?.phoneNumber}
                                            </Text>
                                          </VStack>
                                        </Td>
                                        <Td>
                                          <Badge colorScheme="blue">
                                            {test.testCode}
                                          </Badge>
                                          <Text fontSize="sm">{test.name}</Text>
                                        </Td>
                                        <Td>
                                          {test.result ? (
                                            <Text
                                              fontWeight="bold"
                                              color={
                                                test.isAbnormal
                                                  ? "red.600"
                                                  : "green.600"
                                              }
                                            >
                                              {test.result} {test.unit}
                                            </Text>
                                          ) : (
                                            <Text color="gray.400">—</Text>
                                          )}
                                        </Td>
                                        <Td>
                                          {test.ready ? (
                                            <Badge colorScheme="green">
                                              Готово
                                            </Badge>
                                          ) : (
                                            <Badge colorScheme="yellow">
                                              В работе
                                            </Badge>
                                          )}
                                        </Td>
                                        <Td fontSize="xs">
                                          {new Date(
                                            test.createdAt
                                          ).toLocaleDateString("ru-RU")}
                                        </Td>
                                        <Td>
                                          <Button
                                            size="sm"
                                            colorScheme="blue"
                                            onClick={() => handleOpenTest(test)}
                                          >
                                            {test.ready
                                              ? "Просмотр"
                                              : "Заполнить"}
                                          </Button>
                                        </Td>
                                      </Tr>
                                    ))}
                                  </Tbody>
                                </Table>
                              </Box>
                            ) : (
                              <Box textAlign="center" py={10}>
                                <Text color="gray.500" fontSize="lg">
                                  Нет анализов для отображения
                                </Text>
                              </Box>
                            )}
                          </CardBody>
                        </Card>
                      </TabPanel>

                      {/* Панель статистики */}
                      <TabPanel>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <Card>
                            <CardHeader>
                              <Text fontSize="lg" fontWeight="bold">
                                Прогресс выполнения
                              </Text>
                            </CardHeader>
                            <CardBody>
                              <VStack spacing={4}>
                                <Box w="100%">
                                  <Flex justify="space-between" mb={2}>
                                    <Text fontSize="sm">
                                      Завершено анализов
                                    </Text>
                                    <Text fontSize="sm" fontWeight="bold">
                                      {completedTests.length} /{" "}
                                      {labTests.length}
                                    </Text>
                                  </Flex>
                                  <Progress
                                    value={completionRate}
                                    colorScheme="green"
                                    size="lg"
                                    borderRadius="full"
                                  />
                                </Box>
                                <SimpleGrid columns={2} spacing={4} w="100%">
                                  <Stat textAlign="center">
                                    <StatLabel>Сегодня</StatLabel>
                                    <StatNumber>{todayTests.length}</StatNumber>
                                  </Stat>
                                  <Stat textAlign="center">
                                    <StatLabel>Отклонения</StatLabel>
                                    <StatNumber color="red.600">
                                      {abnormalTests.length}
                                    </StatNumber>
                                  </Stat>
                                </SimpleGrid>
                              </VStack>
                            </CardBody>
                          </Card>

                          <Card>
                            <CardHeader>
                              <Text fontSize="lg" fontWeight="bold">
                                Распределение по статусам
                              </Text>
                            </CardHeader>
                            <CardBody>
                              <VStack spacing={3}>
                                <HStack justify="space-between" w="100%">
                                  <HStack>
                                    <Box
                                      w="3"
                                      h="3"
                                      bg="yellow.400"
                                      borderRadius="full"
                                    />
                                    <Text>В работе</Text>
                                  </HStack>
                                  <Text fontWeight="bold">
                                    {pendingTests.length}
                                  </Text>
                                </HStack>
                                <HStack justify="space-between" w="100%">
                                  <HStack>
                                    <Box
                                      w="3"
                                      h="3"
                                      bg="green.400"
                                      borderRadius="full"
                                    />
                                    <Text>Завершено</Text>
                                  </HStack>
                                  <Text fontWeight="bold">
                                    {completedTests.length}
                                  </Text>
                                </HStack>
                                <HStack justify="space-between" w="100%">
                                  <HStack>
                                    <Box
                                      w="3"
                                      h="3"
                                      bg="red.400"
                                      borderRadius="full"
                                    />
                                    <Text>С отклонениями</Text>
                                  </HStack>
                                  <Text fontWeight="bold">
                                    {abnormalTests.length}
                                  </Text>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        </SimpleGrid>
                      </TabPanel>

                      {/* Панель профиля */}
                      <TabPanel>
                        <Card>
                          <CardHeader>
                            <Text fontSize="xl" fontWeight="bold">
                              Настройки профиля
                            </Text>
                          </CardHeader>
                          <CardBody>
                            <SimpleGrid
                              columns={{ base: 1, md: 2 }}
                              spacing={6}
                            >
                              <FormControl>
                                <FormLabel>Имя</FormLabel>
                                <Input value={user.name} readOnly />
                              </FormControl>
                              <FormControl>
                                <FormLabel>Фамилия</FormLabel>
                                <Input value={user.surname} readOnly />
                              </FormControl>
                              <FormControl>
                                <FormLabel>Email</FormLabel>
                                <Input
                                  value={user.email || "Не указан"}
                                  readOnly
                                />
                              </FormControl>
                              <FormControl>
                                <FormLabel>Телефон</FormLabel>
                                <Input
                                  value={user.phoneNumber || "Не указан"}
                                  readOnly
                                />
                              </FormControl>
                            </SimpleGrid>
                          </CardBody>
                          <CardFooter>
                            <Button colorScheme="blue">
                              Редактировать профиль
                            </Button>
                          </CardFooter>
                        </Card>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </Box>
              </Grid>
            </CardBody>
          </Card>
        </Box>
      </Box>

      {/* Footer */}
      <Box position="relative" zIndex={10} px="50px" mt="auto">
        <Footer />
      </Box>

      {/* Модальное окно заполнения результатов */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Заполнение результатов анализа</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedTest && (
              <VStack align="stretch" spacing={4}>
                {/* Информация о пациенте */}
                <Card variant="outline">
                  <CardBody>
                    <Text fontWeight="bold" mb={3}>
                      Информация о пациенте
                    </Text>
                    <SimpleGrid columns={2} spacing={3}>
                      <Text fontSize="sm">
                        <strong>ФИО:</strong> {selectedTest.client?.surname}{" "}
                        {selectedTest.client?.name}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Дата рождения:</strong>{" "}
                        {selectedTest.client?.dateBirth || "—"}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Телефон:</strong>{" "}
                        {selectedTest.client?.phoneNumber || "—"}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Пол:</strong>{" "}
                        {selectedTest.client?.sex === 1
                          ? "М"
                          : selectedTest.client?.sex === 0
                          ? "Ж"
                          : "—"}
                      </Text>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Форма заполнения */}
                <FormControl isRequired={testResult.ready}>
                  <FormLabel>Результат анализа</FormLabel>
                  <Input
                    value={testResult.result}
                    onChange={(e) =>
                      setTestResult({
                        ...testResult,
                        result: e.target.value,
                      })
                    }
                    placeholder="Введите числовое значение или текст"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Метод исследования</FormLabel>
                  <Input
                    value={testResult.method}
                    onChange={(e) =>
                      setTestResult({
                        ...testResult,
                        method: e.target.value,
                      })
                    }
                    placeholder="Например: Спектрофотометрия"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Заключение врача-лаборанта</FormLabel>
                  <Textarea
                    value={testResult.conclusion}
                    onChange={(e) =>
                      setTestResult({
                        ...testResult,
                        conclusion: e.target.value,
                      })
                    }
                    placeholder="Введите заключение по результатам анализа"
                    rows={3}
                  />
                </FormControl>

                <HStack spacing={4}>
                  <Checkbox
                    isChecked={testResult.isAbnormal}
                    onChange={(e) =>
                      setTestResult({
                        ...testResult,
                        isAbnormal: e.target.checked,
                      })
                    }
                  >
                    Отклонение от нормы
                  </Checkbox>
                  <Checkbox
                    isChecked={testResult.ready}
                    onChange={(e) =>
                      setTestResult({
                        ...testResult,
                        ready: e.target.checked,
                      })
                    }
                    colorScheme="green"
                  >
                    <Text fontWeight="bold">Результат готов</Text>
                  </Checkbox>
                </HStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Отмена
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSaveTest}
              isLoading={loading}
            >
              Сохранить результаты
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default Cabinet;
