"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  AlertDescription,
  Grid,
  GridItem,
  Tooltip,
  IconButton,
  Stack,
  Heading,
  Tag,
  TagLabel,
  TagLeftIcon,
  Progress,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Image,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  CalendarIcon,
  TimeIcon,
  CheckCircleIcon,
  WarningIcon,
  SettingsIcon,
  InfoIcon,
  EditIcon,
  ViewIcon,
  DownloadIcon,
  SearchIcon,
  FilterIcon,
  ChevronRightIcon,
  StarIcon,
  PhoneIcon,
  EmailIcon,
  LockIcon,
  UnlockIcon,
  RepeatIcon,
  CloseIcon,
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
  const [blankAssignments, setBlankAssignments] = useState([]);
  const [labCategories, setLabCategories] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedBlank, setSelectedBlank] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingBlanks, setLoadingBlanks] = useState(false);
  const [activeTab, setActiveTab] = useState("labs");
  const toast = useToast();
  const api = getApiBaseUrl();

  // Модальные окна
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isBlankOpen,
    onOpen: onBlankOpen,
    onClose: onBlankClose,
  } = useDisclosure();
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();

  // Состояния для форм
  const [testResult, setTestResult] = useState({
    result: "",
    conclusion: "",
    isAbnormal: false,
    ready: false,
    method: "",
    notes: "",
  });

  const [blankContent, setBlankContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwt.decode(token);
        const userData = Array.isArray(decoded) ? decoded[0] : decoded;
        setUser(userData);
        loadLabTests();
        loadBlankAssignments();
        loadLabCategories();
      } catch (error) {
        console.error("Ошибка декодирования токена:", error);
        toast({
          title: "Ошибка авторизации",
          description: "Пожалуйста, войдите заново",
          status: "error",
        });
      }
    }
  }, []);

  // Загрузка данных
  const loadLabTests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${api}/labs`);
      if (!response.ok) throw new Error("Ошибка загрузки анализов");

      const data = await response.json();

      const testsWithDetails = await Promise.all(
        data.map(async (test) => {
          try {
            // Загружаем данные клиента
            const clientResponse = await fetch(
              `${api}/client/${test.clientId}`
            );
            const client = clientResponse.ok
              ? await clientResponse.json()
              : null;

            // Загружаем данные категории для референтных значений
            const categoryResponse = await fetch(
              `${api}/lab-category/${test.categoryId || test.labCategoryId}`
            );
            const category = categoryResponse.ok
              ? await categoryResponse.json()
              : null;

            return {
              ...test,
              client,
              category,
              // Автоматически берем референтные значения из категории
              unit: category?.unit || test.unit,
              referenceMin:
                category?.normalRange?.split("-")[0] ||
                category?.referenceValue?.split("-")[0] ||
                test.referenceMin,
              referenceMax:
                category?.normalRange?.split("-")[1] ||
                category?.referenceValue?.split("-")[1] ||
                test.referenceMax,
              referenceText:
                category?.normalRange ||
                category?.referenceValue ||
                test.referenceText,
            };
          } catch (err) {
            console.error(`Ошибка загрузки данных для теста ${test.id}:`, err);
            return test;
          }
        })
      );

      setLabTests(testsWithDetails);
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

  const loadBlankAssignments = async () => {
    setLoadingBlanks(true);
    try {
      const response = await fetch(`${api}/blank-assignments`);
      if (!response.ok) throw new Error("Ошибка загрузки бланков");

      const data = await response.json();

      const assignmentsWithDetails = await Promise.all(
        data.map(async (assignment) => {
          try {
            // Загружаем данные клиента
            const clientResponse = await fetch(
              `${api}/client/${assignment.clientId}`
            );
            const client = clientResponse.ok
              ? await clientResponse.json()
              : null;

            // Загружаем данные бланка
            const blankResponse = await fetch(
              `${api}/blank/${assignment.blankId}`
            );
            const blank = blankResponse.ok ? await blankResponse.json() : null;

            return { ...assignment, client, blank };
          } catch (err) {
            console.error(
              `Ошибка загрузки данных для назначения ${assignment.id}:`,
              err
            );
            return assignment;
          }
        })
      );

      setBlankAssignments(assignmentsWithDetails);
    } catch (error) {
      console.error("Ошибка загрузки бланков:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список бланков",
        status: "error",
      });
    } finally {
      setLoadingBlanks(false);
    }
  };

  const loadLabCategories = async () => {
    try {
      const response = await fetch(`${api}/lab-categories/active`);
      if (response.ok) {
        const data = await response.json();
        setLabCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Ошибка загрузки категорий:", error);
    }
  };

  // Обработчики открытия форм
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

  const handleOpenBlank = (assignment, viewOnly = false) => {
    setSelectedBlank(assignment);
    setIsEditing(!viewOnly);
    setBlankContent(
      assignment.filledContent || assignment.blank?.content || ""
    );
    if (viewOnly) {
      onViewOpen();
    } else {
      onBlankOpen();
    }
  };

  const handleViewBlank = (assignment) => {
    handleOpenBlank(assignment, true);
  };

  // Сохранение обычного анализа
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

      // Автоматическая проверка отклонений
      let isAbnormal = testResult.isAbnormal;
      const numResult = parseFloat(testResult.result);

      if (
        !isNaN(numResult) &&
        selectedTest.referenceMin &&
        selectedTest.referenceMax
      ) {
        isAbnormal =
          numResult < selectedTest.referenceMin ||
          numResult > selectedTest.referenceMax;
      }

      const updateData = {
        result: testResult.result,
        conclusion: testResult.conclusion,
        isAbnormal,
        ready: testResult.ready,
        method: testResult.method,
        notes: testResult.notes,
        readyDate: testResult.ready ? new Date().toISOString() : null,
        executedBy: user ? `${user.surname} ${user.name}` : "Неизвестно",
        // Сохраняем референтные значения из категории
        unit: selectedTest.unit,
        referenceMin: selectedTest.referenceMin,
        referenceMax: selectedTest.referenceMax,
        referenceText: selectedTest.referenceText,
      };

      const response = await fetch(`${api}/lab/update/${selectedTest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

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

  // Сохранение табличного бланка
  const handleSaveBlank = async () => {
    if (!selectedBlank) return;

    try {
      setLoading(true);

      const updateData = {
        filledContent: blankContent,
        ready: true,
        readyDate: new Date().toISOString(),
        executedBy: user ? `${user.surname} ${user.name}` : "Неизвестно",
        conclusion: "", // Можно добавить поле для заключения
      };

      const response = await fetch(
        `${api}/blank-assignment/update/${selectedBlank.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) throw new Error("Ошибка сохранения бланка");

      toast({
        title: "Успешно",
        description: "Результаты бланка сохранены",
        status: "success",
      });

      onBlankClose();
      await loadBlankAssignments();
    } catch (error) {
      console.error("Ошибка сохранения бланка:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить бланк",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменений в табличном бланке
  const handleTableCellChange = (rowIndex, cellIndex, value) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(blankContent, "text/html");
    const table = doc.querySelector("table");

    if (table) {
      const rows = table.querySelectorAll("tr");
      if (rows[rowIndex]) {
        const cells = rows[rowIndex].querySelectorAll("td, th");
        if (cells[cellIndex]) {
          // Находим ячейки с contenteditable="true" (желтые)
          const editableCell =
            cells[cellIndex].querySelector('[contenteditable="true"]') ||
            cells[cellIndex];
          if (editableCell.getAttribute("contenteditable") === "true") {
            editableCell.textContent = value;

            // Если это числовое значение, проверяем на отклонения
            if (!isNaN(parseFloat(value))) {
              // Находим ячейку с референтными значениями (обычно последняя в ряду)
              const refCell = cells[cells.length - 1];
              if (refCell && refCell.textContent.includes("-")) {
                const [min, max] = refCell.textContent
                  .split("-")
                  .map((v) => parseFloat(v.trim()));
                const currentValue = parseFloat(value);

                if (currentValue < min || currentValue > max) {
                  editableCell.style.backgroundColor = "#fed7d7"; // красный для отклонений
                } else {
                  editableCell.style.backgroundColor = "#ffffcc"; // желтый для нормы
                }
              }
            }
          }
        }
      }
    }

    setBlankContent(doc.body.innerHTML);
  };

  // Функция для подсветки отклонений
  const highlightDeviations = (content) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const tables = doc.querySelectorAll("table");

    tables.forEach((table) => {
      const rows = table.querySelectorAll("tr");
      rows.forEach((row, rowIndex) => {
        if (rowIndex === 0) return; // Пропускаем заголовок

        const cells = row.querySelectorAll("td");
        if (cells.length >= 5) {
          // Предполагаем формат: №, Показатель, Результат, Ед. изм., Референтные значения
          const resultCell = cells[2];
          const refCell = cells[4];

          if (resultCell && refCell) {
            const result = resultCell.textContent.trim();
            const ref = refCell.textContent.trim();

            if (result && ref.includes("-")) {
              const [min, max] = ref
                .split("-")
                .map((v) => parseFloat(v.trim()));
              const currentValue = parseFloat(result);

              if (!isNaN(currentValue) && !isNaN(min) && !isNaN(max)) {
                if (currentValue < min || currentValue > max) {
                  resultCell.style.backgroundColor = "#fed7d7";
                  resultCell.style.color = "#c53030";
                  resultCell.style.fontWeight = "bold";
                } else {
                  resultCell.style.backgroundColor = "#c6f6d5";
                  resultCell.style.color = "#22543d";
                }
              }
            }
          }
        }
      });
    });

    return doc.body.innerHTML;
  };

  // Фильтрация и статистика
  const filteredLabTests = useMemo(() => {
    return labTests.filter((test) => {
      const matchesSearch =
        searchTerm === "" ||
        test.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.client?.surname
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        test.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.testCode?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && !test.ready) ||
        (statusFilter === "completed" && test.ready) ||
        (statusFilter === "abnormal" && test.isAbnormal);

      return matchesSearch && matchesStatus;
    });
  }, [labTests, searchTerm, statusFilter]);

  const filteredBlankAssignments = useMemo(() => {
    return blankAssignments.filter((assignment) => {
      const matchesSearch =
        searchTerm === "" ||
        assignment.client?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        assignment.client?.surname
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        assignment.blank?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && !assignment.ready) ||
        (statusFilter === "completed" && assignment.ready);

      return matchesSearch && matchesStatus;
    });
  }, [blankAssignments, searchTerm, statusFilter]);

  // Статистика
  const stats = useMemo(() => {
    const pendingTests = labTests.filter((t) => !t.ready);
    const completedTests = labTests.filter((t) => t.ready);
    const abnormalTests = labTests.filter((t) => t.isAbnormal);
    const pendingBlanks = blankAssignments.filter((b) => !b.ready);
    const completedBlanks = blankAssignments.filter((b) => b.ready);
    const today = new Date().toISOString().split("T")[0];
    const todayTests = labTests.filter((t) => t.createdAt?.includes(today));

    return {
      pendingTests: pendingTests.length,
      completedTests: completedTests.length,
      abnormalTests: abnormalTests.length,
      pendingBlanks: pendingBlanks.length,
      completedBlanks: completedBlanks.length,
      todayTests: todayTests.length,
      totalTests: labTests.length,
      totalBlanks: blankAssignments.length,
    };
  }, [labTests, blankAssignments]);

  if (!user) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Flex flexDir="column" minH="100vh" position="relative">
      <ParticlesComponent />

      <Box position="relative" zIndex={10} px="50px">
        <Header />
      </Box>

      <Box
        flex="1"
        position="relative"
        zIndex={5}
        px={{ base: "10px", md: "20px", lg: "50px" }}
        py={8}
        display="flex"
        justifyContent="center"
        alignItems="flex-start"
        minH="calc(100vh - 160px)"
      >
        <Box w="full" maxW="100%">
          {/* Заголовок и профиль */}
          <Card
            mb={8}
            shadow="lg"
            borderRadius="2xl"
            w="full"
            overflow="hidden"
          >
            <CardBody p={0}>
              <Grid
                templateColumns={{ base: "1fr", lg: "300px 1fr" }}
                gap={0}
                overflow="hidden"
              >
                {/* Боковая панель профиля */}
                <Box
                  bg="blue.50"
                  p={{ base: 3, md: 4, lg: 6 }}
                  borderRight="1px solid"
                  borderColor="blue.100"
                >
                  <VStack spacing={6} align="center">
                    <Avatar
                      size="2xl"
                      name={`${user.name} ${user.surname}`}
                      bg="blue.500"
                      color="white"
                      src={user.userAvatar}
                    />
                    <VStack spacing={2} textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold">
                        {user.name} {user.surname}
                      </Text>
                      <Tag colorScheme="blue" size="lg">
                        <TagLeftIcon as={StarIcon} />
                        <TagLabel>
                          {user.profession || "Врач-лаборант"}
                        </TagLabel>
                      </Tag>
                      <Text fontSize="sm" color="gray.600">
                        ID: {user.id}
                      </Text>
                    </VStack>

                    <Divider />

                    <VStack spacing={4} w="100%" align="stretch">
                      <HStack spacing={3}>
                        <PhoneIcon color="blue.500" />
                        <Text>{user.phoneNumber || "Не указан"}</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <EmailIcon color="blue.500" />
                        <Text fontSize="sm">{user.email || "Не указан"}</Text>
                      </HStack>
                    </VStack>

                    <Divider />

                    <Button
                      leftIcon={<SettingsIcon />}
                      colorScheme="blue"
                      variant="outline"
                      w="100%"
                      onClick={() => setActiveTab("profile")}
                    >
                      Настройки профиля
                    </Button>
                  </VStack>
                </Box>

                {/* Основной контент */}
                <Box p={6}>
                  <Flex
                    justify="space-between"
                    align="center"
                    mb={6}
                    w={"100%"}
                  >
                    <VStack align="start" spacing={1} w={"100%"}>
                      <Text fontSize="3xl" fontWeight="bold" color="blue.700">
                        Лабораторный кабинет
                      </Text>
                      <Text color="gray.600">
                        Добро пожаловать в рабочую область
                      </Text>
                    </VStack>

                    <HStack spacing={4}>
                      <Tooltip label="Обновить данные">
                        <IconButton
                          icon={<RepeatIcon />}
                          onClick={() => {
                            loadLabTests();
                            loadBlankAssignments();
                            toast({
                              title: "Данные обновлены",
                              status: "info",
                              duration: 2000,
                            });
                          }}
                          isLoading={loading || loadingBlanks}
                        />
                      </Tooltip>
                    </HStack>
                  </Flex>

                  {/* Фильтры и поиск */}
                  <Card mb={6} shadow="sm">
                    <CardBody>
                      <Grid
                        templateColumns={{ base: "1fr", md: "1fr auto" }}
                        gap={4}
                      >
                        <HStack>
                          <Input
                            placeholder="Поиск по пациентам, тестам или кодам..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="lg"
                          />
                          <IconButton
                            icon={<SearchIcon />}
                            colorScheme="blue"
                            aria-label="Поиск"
                          />
                        </HStack>
                        <Select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          size="lg"
                          w={{ base: "100%", md: "200px" }}
                        >
                          <option value="all">Все статусы</option>
                          <option value="pending">В работе</option>
                          <option value="completed">Завершено</option>
                          <option value="abnormal">С отклонениями</option>
                        </Select>
                      </Grid>
                    </CardBody>
                  </Card>

                  {/* Быстрая статистика */}
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
                    <Card
                      bg="yellow.50"
                      borderLeft="4px"
                      borderColor="yellow.400"
                      _hover={{ transform: "translateY(-2px)", shadow: "md" }}
                      transition="all 0.2s"
                    >
                      <CardBody>
                        <Stat>
                          <StatLabel color="gray.600">
                            Обычные анализы
                          </StatLabel>
                          <StatNumber color="yellow.600">
                            {stats.pendingTests}
                          </StatNumber>
                          <StatHelpText>
                            <WarningIcon mr={1} />В работе
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card
                      bg="purple.50"
                      borderLeft="4px"
                      borderColor="purple.400"
                      _hover={{ transform: "translateY(-2px)", shadow: "md" }}
                      transition="all 0.2s"
                    >
                      <CardBody>
                        <Stat>
                          <StatLabel color="gray.600">
                            Табличные бланки
                          </StatLabel>
                          <StatNumber color="purple.600">
                            {stats.pendingBlanks}
                          </StatNumber>
                          <StatHelpText>
                            <TimeIcon mr={1} />
                            Ожидают заполнения
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card
                      bg="green.50"
                      borderLeft="4px"
                      borderColor="green.400"
                      _hover={{ transform: "translateY(-2px)", shadow: "md" }}
                      transition="all 0.2s"
                    >
                      <CardBody>
                        <Stat>
                          <StatLabel color="gray.600">Завершено</StatLabel>
                          <StatNumber color="green.600">
                            {stats.completedTests + stats.completedBlanks}
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
                      _hover={{ transform: "translateY(-2px)", shadow: "md" }}
                      transition="all 0.2s"
                    >
                      <CardBody>
                        <Stat>
                          <StatLabel color="gray.600">Отклонения</StatLabel>
                          <StatNumber color="red.600">
                            {stats.abnormalTests}
                          </StatNumber>
                          <StatHelpText>
                            <WarningIcon mr={1} />
                            Требуют внимания
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  {/* Основные вкладки */}
                  <Tabs
                    variant="enclosed"
                    colorScheme="blue"
                    index={
                      activeTab === "labs" ? 0 : activeTab === "blanks" ? 1 : 2
                    }
                  >
                    <TabList mb={6}>
                      <Tab onClick={() => setActiveTab("labs")}>
                        <HStack>
                          <TimeIcon />
                          <Text>Обычные анализы</Text>
                          {stats.pendingTests > 0 && (
                            <Badge colorScheme="yellow">
                              {stats.pendingTests}
                            </Badge>
                          )}
                        </HStack>
                      </Tab>
                      <Tab onClick={() => setActiveTab("blanks")}>
                        <HStack>
                          <CalendarIcon />
                          <Text>Табличные бланки</Text>
                          {stats.pendingBlanks > 0 && (
                            <Badge colorScheme="purple">
                              {stats.pendingBlanks}
                            </Badge>
                          )}
                        </HStack>
                      </Tab>
                      <Tab onClick={() => setActiveTab("profile")}>
                        <HStack>
                          <SettingsIcon />
                          <Text>Профиль и статистика</Text>
                        </HStack>
                      </Tab>
                    </TabList>

                    <TabPanels>
                      {/* Вкладка обычных анализов */}
                      <TabPanel p={0}>
                        <Card shadow="xs">
                          <CardHeader>
                            <Flex justify="space-between" align="center">
                              <Text fontSize="xl" fontWeight="bold">
                                Список анализов ({filteredLabTests.length})
                              </Text>
                              <Badge colorScheme="blue">
                                Всего: {stats.totalTests}
                              </Badge>
                            </Flex>
                          </CardHeader>
                          <CardBody p={0}>
                            {loading ? (
                              <Flex justify="center" py={20}>
                                <Spinner size="xl" color="blue.500" />
                              </Flex>
                            ) : filteredLabTests.length > 0 ? (
                              <Box
                                overflowX="scroll" // Добавлен горизонтальный скролл
                                overflowY="auto" // Вертикальный скролл
                                maxH="600px" // Ограничение высоты
                                width="100%"
                              >
                                <Table
                                  variant="simple"
                                  width={"100%"}
                                  size="xs"
                                >
                                  <Thead bg="blue.50" position="sticky">
                                    <Tr>
                                      <Th>ID</Th>
                                      <Th>Пациент</Th>
                                      <Th>Анализ</Th>
                                      <Th>Результат</Th>
                                      <Th>Норма</Th>
                                      <Th>Статус</Th>
                                      <Th>Действия</Th>
                                      <Th>Дата</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    {filteredLabTests.map((test) => (
                                      <Tr
                                        key={test.id}
                                        _hover={{ bg: "gray.50" }}
                                        bg={
                                          test.isAbnormal ? "red.50" : "inherit"
                                        }
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
                                          <VStack align="start" spacing={1}>
                                            <Badge colorScheme="blue">
                                              {test.testCode}
                                            </Badge>
                                            <Text
                                              fontSize="xs"
                                              fontWeight="medium"
                                            >
                                              {test.name}
                                            </Text>
                                          </VStack>
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
                                        <Td fontSize="xs">
                                          <Tooltip
                                            label="Из категории"
                                            placement="top"
                                          >
                                            <Text>
                                              {test.referenceText ||
                                                (test.referenceMin &&
                                                test.referenceMax
                                                  ? `${test.referenceMin}-${test.referenceMax} ${test.unit}`
                                                  : "—")}
                                            </Text>
                                          </Tooltip>
                                        </Td>
                                        <Td>
                                          {test.ready ? (
                                            <Badge
                                              colorScheme="green"
                                              px={2}
                                              py={1}
                                            >
                                              Готово
                                            </Badge>
                                          ) : (
                                            <Badge
                                              colorScheme="yellow"
                                              px={2}
                                              py={1}
                                            >
                                              В работе
                                            </Badge>
                                          )}
                                        </Td>

                                        <Td>
                                          <HStack spacing={2}>
                                            <Button
                                              size="xs"
                                              colorScheme="blue"
                                              onClick={() =>
                                                handleOpenTest(test)
                                              }
                                              leftIcon={
                                                test.ready ? (
                                                  <ViewIcon />
                                                ) : (
                                                  <EditIcon />
                                                )
                                              }
                                            >
                                              {test.ready
                                                ? "Просмотр"
                                                : "Заполнить"}
                                            </Button>
                                          </HStack>
                                        </Td>
                                        <Td fontSize="xs">
                                          {new Date(
                                            test.createdAt
                                          ).toLocaleDateString("ru-RU")}
                                        </Td>
                                      </Tr>
                                    ))}
                                  </Tbody>
                                </Table>
                              </Box>
                            ) : (
                              <Box textAlign="center" py={20}>
                                <Text color="gray.500" fontSize="lg" mb={4}>
                                  Нет анализов для отображения
                                </Text>
                                <Button
                                  colorScheme="blue"
                                  onClick={loadLabTests}
                                  isLoading={loading}
                                >
                                  Обновить список
                                </Button>
                              </Box>
                            )}
                          </CardBody>
                        </Card>
                      </TabPanel>

                      {/* Вкладка табличных бланков */}
                      <TabPanel p={0}>
                        <Card shadow="xs">
                          <CardHeader>
                            <Flex justify="space-between" align="center">
                              <Text fontSize="xl" fontWeight="bold">
                                Табличные бланки (
                                {filteredBlankAssignments.length})
                              </Text>
                              <Badge colorScheme="purple">
                                Всего: {stats.totalBlanks}
                              </Badge>
                            </Flex>
                          </CardHeader>
                          <CardBody p={0}>
                            {loadingBlanks ? (
                              <Flex justify="center" py={20}>
                                <Spinner size="xl" color="purple.500" />
                              </Flex>
                            ) : filteredBlankAssignments.length > 0 ? (
                              <Box
                                overflowX="auto"
                                width={"100%"}
                                overflowY="auto"
                              >
                                <Table variant="simple" size="xs">
                                  <Thead
                                    bg="purple.50"
                                    position="sticky"
                                    top={0}
                                    zIndex={1}
                                  >
                                    <Tr>
                                      <Th>ID</Th>
                                      <Th>Пациент</Th>
                                      <Th>Бланк</Th>
                                      <Th>Отделение</Th>
                                      <Th>Тип образца</Th>
                                      <Th>Статус</Th>
                                      <Th>Дата назначения</Th>
                                      <Th minW="180px">Действия</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    {filteredBlankAssignments.map(
                                      (assignment) => (
                                        <Tr
                                          key={assignment.id}
                                          _hover={{ bg: "gray.50" }}
                                        >
                                          <Td fontWeight="bold">
                                            {assignment.id}
                                          </Td>
                                          <Td>
                                            <VStack align="start" spacing={0}>
                                              <Text fontWeight="medium">
                                                {assignment.client?.surname}{" "}
                                                {assignment.client?.name}
                                              </Text>
                                              <Text
                                                fontSize="xs"
                                                color="gray.600"
                                              >
                                                {assignment.client?.phoneNumber}
                                              </Text>
                                            </VStack>
                                          </Td>
                                          <Td>
                                            <VStack align="start" spacing={1}>
                                              <Text fontWeight="medium">
                                                {assignment.blank?.name}
                                              </Text>
                                              <Text
                                                fontSize="xs"
                                                color="gray.600"
                                              >
                                                {assignment.blank?.code ||
                                                  "Без кода"}
                                              </Text>
                                            </VStack>
                                          </Td>
                                          <Td>
                                            <Badge colorScheme="purple">
                                              {assignment.blank?.department ||
                                                "—"}
                                            </Badge>
                                          </Td>
                                          <Td fontSize="xs">
                                            {assignment.sampleType ||
                                              assignment.blank?.sampleType ||
                                              "—"}
                                          </Td>
                                          <Td>
                                            {assignment.ready ? (
                                              <Badge
                                                colorScheme="green"
                                                px={2}
                                                py={1}
                                              >
                                                Готово
                                              </Badge>
                                            ) : (
                                              <Badge
                                                colorScheme="yellow"
                                                px={2}
                                                py={1}
                                              >
                                                В работе
                                              </Badge>
                                            )}
                                          </Td>
                                          <Td fontSize="xs">
                                            {new Date(
                                              assignment.createdAt
                                            ).toLocaleDateString("ru-RU")}
                                          </Td>
                                          <Td>
                                            <HStack spacing={2}>
                                              <Button
                                                minW="96px"
                                                size="xs"
                                                colorScheme="purple"
                                                onClick={() =>
                                                  handleOpenBlank(assignment)
                                                }
                                                leftIcon={<EditIcon />}
                                                isDisabled={assignment.ready}
                                              >
                                                Заполнить
                                              </Button>
                                              <Button
                                                minW="96px"
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                  handleViewBlank(assignment)
                                                }
                                                leftIcon={<ViewIcon />}
                                              >
                                                Просмотр
                                              </Button>
                                            </HStack>
                                          </Td>
                                        </Tr>
                                      )
                                    )}
                                  </Tbody>
                                </Table>
                              </Box>
                            ) : (
                              <Box textAlign="center" py={20}>
                                <Text color="gray.500" fontSize="lg" mb={4}>
                                  Нет табличных бланков для отображения
                                </Text>
                                <Button
                                  colorScheme="purple"
                                  onClick={loadBlankAssignments}
                                  isLoading={loadingBlanks}
                                >
                                  Обновить список
                                </Button>
                              </Box>
                            )}
                          </CardBody>
                        </Card>
                      </TabPanel>

                      {/* Вкладка профиля и статистики */}
                      <TabPanel p={0}>
                        <Grid
                          templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
                          gap={6}
                        >
                          <Card>
                            <CardHeader>
                              <Text fontSize="xl" fontWeight="bold">
                                Подробная статистика
                              </Text>
                            </CardHeader>
                            <CardBody>
                              <VStack spacing={6} align="stretch">
                                <Box>
                                  <Text fontWeight="bold" mb={2}>
                                    Прогресс выполнения за сегодня
                                  </Text>
                                  <Progress
                                    value={
                                      (stats.todayTests /
                                        Math.max(stats.totalTests, 1)) *
                                      100
                                    }
                                    colorScheme="blue"
                                    size="lg"
                                    borderRadius="full"
                                  />
                                  <Text fontSize="sm" color="gray.600" mt={2}>
                                    Выполнено {stats.todayTests} из{" "}
                                    {stats.totalTests} анализов сегодня
                                  </Text>
                                </Box>

                                <SimpleGrid columns={2} spacing={4}>
                                  <Card bg="blue.50">
                                    <CardBody>
                                      <Stat>
                                        <StatLabel>
                                          Общая эффективность
                                        </StatLabel>
                                        <StatNumber>
                                          {stats.totalTests +
                                            stats.totalBlanks >
                                          0
                                            ? Math.round(
                                                ((stats.completedTests +
                                                  stats.completedBlanks) /
                                                  (stats.totalTests +
                                                    stats.totalBlanks)) *
                                                  100
                                              )
                                            : 0}
                                          %
                                        </StatNumber>
                                      </Stat>
                                    </CardBody>
                                  </Card>
                                  <Card bg="green.50">
                                    <CardBody>
                                      <Stat>
                                        <StatLabel>
                                          Среднее время выполнения
                                        </StatLabel>
                                        <StatNumber>24ч</StatNumber>
                                      </Stat>
                                    </CardBody>
                                  </Card>
                                </SimpleGrid>
                              </VStack>
                            </CardBody>
                          </Card>

                          <Card>
                            <CardHeader>
                              <Text fontSize="xl" fontWeight="bold">
                                Информация о профиле
                              </Text>
                            </CardHeader>
                            <CardBody>
                              <VStack spacing={4} align="stretch">
                                <FormControl>
                                  <FormLabel>Имя</FormLabel>
                                  <Input value={user.name} readOnly />
                                </FormControl>
                                <FormControl>
                                  <FormLabel>Фамилия</FormLabel>
                                  <Input value={user.surname} readOnly />
                                </FormControl>
                                <FormControl>
                                  <FormLabel>Должность</FormLabel>
                                  <Input
                                    value={user.profession || "Врач-лаборант"}
                                    readOnly
                                  />
                                </FormControl>
                                <Button colorScheme="blue" w="100%">
                                  Изменить пароль
                                </Button>
                              </VStack>
                            </CardBody>
                          </Card>
                        </Grid>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </Box>
              </Grid>
            </CardBody>
          </Card>
        </Box>
      </Box>

      <Box position="relative" zIndex={10} px="50px" mt="auto">
        <Footer />
      </Box>

      {/* Модальное окно для обычных анализов */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent maxW="900px">
          <ModalHeader>
            {selectedTest?.ready
              ? "Просмотр результатов анализа"
              : "Заполнение результатов анализа"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedTest && (
              <VStack align="stretch" spacing={4}>
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
                        <strong>Пол:</strong>{" "}
                        {selectedTest.client?.sex === 1
                          ? "М"
                          : selectedTest.client?.sex === 0
                          ? "Ж"
                          : "—"}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Врач:</strong>{" "}
                        {selectedTest.client?.doctor || "—"}
                      </Text>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                <Card bg="blue.50" variant="outline">
                  <CardBody>
                    <HStack mb={3}>
                      <InfoIcon color="blue.500" />
                      <Text fontWeight="bold" color="blue.700">
                        Референтные значения (из категории "
                        {selectedTest.category?.name || "Не указана"}")
                      </Text>
                    </HStack>
                    <SimpleGrid columns={2} spacing={3}>
                      <Text fontSize="sm">
                        <strong>Категория:</strong>{" "}
                        {selectedTest.category?.name || "—"}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Единица измерения:</strong>{" "}
                        {selectedTest.unit || "—"}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Референтные значения:</strong>
                      </Text>
                      <Text fontSize="sm">
                        {selectedTest.referenceText ||
                          (selectedTest.referenceMin &&
                          selectedTest.referenceMax
                            ? `${selectedTest.referenceMin} - ${selectedTest.referenceMax} ${selectedTest.unit}`
                            : "Не указаны")}
                      </Text>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                <Divider />

                <SimpleGrid columns={2} spacing={4}>
                  <FormControl
                    isRequired={testResult.ready && !selectedTest.ready}
                  >
                    <FormLabel>Результат анализа</FormLabel>
                    <Input
                      value={testResult.result}
                      onChange={(e) =>
                        setTestResult({ ...testResult, result: e.target.value })
                      }
                      placeholder="Введите результат"
                      isDisabled={selectedTest.ready}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Метод исследования</FormLabel>
                    <Input
                      value={testResult.method}
                      onChange={(e) =>
                        setTestResult({ ...testResult, method: e.target.value })
                      }
                      placeholder="Например: Спектрофотометрия"
                      isDisabled={selectedTest.ready}
                    />
                  </FormControl>
                </SimpleGrid>

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
                    isDisabled={selectedTest.ready}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Дополнительные заметки</FormLabel>
                  <Textarea
                    value={testResult.notes}
                    onChange={(e) =>
                      setTestResult({ ...testResult, notes: e.target.value })
                    }
                    placeholder="Примечания или особые условия"
                    rows={2}
                    isDisabled={selectedTest.ready}
                  />
                </FormControl>

                {!selectedTest.ready && (
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
                )}

                {testResult.result &&
                  selectedTest.referenceMin &&
                  selectedTest.referenceMax &&
                  !isNaN(parseFloat(testResult.result)) && (
                    <Alert
                      status={
                        parseFloat(testResult.result) <
                          selectedTest.referenceMin ||
                        parseFloat(testResult.result) >
                          selectedTest.referenceMax
                          ? "error"
                          : "success"
                      }
                    >
                      <AlertIcon />
                      <AlertDescription>
                        {parseFloat(testResult.result) <
                          selectedTest.referenceMin ||
                        parseFloat(testResult.result) >
                          selectedTest.referenceMax
                          ? `⚠️ Результат ${testResult.result} ${selectedTest.unit} выходит за пределы нормы (${selectedTest.referenceMin}-${selectedTest.referenceMax} ${selectedTest.unit})`
                          : `✓ Результат ${testResult.result} ${selectedTest.unit} в пределах нормы (${selectedTest.referenceMin}-${selectedTest.referenceMax} ${selectedTest.unit})`}
                      </AlertDescription>
                    </Alert>
                  )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              {selectedTest?.ready ? "Закрыть" : "Отмена"}
            </Button>
            {!selectedTest?.ready && (
              <Button
                colorScheme="blue"
                onClick={handleSaveTest}
                isLoading={loading}
                isDisabled={testResult.ready && !testResult.result}
              >
                Сохранить результаты
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальное окно для редактирования табличного бланка */}
      <Modal
        isOpen={isBlankOpen}
        onClose={onBlankClose}
        size="6xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>
            Заполнение табличного бланка: {selectedBlank?.blank?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto">
            {selectedBlank && (
              <VStack align="stretch" spacing={4}>
                <Card variant="outline">
                  <CardBody>
                    <SimpleGrid columns={3} spacing={3}>
                      <Text fontSize="sm">
                        <strong>Пациент:</strong>{" "}
                        {selectedBlank.client?.surname}{" "}
                        {selectedBlank.client?.name}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Отделение:</strong>{" "}
                        {selectedBlank.blank?.department || "—"}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Тип образца:</strong>{" "}
                        {selectedBlank.sampleType ||
                          selectedBlank.blank?.sampleType ||
                          "—"}
                      </Text>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>
                    💡 Кликните на желтые ячейки и введите результаты анализа.
                    Отклонения автоматически подсветятся красным цветом.
                  </AlertDescription>
                </Alert>

                <Box
                  border="2px solid"
                  borderColor="blue.200"
                  borderRadius="lg"
                  p={4}
                  bg="white"
                  shadow="sm"
                >
                  <Box
                    dangerouslySetInnerHTML={{
                      __html: highlightDeviations(blankContent),
                    }}
                    onBlur={(e) => setBlankContent(e.currentTarget.innerHTML)}
                    contentEditable={true}
                    style={{
                      outline: "none",
                      minHeight: "400px",
                    }}
                  />
                </Box>

                <Card variant="outline" mt={4}>
                  <CardBody>
                    <Text fontWeight="bold" mb={3}>
                      Заключение врача-лаборанта
                    </Text>
                    <Textarea
                      placeholder="Введите заключение по результатам анализа..."
                      rows={3}
                      value={selectedBlank.conclusion || ""}
                      onChange={(e) => {
                        // Обновляем состояние при необходимости
                      }}
                    />
                  </CardBody>
                </Card>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onBlankClose}>
              Отмена
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSaveBlank}
              isLoading={loading}
              leftIcon={<CheckCircleIcon />}
            >
              Сохранить результаты
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальное окно для просмотра готового бланка */}
      <Modal
        isOpen={isViewOpen}
        onClose={onViewClose}
        size="6xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>
            Просмотр табличного бланка: {selectedBlank?.blank?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto">
            {selectedBlank && (
              <VStack align="stretch" spacing={4}>
                <Card variant="outline">
                  <CardBody>
                    <SimpleGrid columns={3} spacing={3}>
                      <Text fontSize="sm">
                        <strong>Пациент:</strong>{" "}
                        {selectedBlank.client?.surname}{" "}
                        {selectedBlank.client?.name}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Дата готовности:</strong>{" "}
                        {selectedBlank.readyDate
                          ? new Date(selectedBlank.readyDate).toLocaleString(
                              "ru-RU"
                            )
                          : "—"}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Исполнитель:</strong>{" "}
                        {selectedBlank.executedBy || "—"}
                      </Text>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                <Box
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="lg"
                  p={4}
                  bg="white"
                >
                  <Box
                    dangerouslySetInnerHTML={{
                      __html: highlightDeviations(
                        selectedBlank.filledContent ||
                          selectedBlank.blank?.content ||
                          ""
                      ),
                    }}
                  />
                </Box>

                {selectedBlank.conclusion && (
                  <Card variant="outline" mt={4}>
                    <CardBody>
                      <Text fontWeight="bold" mb={3}>
                        Заключение врача-лаборанта
                      </Text>
                      <Text>{selectedBlank.conclusion}</Text>
                    </CardBody>
                  </Card>
                )}

                <HStack justify="center" mt={4}>
                  <Button
                    leftIcon={<DownloadIcon />}
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => {
                      // Функция для скачивания/печати бланка
                      toast({
                        title: "Функция в разработке",
                        status: "info",
                      });
                    }}
                  >
                    Скачать PDF
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onViewClose}>
              Закрыть
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default Cabinet;
