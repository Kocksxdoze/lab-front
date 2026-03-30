"use client";

import {
  Box,
  Button,
  SimpleGrid,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Divider,
  Flex,
  VStack,
  HStack,
  Heading,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Select,
  FormControl,
  FormLabel,
  useToast,
  Checkbox,
  Alert,
  AlertIcon,
  AlertDescription,
  Input,
  Card,
  CardBody,
  IconButton,
  Grid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { getApiBaseUrl } from "../../utils/api";
import {
  DeleteIcon,
  SearchIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckIcon,
  AddIcon,
} from "@chakra-ui/icons";

// Компонент карточки анализа
const AnalysisCard = ({ category, isSelected, onSelect }) => {
  const price = category.basePrice || category.sum || 0;

  return (
    <Card
      variant="outline"
      borderWidth="2px"
      borderColor={isSelected ? "blue.500" : "gray.200"}
      bg={isSelected ? "blue.50" : "white"}
      _hover={{
        borderColor: isSelected ? "blue.500" : "blue.300",
        shadow: "md",
      }}
      transition="all 0.2s"
    >
      <CardBody>
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Badge colorScheme="blue" fontSize="xs">
                {category.code || category.id}
              </Badge>
              {category.department && (
                <Badge colorScheme="purple" fontSize="xs">
                  {category.department}
                </Badge>
              )}
            </HStack>
            {category.sampleType && (
              <Badge colorScheme="gray" fontSize="xs">
                🧪 {category.sampleType}
              </Badge>
            )}
          </HStack>

          <Text fontWeight="bold" fontSize="lg" minH="3rem">
            {category.name}
          </Text>

          {category.description && (
            <Text fontSize="sm" color="gray.600" noOfLines={2}>
              {category.description}
            </Text>
          )}

          {category.executionTime && (
            <HStack>
              <Text fontSize="xs" color="gray.500">
                ⏱️ Срок:
              </Text>
              <Text fontSize="xs" fontWeight="medium">
                {category.executionTime}
              </Text>
            </HStack>
          )}

          <Divider />

          <HStack justify="space-between">
            <Text fontSize="xl" fontWeight="bold" color="green.600">
              {parseInt(price).toLocaleString()} сум
            </Text>
            <Button
              size="sm"
              colorScheme={isSelected ? "green" : "blue"}
              onClick={() => onSelect(category)}
              isDisabled={isSelected}
              leftIcon={isSelected ? <CheckIcon /> : <AddIcon />}
            >
              {isSelected ? "Добавлено" : "Добавить"}
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

// Компонент карточки бланка
const BlankCard = ({ blank, isSelected, onSelect }) => {
  return (
    <Card
      variant="outline"
      borderWidth="2px"
      borderColor={isSelected ? "purple.500" : "gray.200"}
      bg={isSelected ? "purple.50" : "white"}
      _hover={{
        borderColor: isSelected ? "purple.500" : "purple.300",
        shadow: "md",
      }}
      transition="all 0.2s"
    >
      <CardBody>
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Badge colorScheme="purple" fontSize="xs">
                Бланк #{blank.id}
              </Badge>
              {blank.department && (
                <Badge colorScheme="blue" fontSize="xs">
                  {blank.department}
                </Badge>
              )}
            </HStack>
            {blank.sampleType && (
              <Badge colorScheme="gray" fontSize="xs">
                🧪 {blank.sampleType}
              </Badge>
            )}
          </HStack>

          <Text fontWeight="bold" fontSize="lg" minH="3rem">
            {blank.name}
          </Text>

          {blank.description && (
            <Text fontSize="sm" color="gray.600" noOfLines={2}>
              {blank.description}
            </Text>
          )}

          <VStack align="stretch" spacing={1} fontSize="sm">
            {blank.category && (
              <HStack>
                <Text color="gray.600">📂 Категория:</Text>
                <Text fontWeight="medium">{blank.category}</Text>
              </HStack>
            )}
          </VStack>

          <Divider />

          <HStack justify="space-between">
            <Text fontSize="xl" fontWeight="bold" color="green.600">
              {(blank.price || 0).toLocaleString()} сум
            </Text>
            <Button
              size="sm"
              colorScheme={isSelected ? "green" : "purple"}
              onClick={() => onSelect(blank)}
              isDisabled={isSelected}
              leftIcon={isSelected ? <CheckIcon /> : <AddIcon />}
            >
              {isSelected ? "Добавлено" : "Добавить"}
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default function PatientPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patientData, setPatientData] = useState(null);
  const [labResults, setLabResults] = useState([]);
  const [blankAssignments, setBlankAssignments] = useState([]);
  const [cashRecords, setCashRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTests, setSelectedTests] = useState([]);
  const [selectedBlanks, setSelectedBlanks] = useState([]);
  const toast = useToast();
  const api = getApiBaseUrl();

  // Состояния для добавления анализов
  const [isAddAnalysisOpen, setIsAddAnalysisOpen] = useState(false);
  const [labCategories, setLabCategories] = useState([]);
  const [blanks, setBlanks] = useState([]);
  const [selectedAnalyses, setSelectedAnalyses] = useState([]);
  const [selectedBlankItems, setSelectedBlankItems] = useState([]);
  const [searchAnalysisTerm, setSearchAnalysisTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paidAmount, setPaidAmount] = useState(""); // Изменено на пустую строку

  // Состояния для структурированного отображения анализов
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [modalSearchSuggestions, setModalSearchSuggestions] = useState([]);
  const [activeTabIndex, setActiveTabIndex] = useState(0); // 0 - анализы, 1 - бланки

  const {
    isOpen: isPrintModalOpen,
    onOpen: onPrintModalOpen,
    onClose: onPrintModalClose,
  } = useDisclosure();

  // Медицинские сокращения для поиска
  const medicalAbbreviations = {
    общ: "общий",
    клин: "клинический",
    биох: "биохимический",
    биохим: "биохимический",
    оак: "общий анализ крови",
    оам: "общий анализ мочи",
    сахар: "глюкоза",
    глюк: "глюкоза",
    ттг: "тиреотропный гормон",
    т3: "трийодтиронин",
    т4: "тироксин",
    алт: "alat",
    аст: "asat",
    креат: "креатинин",
    мочев: "мочевина",
    вит: "витамин",
    "вит д": "витамин d",
    д3: "витамин d",
  };

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  // Фильтрация анализов для модального окна
  const filteredLabCategories = useMemo(() => {
    let filtered = labCategories.filter((cat) => cat.isActive !== false);

    if (selectedDepartment) {
      filtered = filtered.filter(
        (cat) => cat.department === selectedDepartment,
      );
    }

    if (modalSearchTerm) {
      const expandedQuery = expandMedicalTerms(modalSearchTerm);
      const terms = expandedQuery
        .split(/\s+/)
        .filter((term) => term.length > 0);

      filtered = filtered.filter((category) => {
        const searchText = `
          ${category.name?.toLowerCase() || ""}
          ${category.department?.toLowerCase() || ""}
          ${category.description?.toLowerCase() || ""}
        `;
        return terms.every((term) => searchText.includes(term));
      });
    }

    return filtered;
  }, [labCategories, selectedDepartment, modalSearchTerm]);

  // Поиск в модальном окне
  useEffect(() => {
    if (modalSearchTerm && modalSearchTerm.length >= 2) {
      const expandedQuery = expandMedicalTerms(modalSearchTerm);
      const terms = expandedQuery
        .split(/\s+/)
        .filter((term) => term.length > 0);

      // Ищем и в анализах, и в бланках
      const suggestions = [
        ...labCategories
          .filter((category) => {
            const searchText = `
              ${category.name?.toLowerCase() || ""}
              ${category.department?.toLowerCase() || ""}
              ${category.description?.toLowerCase() || ""}
            `;
            return terms.every((term) => searchText.includes(term));
          })
          .map((cat) => ({ ...cat, type: "analysis" })),
        ...blanks
          .filter((blank) => {
            const searchText = `
              ${blank.name?.toLowerCase() || ""}
              ${blank.department?.toLowerCase() || ""}
              ${blank.description?.toLowerCase() || ""}
            `;
            return terms.every((term) => searchText.includes(term));
          })
          .map((blank) => ({ ...blank, type: "blank" })),
      ].slice(0, 5);

      setModalSearchSuggestions(suggestions);
    } else {
      setModalSearchSuggestions([]);
    }
  }, [modalSearchTerm, labCategories, blanks]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);

      const clientResponse = await fetch(`${api}/client/${id}`);
      if (!clientResponse.ok) throw new Error("Ошибка загрузки пациента");
      const client = await clientResponse.json();
      setPatientData(client);

      const labResponse = await fetch(`${api}/lab/client/${id}`);
      if (labResponse.ok) {
        const labs = await labResponse.json();

        // Загружаем категории для каждого анализа
        const labsWithCategories = await Promise.all(
          labs.map(async (lab) => {
            try {
              const categoryResponse = await fetch(
                `${api}/lab-category/${lab.categoryId}`,
              );
              const category = categoryResponse.ok
                ? await categoryResponse.json()
                : null;

              return {
                ...lab,
                category,
                // Если отделение не указано в анализе, берём из категории
                department: lab.department || category?.department || "—",
              };
            } catch (err) {
              return lab;
            }
          }),
        );

        setLabResults(labsWithCategories);
      }

      const blankAssignmentsResponse = await fetch(
        `${api}/blank-assignments/client/${id}`,
      );
      if (blankAssignmentsResponse.ok) {
        const assignments = await blankAssignmentsResponse.json();
        const assignmentsWithDetails = await Promise.all(
          assignments.map(async (assignment) => {
            try {
              const blankResponse = await fetch(
                `${api}/blank/${assignment.blankId}`,
              );
              const blank = blankResponse.ok
                ? await blankResponse.json()
                : null;
              return { ...assignment, blank };
            } catch (err) {
              return assignment;
            }
          }),
        );
        setBlankAssignments(assignmentsWithDetails);
      }

      const cashResponse = await fetch(`${api}/cashbox/client/${id}`);
      if (cashResponse.ok) {
        const cash = await cashResponse.json();
        setCashRecords(cash);
      }
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные пациента",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Функции для добавления анализов
  const openAddAnalysisModal = async () => {
    setIsAddAnalysisOpen(true);
    await loadLabCategories();
    await loadBlanks();
  };

  const loadLabCategories = async () => {
    try {
      const response = await fetch(`${api}/lab-categories`);
      const data = await response.json();
      setLabCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Ошибка загрузки категорий:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список анализов",
        status: "error",
      });
    }
  };

  const loadBlanks = async () => {
    try {
      const response = await fetch(`${api}/blanks`);
      const data = await response.json();
      setBlanks(Array.isArray(data) ? data.filter((b) => b.isActive) : []);
    } catch (error) {
      console.error("Ошибка загрузки бланков:", error);
    }
  };

  const expandMedicalTerms = (query) => {
    let expandedQuery = query.toLowerCase();
    Object.keys(medicalAbbreviations).forEach((abbr) => {
      if (expandedQuery.includes(abbr)) {
        expandedQuery = expandedQuery.replace(abbr, medicalAbbreviations[abbr]);
      }
    });
    return expandedQuery;
  };

  const handleAnalysisSearch = (query) => {
    setSearchAnalysisTerm(query);

    if (!query.trim()) {
      setFilteredCategories([]);
      return;
    }

    const expandedQuery = expandMedicalTerms(query);
    const terms = expandedQuery.split(/\s+/).filter((term) => term.length > 0);

    const filteredLabs = labCategories.filter((category) => {
      const searchText = `
        ${category.name?.toLowerCase() || ""}
        ${category.department?.toLowerCase() || ""}
        ${category.description?.toLowerCase() || ""}
      `;
      return terms.every((term) => searchText.includes(term));
    });

    const filteredBlanksItems = blanks.filter((blank) => {
      const searchText = `
        ${blank.name?.toLowerCase() || ""}
        ${blank.code?.toLowerCase() || ""}
        ${blank.department?.toLowerCase() || ""}
        ${blank.category?.toLowerCase() || ""}
      `;
      return terms.every((term) => searchText.includes(term));
    });

    setFilteredCategories(
      [
        ...filteredLabs
          .slice(0, 5)
          .map((item) => ({ ...item, type: "analysis" })),
        ...filteredBlanksItems
          .slice(0, 5)
          .map((item) => ({ ...item, type: "blank" })),
      ].slice(0, 8),
    );
  };

  const handleAnalysisSelect = (category) => {
    if (selectedAnalyses.find((a) => a.categoryId === category.id)) {
      toast({
        title: "Уведомление",
        description: "Этот анализ уже добавлен",
        status: "info",
      });
      return;
    }

    const price = category.basePrice || category.sum || 0;
    let tests = [];

    if (category.tests) {
      try {
        tests =
          typeof category.tests === "string"
            ? JSON.parse(category.tests)
            : category.tests;
      } catch (e) {
        console.error("Ошибка парсинга тестов:", e);
      }
    }

    if (!Array.isArray(tests) || tests.length === 0) {
      tests = [
        {
          code: category.code,
          name: category.name,
          unit: null,
          referenceMin: null,
          referenceMax: null,
          method: null,
        },
      ];
    }

    setSelectedAnalyses((prev) => [
      ...prev,
      {
        categoryId: category.id,
        name: category.name,
        code: category.code,
        price: parseInt(price) || 0,
        sampleType: category.sampleType || "Кровь (сыворотка)",
        tests: tests,
        executionTime: category.executionTime,
        department: category.department,
      },
    ]);

    toast({
      title: "Анализ добавлен",
      description: `${category.name}`,
      status: "success",
      duration: 1500,
    });
  };

  const handleBlankSelect = (blank) => {
    if (selectedBlankItems.find((b) => b.id === blank.id)) {
      toast({
        title: "Уведомление",
        description: "Этот бланк уже добавлен",
        status: "info",
      });
      return;
    }

    setSelectedBlankItems((prev) => [
      ...prev,
      {
        id: blank.id,
        name: blank.name,
        price: parseInt(blank.price) || 0,
        department: blank.department,
        sampleType: blank.sampleType,
        content: blank.content,
      },
    ]);

    toast({
      title: "Бланк добавлен",
      description: `${blank.name}`,
      status: "success",
      duration: 1500,
    });
  };

  const handleSuggestionClick = (item) => {
    if (item.type === "analysis") {
      handleAnalysisSelect(item);
    } else {
      handleBlankSelect(item);
    }
    setSearchAnalysisTerm("");
    setFilteredCategories([]);
  };

  const removeAnalysis = (categoryId) => {
    setSelectedAnalyses((prev) =>
      prev.filter((a) => a.categoryId !== categoryId),
    );
  };

  const removeBlank = (blankId) => {
    setSelectedBlankItems((prev) => prev.filter((b) => b.id !== blankId));
  };

  const calculateTotals = () => {
    const analysisTotal = selectedAnalyses.reduce(
      (sum, a) => sum + (parseInt(a.price) || 0),
      0,
    );
    const blankTotal = selectedBlankItems.reduce(
      (sum, b) => sum + (parseInt(b.price) || 0),
      0,
    );
    const totalAmount = analysisTotal + blankTotal;
    const finalAmount = totalAmount;
    const paid = parseFloat(paidAmount) || 0;
    const debtAmount = Math.max(0, finalAmount - paid);

    return { totalAmount, finalAmount, debtAmount };
  };

  const { totalAmount, finalAmount, debtAmount } = calculateTotals();

  const handleAddAnalyses = async () => {
    if (selectedAnalyses.length === 0 && selectedBlankItems.length === 0) {
      toast({
        title: "Ошибка",
        description: "Выберите анализы или бланки для добавления",
        status: "error",
      });
      return;
    }

    try {
      setLoading(true);

      // Создаем записи обычных анализов
      if (selectedAnalyses.length > 0) {
        const labPromises = selectedAnalyses.flatMap((analysis) => {
          const tests = analysis.tests || [];

          if (!Array.isArray(tests) || tests.length === 0) {
            const labData = {
              clientId: id,
              categoryId: analysis.categoryId,
              name: analysis.name,
              testCode: analysis.code || "",
              price: analysis.price || 0,
              sampleType: analysis.sampleType || "Кровь (сыворотка)",
              department: analysis.department || "",
              unit: null,
              referenceMin: null,
              referenceMax: null,
              referenceText: null,
              method: null,
              ready: false,
              result: null,
              conclusion: null,
              isAbnormal: false,
            };

            return fetch(`${api}/lab/new`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(labData),
            });
          }

          return tests.map((test) => {
            const labData = {
              clientId: id,
              categoryId: analysis.categoryId,
              name: test.name || analysis.name,
              testCode: test.code || analysis.code || "",
              price: analysis.price || 0,
              sampleType: analysis.sampleType || "Кровь (сыворотка)",
              department: analysis.department || "",
              unit: test.unit || null,
              referenceMin: test.referenceMin || null,
              referenceMax: test.referenceMax || null,
              referenceText: test.referenceText || null,
              method: test.method || null,
              ready: false,
              result: null,
              conclusion: null,
              isAbnormal: false,
            };

            return fetch(`${api}/lab/new`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(labData),
            });
          });
        });

        await Promise.all(labPromises);
      }

      // Создаем назначения бланков
      if (selectedBlankItems.length > 0) {
        const blankPromises = selectedBlankItems.map((blank) => {
          const assignmentData = {
            clientId: id,
            blankId: blank.id,
            status: "pending",
            assignedAt: new Date().toISOString(),
          };

          return fetch(`${api}/blank-assignment/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(assignmentData),
          });
        });

        await Promise.all(blankPromises);
      }

      // Создаем запись в кассе
      const servicesDescription = [
        ...selectedAnalyses.map((a) => a.name),
        ...selectedBlankItems.map((b) => b.name),
      ].join(", ");

      const cashData = {
        clientId: id,
        registratorId: null,
        totalAmount,
        discount: 0,
        discountPercent: 0,
        finalAmount,
        paidAmount: parseFloat(paidAmount) || 0,
        debtAmount,
        paymentMethod,
        servicesDescription,
        labAnalyses: selectedAnalyses.map((a) => a.categoryId),
        blanks: selectedBlankItems.map((b) => b.id),
        status:
          debtAmount === 0
            ? "paid"
            : parseFloat(paidAmount) || 0 > 0
              ? "partial"
              : "debt",
        date: new Date().toISOString(),
      };

      await fetch(`${api}/cashbox/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cashData),
      });

      toast({
        title: "Успешно",
        description: `Анализы добавлены пациенту`,
        status: "success",
        duration: 3000,
      });

      setIsAddAnalysisOpen(false);
      setSelectedAnalyses([]);
      setSelectedBlankItems([]);
      setPaidAmount("");
      setSearchAnalysisTerm("");
      setModalSearchTerm("");
      setSelectedDepartment(null);
      setActiveTabIndex(0);

      fetchPatientData();
    } catch (error) {
      console.error("❌ Ошибка добавления:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить анализы",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateString) => {
    if (!dateString) return "";
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      paid: { label: "Оплачено", color: "green" },
      partial: { label: "Частично", color: "yellow" },
      debt: { label: "Долг", color: "red" },
      cancelled: { label: "Отменено", color: "gray" },
    };
    const s = statusMap[status] || { label: status, color: "gray" };
    return <Badge colorScheme={s.color}>{s.label}</Badge>;
  };

  const handleToggleTest = (testId) => {
    setSelectedTests((prev) =>
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId],
    );
  };

  const handleToggleBlank = (blankId) => {
    setSelectedBlanks((prev) =>
      prev.includes(blankId)
        ? prev.filter((id) => id !== blankId)
        : [...prev, blankId],
    );
  };

  const handleSelectAll = () => {
    const readyTests = labResults.filter((lab) => lab.ready);
    if (selectedTests.length === readyTests.length) {
      setSelectedTests([]);
    } else {
      setSelectedTests(readyTests.map((lab) => lab.id));
    }
  };

  const handleSelectAllBlanks = () => {
    const readyBlanks = blankAssignments.filter((b) => b.ready);
    if (selectedBlanks.length === readyBlanks.length) {
      setSelectedBlanks([]);
    } else {
      setSelectedBlanks(readyBlanks.map((b) => b.id));
    }
  };

  const handlePrint = () => {
    const selectedResults = labResults.filter((lab) =>
      selectedTests.includes(lab.id),
    );
    const selectedBlankResults = blankAssignments.filter((blank) =>
      selectedBlanks.includes(blank.id),
    );

    if (selectedResults.length === 0 && selectedBlankResults.length === 0) {
      toast({
        title: "Не выбраны анализы",
        description: "Выберите хотя бы один готовый анализ для печати",
        status: "warning",
      });
      return;
    }

    const printContent = generatePrintContent(
      selectedResults,
      selectedBlankResults,
    );
    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Функция для проверки отклонений с учетом операторов <, >
  const checkAbnormal = (result, referenceMin, referenceMax, referenceText) => {
    if (!result) return false;

    const resultStr = String(result).trim();

    // Проверяем текстовые референтные значения с операторами
    if (referenceText) {
      const refStr = String(referenceText).trim();

      // Проверка для "<число"
      const lessThanMatch = refStr.match(/^<\s*(\d+\.?\d*)/);
      if (lessThanMatch) {
        const threshold = parseFloat(lessThanMatch[1]);
        const numResult = parseFloat(resultStr.replace(/[<>]/g, ""));
        if (!isNaN(numResult) && numResult >= threshold) {
          return true;
        }
      }

      // Проверка для ">число"
      const greaterThanMatch = refStr.match(/^>\s*(\d+\.?\d*)/);
      if (greaterThanMatch) {
        const threshold = parseFloat(greaterThanMatch[1]);
        const numResult = parseFloat(resultStr.replace(/[<>]/g, ""));
        if (!isNaN(numResult) && numResult <= threshold) {
          return true;
        }
      }
    }

    // Стандартная проверка числового диапазона
    const numResult = parseFloat(resultStr);
    if (!isNaN(numResult) && referenceMin !== null && referenceMax !== null) {
      const min = parseFloat(referenceMin);
      const max = parseFloat(referenceMax);
      if (!isNaN(min) && !isNaN(max)) {
        return numResult < min || numResult > max;
      }
    }

    return false;
  };

  // Функция для определения стрелки отклонения
  const getArrow = (result, referenceMin, referenceMax, referenceText) => {
    if (!result) return "";

    const resultStr = String(result).trim();
    const numResult = parseFloat(resultStr.replace(/[<>]/g, ""));

    if (isNaN(numResult)) return "";

    // Проверка текстовых референтных значений с операторами
    if (referenceText) {
      const refStr = String(referenceText).trim();

      const lessThanMatch = refStr.match(/^<\s*(\d+\.?\d*)/);
      if (lessThanMatch) {
        const threshold = parseFloat(lessThanMatch[1]);
        if (numResult >= threshold) {
          return '<span class="arrow arrow-up">↑</span>';
        }
        return "";
      }

      const greaterThanMatch = refStr.match(/^>\s*(\d+\.?\d*)/);
      if (greaterThanMatch) {
        const threshold = parseFloat(greaterThanMatch[1]);
        if (numResult <= threshold) {
          return '<span class="arrow arrow-down">↓</span>';
        }
        return "";
      }
    }

    if (referenceMin !== null && referenceMax !== null) {
      const min = parseFloat(referenceMin);
      const max = parseFloat(referenceMax);

      if (!isNaN(min) && !isNaN(max)) {
        if (numResult > max) {
          return '<span class="arrow arrow-up">↑</span>';
        } else if (numResult < min) {
          return '<span class="arrow arrow-down">↓</span>';
        }
      }
    }

    return "";
  };

  const cleanResult = (result) => {
    if (result == null || result === "") {
      return "—";
    }

    // Если это число - сохраняем точность
    if (typeof result === "number") {
      if (Number.isInteger(result)) {
        return result.toString();
      } else {
        return result.toFixed(2);
      }
    }

    // Если строка - обрабатываем
    const str = String(result).trim();

    // Если результат содержит операторы сравнения (<, >)
    if (/^[<>≤≥]/.test(str)) {
      return str;
    }

    // Проверяем, является ли строка числом
    const numStr = str.replace(/,/g, ".");
    const num = parseFloat(numStr);

    if (!isNaN(num)) {
      const hasDecimal = /[.,]/.test(str);
      const decimalCount = (str.split(/[.,]/)[1] || "").length;

      if (hasDecimal && decimalCount > 0) {
        if (str.includes(",")) {
          return str;
        }
        return str;
      } else if (str.includes(".") && numStr.includes(".")) {
        return str;
      } else {
        return num.toString();
      }
    }

    return str;
  };

  const groupResultsByCategory = (results) => {
    const groups = {};

    const relatedTests = {
      АЛТ: [
        "АСТ",
        "Билирубин общий",
        "Билирубин прямой",
        "Билирубин непрямой",
        "Щелочная фосфатаза",
        "ГГТ",
      ],
      АСТ: ["АЛТ", "Билирубин общий", "Билирубин прямой", "Билирубин непрямой"],
      "Билирубин общий": [
        "Билирубин прямой",
        "Билирубин непрямой",
        "АЛТ",
        "АСТ",
      ],
      "Билирубин прямой": ["Билирубин непрямой", "Билирубин общий"],
      "Билирубин непрямой": ["Билирубин прямой", "Билирубин общий"],

      Креатинин: ["Мочевина", "Мочевая кислота"],
      Мочевина: ["Креатинин", "Мочевая кислота"],

      "Холестерин общий": [
        "Холестерин ЛПВП",
        "Холестерин ЛПНП",
        "Триглицериды",
      ],
      "Холестерин ЛПВП": ["Холестерин ЛПНП", "Холестерин общий"],

      ТТГ: ["Т3 свободный", "Т4 свободный"],
      "Т3 свободный": ["Т4 свободный", "ТТГ"],
      "Т4 свободный": ["Т3 свободный", "ТТГ"],

      Гемоглобин: ["Эритроциты", "Лейкоциты", "Тромбоциты", "Гематокрит"],
      Лейкоциты: [
        "Нейтрофилы",
        "Лимфоциты",
        "Моноциты",
        "Эозинофилы",
        "Базофилы",
      ],
    };

    results.forEach((lab) => {
      const testName = lab.name.trim();
      let groupFound = false;

      for (const [key, relatedList] of Object.entries(relatedTests)) {
        if (relatedList.includes(testName) || testName === key) {
          if (!groups[key]) {
            groups[key] = [];
          }
          if (!groups[key].some((item) => item.name === lab.name)) {
            groups[key].push(lab);
          }
          groupFound = true;
          break;
        }
      }

      if (!groupFound) {
        groups[testName] = [lab];
      }
    });

    return groups;
  };

  const generatePrintContent = (results, blankResults) => {
    const fio = `${patientData.surname || ""} ${patientData.name || ""} ${
      patientData.lastName || ""
    }`.trim();
    const birthDate = formatDate(patientData.dateBirth);
    const age = calculateAge(patientData.dateBirth);
    const today = new Date().toLocaleDateString("ru-RU");

    const departmentGroups = results.reduce((acc, lab) => {
      const dept = lab.department || "Общие анализы";
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(lab);
      return acc;
    }, {});

    // Функция создания шапки документа
    const createHeader = () => `
    <div class="header">
      <div class="header-left">
        <div class="logo">
          <img src="/med.svg" alt="Medical Logo">
        </div>
        <div class="header-text">
          <div class="company-name">VIRUSOLOGIYA</div>
          <div class="subtitle">Лаборатория научных исследований</div>
          <div class="association">
            АССОЦИАЦИЯ СПЕЦИАЛИСТОВ И ОРГАНИЗАЦИЙ ЛАБОРАТОРНОЙ СЛУЖБЫ<br>
            «ФЕДЕРАЦИЯ ЛАБОРАТОРНОЙ МЕДИЦИНЫ»
          </div>
          <div class="certificate">Свидетельство N <span style="margin-left: 30px;">188384</span></div>
        </div>
      </div>
      <div class="header-right">
        <div><strong>ООО «VIRUSOLOGIYA»</strong></div>
        <div>150100, г. Фергана, Пахлавон Махмуд 23</div>
        <div>+99895-023-47-03</div>
        <div>e-mail: @Virusologiya_bot</div>
      </div>
    </div>
    
    <div class="patient-info">
      <div class="info-row">
        <div class="info-label">ФИО:</div>
        <div class="info-value">${fio}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Дата рождения:</div>
        <div class="info-value">${birthDate} (${age} лет)</div>
      </div>
      <div class="info-row">
        <div class="info-label">Номер пациента:</div>
        <div class="info-value">${id}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Дата выдачи:</div>
        <div class="info-value">${today}</div>
      </div>
    </div>
  `;

    // Функция создания футера
    const createFooter = () => `
    <div class="barcode">
      <img src="https://barcode.tec-it.com/barcode.ashx?data=23022024${" "}2390845${" "}L-29083169&code=Code128&dpi=96&dataseparator=" alt="Barcode">
    </div>
    
    <div class="disclaimer">
       Результаты исследований не являются диагнозом, необходима консультация специалиста.
    </div>
    
    <div class="document-footer">
      <div>ООО «VIRUSOLOGIYA» • 150100, г. Фергана, Пахлавон Махмуд 23 • Тел: +99895-023-47-03 • e-mail: @Virusologiya_bot</div>
      <div>Все права защищены © ${new Date().getFullYear()}</div>
    </div>
  `;

    // Функция создания watermark
    const createWatermark = () => `
    <div class="watermark">
      <img src="/lab.svg" alt="Laboratory Federation Logo">
    </div>
  `;

    // Создаем структуру страниц с учетом отделений
    const TESTS_PER_PAGE = 12;
    const pages = [];
    let currentPage = [];
    let currentPageCount = 0;

    // ВАЖНО: Работаем только если есть результаты
    if (Object.keys(departmentGroups).length > 0) {
      Object.entries(departmentGroups).forEach(([department, deptResults]) => {
        // Если отделение не влезает на текущую страницу, начинаем новую
        if (
          currentPageCount > 0 &&
          currentPageCount + deptResults.length > TESTS_PER_PAGE
        ) {
          pages.push([...currentPage]);
          currentPage = [];
          currentPageCount = 0;
        }

        // Если отделение слишком большое, разбиваем его
        if (deptResults.length > TESTS_PER_PAGE) {
          for (let i = 0; i < deptResults.length; i += TESTS_PER_PAGE) {
            const chunk = deptResults.slice(i, i + TESTS_PER_PAGE);
            pages.push(
              chunk.map((lab) => ({
                ...lab,
                department,
                isFirstInDept: i === 0,
              })),
            );
          }
        } else {
          // Добавляем все анализы отделения на текущую страницу
          deptResults.forEach((lab, idx) => {
            currentPage.push({ ...lab, department, isFirstInDept: idx === 0 });
          });
          currentPageCount += deptResults.length;
        }
      });

      if (currentPage.length > 0) {
        pages.push(currentPage);
      }
    }

    // Функция генерации таблицы результатов
    const generateResultsTable = (pageTests) => {
      let lastDepartment = null;
      return `
      <table class="results-table">
        <thead>
          <tr>
            <th style="width: 40%;">Показатель</th>
            <th style="width: 15%;">Результат</th>
            <th style="width: 10%;">Ед. изм.</th>
            <th style="width: 20%;">Референтные значения</th>
            <th style="width: 15%;">Метод</th>
          </tr>
        </thead>
        <tbody>
          ${pageTests
            .map((lab) => {
              let departmentHeader = "";
              if (lab.department !== lastDepartment) {
                lastDepartment = lab.department;
                departmentHeader = `
                <tr>
                  <td colspan="5" class="department-title">${lab.department}</td>
                </tr>
              `;
              }

              let referenceDisplay = "—";
              if (lab.referenceText) {
                referenceDisplay = lab.referenceText;
              } else if (
                lab.referenceMin !== null &&
                lab.referenceMax !== null
              ) {
                const min = parseFloat(lab.referenceMin);
                const max = parseFloat(lab.referenceMax);
                if (!isNaN(min) && !isNaN(max)) {
                  referenceDisplay = `${min} - ${max}`;
                }
              } else if (lab.norma) {
                referenceDisplay = lab.norma;
              }

              const cleanedResult = cleanResult(lab.result);
              const arrow = getArrow(
                lab.result,
                lab.referenceMin,
                lab.referenceMax,
                lab.referenceText,
              );
              const isAbnormal = checkAbnormal(
                lab.result,
                lab.referenceMin,
                lab.referenceMax,
                lab.referenceText,
              );

              return `
              ${departmentHeader}
              <tr${isAbnormal ? ' class="abnormal"' : ""}>
                <td class="test-name">
                  <div>${lab.name}</div>
                  ${lab.testCode ? `<div class="test-code">${lab.testCode}</div>` : ""}
                </td>
                <td class="result-value${isAbnormal ? " result-abnormal" : ""}">
                  ${cleanedResult}${arrow}
                </td>
                <td class="unit">${lab.unit || "—"}</td>
                <td class="reference">${referenceDisplay}</td>
                <td style="text-align: center;">${lab.method || "—"}</td>
              </tr>
              ${
                lab.conclusion
                  ? `
              <tr>
                <td colspan="5" class="conclusion-section">
                  <div class="conclusion-title">Заключение:</div>
                  <div class="conclusion-text">${lab.conclusion}</div>
                  ${lab.executedBy ? `<div class="method-info">Исполнитель: ${lab.executedBy}</div>` : ""}
                </td>
              </tr>
              `
                  : ""
              }
            `;
            })
            .join("")}
        </tbody>
      </table>
      `;
    };

    // Собираем весь контент страниц
    let pagesContent = "";

    // 1. Добавляем страницы с обычными анализами
    if (pages.length > 0) {
      pages.forEach((pageTests, pageIndex) => {
        pagesContent += `
<div class="page">
  ${createWatermark()}
  <div class="content">
    ${createHeader()}
    ${pageIndex === 0 ? '<div class="results-title">РЕЗУЛЬТАТЫ ЛАБОРАТОРНЫХ ИССЛЕДОВАНИЙ</div>' : ""}
    ${generateResultsTable(pageTests)}
    ${createFooter()}
  </div>
</div>`;
      });
    }

    // 2. Добавляем страницы с бланковыми анализами
    if (blankResults && blankResults.length > 0) {
      blankResults.forEach((blankAssignment) => {
        const blankName =
          blankAssignment.blank?.name || "Бланковое исследование";
        const blankContent =
          blankAssignment.filledContent ||
          blankAssignment.blank?.content ||
          "Содержимое не заполнено";

        pagesContent += `
<div class="page blank-page">
  ${createWatermark()}
  <div class="content">
    ${createHeader()}
    <div class="results-title">${blankName}</div>
    <div class="blank-content">
      ${blankContent}
    </div>
    ${
      blankAssignment.conclusion
        ? `
    <div class="conclusion-section">
      <div class="conclusion-title">Заключение врача-лаборанта:</div>
      <div class="conclusion-text">${blankAssignment.conclusion}</div>
      ${blankAssignment.executedBy ? `<div class="method-info">Исполнитель: ${blankAssignment.executedBy}</div>` : ""}
    </div>
    `
        : ""
    }
    ${createFooter()}
  </div>
</div>`;
      });
    }

    // Возвращаем полный HTML документ
    return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VIRUSOLOGIYA — Результаты лабораторных исследований</title>
<style>
  @page {
    size: A4;
    margin: 12mm;
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Arial', sans-serif;
    font-size: 10px;
    line-height: 1.3;
    color: #000;
    background: #fff;
  }
  
  .page {
    width: 210mm;
    min-height: 297mm;
    background: white;
    position: relative;
    page-break-after: always;
    page-break-inside: avoid;
    padding: 0;
    display: block;
  }
  
  .page:last-child {
    page-break-after: auto;
  }
  
  /* КРИТИЧНО: Для бланковых страниц отключаем min-height */
  .blank-page {
    min-height: auto;
    height: auto;
  }
  
  .watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.05;
    z-index: 0;
    pointer-events: none;
  }
  
  .watermark img {
    width: 400px;
    height: 400px;
  }
  
  .content {
    position: relative;
    z-index: 1;
    padding: 0;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 2px solid #2B7EC1;
    page-break-after: avoid;
  }
  
  .header-left {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1;
  }
  
  .logo img {
    width: 60px;
    height: 60px;
  }
  
  .header-text {
    flex: 1;
  }
  
  .company-name {
    font-size: 20px;
    font-weight: bold;
    color: #2B7EC1;
    margin-bottom: 4px;
    letter-spacing: 1px;
  }
  
  .subtitle {
    font-size: 10px;
    color: #2B7EC1;
    margin-bottom: 6px;
    text-transform: uppercase;
  }
  
  .association {
    font-size: 8px;
    color: #666;
    line-height: 1.3;
    max-width: 450px;
  }
  
  .certificate {
    display: inline-block;
    border: 1px solid #000;
    padding: 2px 8px;
    font-size: 8px;
    margin-top: 6px;
  }
  
  .header-right {
    text-align: right;
    font-size: 9px;
    line-height: 1.4;
    color: #333;
  }
  
  .patient-info {
    margin: 10px 0;
    font-size: 11px;
    page-break-after: avoid;
  }
  
  .info-row {
    display: flex;
    margin-bottom: 4px;
    border-bottom: 1px solid #E8E8E8;
    padding-bottom: 3px;
  }
  
  .info-label {
    width: 140px;
    color: #666;
    font-weight: 500;
    font-size: 11px;
  }
  
  .info-value {
    flex: 1;
    color: #000;
    font-size: 11px;
  }
  
  .results-section {
    margin: 15px 0;
  }
  
  .results-title {
    text-align: center;
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 12px;
    color: #2B7EC1;
    padding: 8px;
    border-bottom: 2px solid #2B7EC1;
    page-break-after: avoid;
  }

  .department-title {
    font-size: 11px;
    font-weight: bold;
    color: #2B7EC1;
    padding: 8px 12px !important;
    background: linear-gradient(to right, #E8F4F8, #FFFFFF) !important;
    border-left: 4px solid #2B7EC1 !important;
    border-bottom: 2px solid #2B7EC1 !important;
    text-align: left !important;
  }
  
  .results-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
    font-size: 9px;
    border: 1px solid #DDD;
    page-break-inside: auto;
  }
  
  .results-table thead {
    display: table-header-group;
  }
  
  .results-table tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
  
  .results-table th {
    background: #F8F9FA;
    border: 1px solid #CCC;
    padding: 6px 4px;
    text-align: center;
    font-weight: bold;
    font-size: 9px;
    color: #2B7EC1;
  }
  
  .results-table td {
    border: 1px solid #DDD;
    padding: 5px 4px;
    vertical-align: middle;
    font-size: 9px;
  }
  
  .test-name {
    font-weight: 500;
    font-size: 10px;
    padding-left: 8px !important;
  }
  
  .result-value {
    text-align: center;
    font-weight: bold;
    font-size: 11px;
    font-family: 'Courier New', monospace;
    padding: 5px 3px !important;
  }

  .arrow {
    display: inline-block;
    margin-left: 4px;
    font-size: 13px;
    font-weight: bold;
  }

  .arrow-up {
    color: #D32F2F;
  }

  .arrow-down {
    color: #1976D2;
  }
  
  .unit {
    text-align: center;
    font-size: 9px;
    color: #666;
    padding: 5px 3px !important;
  }
  
  .reference {
    font-size: 9px;
    color: #444;
    text-align: center;
    padding: 5px 3px !important;
  }
  
  .abnormal {
    background-color: #FFF5F5 !important;
    border-left: 3px solid #D32F2F !important;
  }
  
  .result-abnormal {
    color: #D32F2F;
    font-weight: bold;
  }
  
  .barcode {
    text-align: right;
    margin-top: 15px;
    margin-bottom: 10px;
    page-break-before: avoid;
  }

  .barcode img {
    height: 35px;
    width: auto;
  }
  
  .disclaimer {
    margin-top: 10px;
    text-align: center;
    font-size: 9px;
    color: #FF9800;
    font-style: italic;
    padding: 8px;
    background: #FFF8E1;
    border-radius: 4px;
    page-break-before: avoid;
  }
  
  .document-footer {
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid #DDD;
    text-align: center;
    font-size: 8px;
    color: #999;
    page-break-before: avoid;
  }
  
  .method-info {
    font-size: 9px;
    color: #666;
    font-style: italic;
    margin-top: 2px;
  }
  
  .conclusion-section {
    padding: 8px;
    background: #F5F9FF;
    border-left: 3px solid #2B7EC1;
    border-radius: 0 4px 4px 0;
    margin-top: 5px;
    page-break-inside: avoid;
  }
  
  .conclusion-title {
    font-weight: bold;
    font-size: 10px;
    margin-bottom: 5px;
    color: #2B7EC1;
  }
  
  .conclusion-text {
    font-size: 10px;
    line-height: 1.4;
    color: #333;
  }

  .blank-content {
    max-width: 100%;
    width: 100%;
    margin: 8px 0;
    padding: 8px;
    border-radius: 4px;
    background: #FAFAFA;
    font-size: 8px;
    overflow: visible;
    page-break-inside: auto;
  }

  .blank-content table {
    max-width: 100%;
    width: 100%;
    border-collapse: collapse;
    margin: 4px 0;
    font-size: 8px;
    table-layout: fixed;
    page-break-inside: auto;
  }

  .blank-content table th,
  .blank-content table td {
    border: 1px solid #000;
    padding: 2px 4px;
    font-size: 8px;
    line-height: 1.2;
    vertical-align: middle;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .blank-content table th {
    background: #F0F0F0;
    font-weight: bold;
    color: #2B7EC1;
  }

  /* КРИТИЧНО: Разрешаем разрывы строк в бланковых таблицах */
  .blank-content table tr {
    page-break-inside: auto;
    page-break-after: auto;
  }
  
  .blank-content table thead {
    display: table-header-group;
  }
  
  .blank-content table tbody {
    page-break-inside: auto;
  }

  .blank-content h1, .blank-content h2, .blank-content h3,
  .blank-content h4, .blank-content h5, .blank-content h6 {
    font-size: 11px;
    margin: 4px 0;
    page-break-after: avoid;
  }

  .blank-content p {
    font-size: 8px;
    margin: 4px 0;
  }

  .blank-content table tbody tr:nth-child(even) {
    background-color: #F9F9F9;
  }

  .test-code {
    font-size: 8px;
    color: #666;
    font-family: 'Courier New', monospace;
    margin-top: 2px;
  }
  
  @media print {
    body {
      background: white;
    }
    
    .page {
      margin: 0;
      padding: 0;
      width: 100%;
      page-break-after: always;
      page-break-inside: avoid;
    }

    .page:last-child {
      page-break-after: auto;
    }
    
    /* Для бланковых страниц разрешаем разрывы */
    .blank-page {
      page-break-inside: auto;
      min-height: auto;
      height: auto;
    }
    
    .watermark {
      position: absolute !important;
    }

    .results-table th {
      background: #F8F9FA !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .abnormal {
      background-color: #FFF5F5 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .results-table thead {
      display: table-header-group !important;
    }

    .results-table tr {
      page-break-inside: avoid !important;
    }

    .blank-content {
      max-width: 100% !important;
      width: 100% !important;
      page-break-inside: auto !important;
    }

    .blank-content table {
      max-width: 100% !important;
      width: 100% !important;
      page-break-inside: auto !important;
    }
    
    /* Разрешаем разрывы строк в бланковых таблицах при печати */
    .blank-content table tr {
      page-break-inside: auto !important;
      page-break-after: auto !important;
    }
    
    .blank-content table tbody {
      page-break-inside: auto !important;
    }
    
    /* Запрещаем разрывы для header и footer */
    .header,
    .patient-info,
    .results-title,
    .barcode,
    .disclaimer,
    .document-footer {
      page-break-inside: avoid !important;
    }
  }
</style>
</head>
<body>
${pagesContent}
</body>
</html>`;
  };

  if (!patientData) return <Text>Загрузка...</Text>;

  const totalDebt = cashRecords.reduce(
    (sum, record) => sum + (record.debtAmount || 0),
    0,
  );
  const totalPaid = cashRecords.reduce(
    (sum, record) => sum + (record.paidAmount || 0),
    0,
  );

  const readyTests = labResults.filter((lab) => lab.ready);
  const readyBlanks = blankAssignments.filter((b) => b.ready);
  const allSelected =
    selectedTests.length === readyTests.length && readyTests.length > 0;
  const allBlanksSelected =
    selectedBlanks.length === readyBlanks.length && readyBlanks.length > 0;

  const allSelectedItems = [...selectedAnalyses, ...selectedBlankItems];

  return (
    <Box
      minH="calc(100vh - 180px)"
      p={8}
      bg="white"
      borderRadius="16px"
      maxW="1400px"
      mx="auto"
      mb={4}
    >
      {/* Заголовок */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" pr={5}>
          Карточка пациента #{id} - {patientData.surname} {patientData.name}{" "}
          {patientData.lastName}
        </Heading>
        <HStack spacing={3}>
          <Button colorScheme="blue" onClick={() => router.push("/patients")}>
            Назад к списку
          </Button>
          <Button colorScheme="green" onClick={openAddAnalysisModal}>
            + Добавить анализы
          </Button>
          <Button colorScheme="teal" onClick={onPrintModalOpen}>
            Печать результатов
          </Button>
        </HStack>
      </Flex>

      <Divider mb={6} />

      <SimpleGrid columns={2} spacing={8} mb={8}>
        <Box p={6} borderWidth="1px" borderRadius="md" bg="blue.50">
          <Text fontSize="xl" fontWeight="bold" mb={4} color="blue.700">
            Личные данные
          </Text>
          <VStack align="stretch" spacing={3}>
            <HStack>
              <Text fontWeight="bold" w="150px">
                ФИО:
              </Text>
              <Text>
                {patientData.surname} {patientData.name} {patientData.lastName}
              </Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold" w="150px">
                Дата рождения:
              </Text>
              <Text>
                {formatDate(patientData.dateBirth)} (
                {calculateAge(patientData.dateBirth)} лет)
              </Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold" w="150px">
                Пол:
              </Text>
              <Text>{patientData.sex === 1 ? "Мужской" : "Женский"}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold" w="150px">
                Телефон:
              </Text>
              <Text>{patientData.phoneNumber || "—"}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold" w="150px">
                Email:
              </Text>
              <Text>{patientData.email || "—"}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold" w="150px">
                Адрес:
              </Text>
              <Text>{patientData.addres || "—"}</Text>
            </HStack>
          </VStack>
        </Box>

        <Box p={6} borderWidth="1px" borderRadius="md" bg="green.50">
          <Text fontSize="xl" fontWeight="bold" mb={4} color="green.700">
            Финансовая информация
          </Text>
          <VStack align="stretch" spacing={3}>
            <HStack>
              <Text fontWeight="bold" w="150px">
                Всего оплачено:
              </Text>
              <Text fontSize="xl" color="green.600" fontWeight="bold">
                {totalPaid.toLocaleString()} сум
              </Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold" w="150px">
                Текущий долг:
              </Text>
              <Text
                fontSize="xl"
                color={totalDebt > 0 ? "red.600" : "green.600"}
                fontWeight="bold"
              >
                {totalDebt.toLocaleString()} сум
              </Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold" w="150px">
                Транзакций:
              </Text>
              <Text>{cashRecords.length}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold" w="150px">
                Анализов:
              </Text>
              <Text>{labResults.length + blankAssignments.length}</Text>
            </HStack>
          </VStack>
        </Box>
      </SimpleGrid>

      {/* Табы для анализов */}
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Обычные анализы ({labResults.length})</Tab>
          <Tab>Бланковые исследования ({blankAssignments.length})</Tab>
          <Tab>История платежей ({cashRecords.length})</Tab>
        </TabList>

        <TabPanels>
          {/* Обычные анализы */}
          <TabPanel>
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="xl" fontWeight="bold">
                  Лабораторные исследования ({labResults.length})
                </Text>
                {readyTests.length > 0 && (
                  <HStack>
                    <Text fontSize="sm" color="gray.600">
                      Выбрано: {selectedTests.length} из {readyTests.length}
                    </Text>
                    <Button
                      size="sm"
                      onClick={handleSelectAll}
                      variant="outline"
                    >
                      {allSelected ? "Снять все" : "Выбрать все"}
                    </Button>
                  </HStack>
                )}
              </Flex>
              {labResults.length > 0 ? (
                <TableContainer>
                  <Table variant="striped" size="sm">
                    <Thead bg="gray.100">
                      <Tr>
                        <Th w="40px">
                          {readyTests.length > 0 && (
                            <Checkbox
                              isChecked={allSelected}
                              onChange={handleSelectAll}
                            />
                          )}
                        </Th>
                        <Th>Название</Th>
                        <Th>Результат</Th>
                        <Th>Ед. изм.</Th>
                        <Th>Норма</Th>
                        <Th>Отделение</Th>
                        <Th>Статус</Th>
                        <Th>Дата</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {labResults.map((lab) => (
                        <Tr
                          key={lab.id}
                          bg={
                            checkAbnormal(
                              lab.result,
                              lab.referenceMin,
                              lab.referenceMax,
                              lab.referenceText,
                            )
                              ? "red.50"
                              : undefined
                          }
                        >
                          <Td>
                            {lab.ready && (
                              <Checkbox
                                isChecked={selectedTests.includes(lab.id)}
                                onChange={() => handleToggleTest(lab.id)}
                              />
                            )}
                          </Td>
                          <Td>{lab.name}</Td>
                          <Td
                            fontWeight="bold"
                            color={
                              checkAbnormal(
                                lab.result,
                                lab.referenceMin,
                                lab.referenceMax,
                                lab.referenceText,
                              )
                                ? "red.600"
                                : "green.600"
                            }
                          >
                            {lab.result ? (
                              <>
                                {cleanResult(lab.result)}
                                {lab.referenceText &&
                                  lab.referenceText.startsWith("<") &&
                                  parseFloat(
                                    cleanResult(lab.result).replace(
                                      /[<>]/g,
                                      "",
                                    ),
                                  ) >=
                                    parseFloat(
                                      lab.referenceText.replace(/[<>]/g, ""),
                                    ) && <ArrowUpIcon ml={1} color="red.500" />}
                                {lab.referenceText &&
                                  lab.referenceText.startsWith(">") &&
                                  parseFloat(
                                    cleanResult(lab.result).replace(
                                      /[<>]/g,
                                      "",
                                    ),
                                  ) <=
                                    parseFloat(
                                      lab.referenceText.replace(/[<>]/g, ""),
                                    ) && (
                                    <ArrowDownIcon ml={1} color="blue.500" />
                                  )}
                                {!lab.referenceText &&
                                  lab.referenceMin &&
                                  lab.referenceMax &&
                                  !isNaN(
                                    parseFloat(cleanResult(lab.result)),
                                  ) && (
                                    <>
                                      {parseFloat(cleanResult(lab.result)) >
                                        parseFloat(lab.referenceMax) && (
                                        <ArrowUpIcon ml={1} color="red.500" />
                                      )}
                                      {parseFloat(cleanResult(lab.result)) <
                                        parseFloat(lab.referenceMin) && (
                                        <ArrowDownIcon
                                          ml={1}
                                          color="blue.500"
                                        />
                                      )}
                                    </>
                                  )}
                              </>
                            ) : (
                              "—"
                            )}
                          </Td>
                          <Td>{lab.unit || "—"}</Td>
                          <Td fontSize="xs">
                            {lab.referenceText ||
                              (lab.referenceMin !== null &&
                              lab.referenceMax !== null
                                ? `${lab.referenceMin} - ${lab.referenceMax}`
                                : lab.norma || "—")}
                          </Td>
                          <Td>
                            <Badge colorScheme="purple">{lab.department}</Badge>
                          </Td>
                          <Td>
                            {lab.ready ? (
                              <Badge colorScheme="green">Готово</Badge>
                            ) : (
                              <Badge colorScheme="yellow">В работе</Badge>
                            )}
                          </Td>
                          <Td>
                            {lab.readyDate ? formatDate(lab.readyDate) : "—"}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert status="info">
                  <AlertIcon />
                  Нет лабораторных исследований.
                </Alert>
              )}
            </Box>
          </TabPanel>

          {/* Бланковые исследования */}
          <TabPanel>
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="xl" fontWeight="bold">
                  Бланковые исследования ({blankAssignments.length})
                </Text>
                {readyBlanks.length > 0 && (
                  <HStack>
                    <Text fontSize="sm" color="gray.600">
                      Выбрано: {selectedBlanks.length} из {readyBlanks.length}
                    </Text>
                    <Button
                      size="sm"
                      onClick={handleSelectAllBlanks}
                      variant="outline"
                    >
                      {allBlanksSelected ? "Снять все" : "Выбрать все"}
                    </Button>
                  </HStack>
                )}
              </Flex>
              {blankAssignments.length > 0 ? (
                <TableContainer>
                  <Table variant="striped" size="sm">
                    <Thead bg="gray.100">
                      <Tr>
                        <Th w="40px">
                          {readyBlanks.length > 0 && (
                            <Checkbox
                              isChecked={allBlanksSelected}
                              onChange={handleSelectAllBlanks}
                            />
                          )}
                        </Th>
                        <Th>ID</Th>
                        <Th>Название</Th>
                        <Th>Отделение</Th>
                        <Th>Тип образца</Th>
                        <Th>Статус</Th>
                        <Th>Дата</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {blankAssignments.map((assignment) => (
                        <Tr key={assignment.id}>
                          <Td>
                            {assignment.ready && (
                              <Checkbox
                                isChecked={selectedBlanks.includes(
                                  assignment.id,
                                )}
                                onChange={() =>
                                  handleToggleBlank(assignment.id)
                                }
                              />
                            )}
                          </Td>
                          <Td fontWeight="bold">{assignment.id}</Td>
                          <Td>{assignment.blank?.name || "—"}</Td>
                          <Td>
                            <Badge colorScheme="purple">
                              {assignment.blank?.department || "—"}
                            </Badge>
                          </Td>
                          <Td fontSize="sm">
                            {assignment.sampleType ||
                              assignment.blank?.sampleType ||
                              "—"}
                          </Td>
                          <Td>
                            {assignment.ready ? (
                              <Badge colorScheme="green">Готово</Badge>
                            ) : (
                              <Badge colorScheme="yellow">В работе</Badge>
                            )}
                          </Td>
                          <Td>
                            {assignment.readyDate
                              ? formatDate(assignment.readyDate)
                              : "—"}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert status="info">
                  <AlertIcon />
                  Нет бланковых исследований.
                </Alert>
              )}
            </Box>
          </TabPanel>

          {/* История платежей */}
          <TabPanel>
            <Box>
              <Text fontSize="xl" fontWeight="bold" mb={4}>
                История платежей
              </Text>
              {cashRecords.length > 0 ? (
                <TableContainer>
                  <Table variant="striped" size="sm">
                    <Thead bg="gray.100">
                      <Tr>
                        <Th>Дата</Th>
                        <Th>Услуги</Th>
                        <Th>Сумма</Th>
                        <Th>Скидка</Th>
                        <Th>Оплачено</Th>
                        <Th>Долг</Th>
                        <Th>Метод</Th>
                        <Th>Статус</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {cashRecords.map((record) => (
                        <Tr key={record.id}>
                          <Td>{formatDate(record.transactionDate)}</Td>
                          <Td fontSize="xs">{record.servicesDescription}</Td>
                          <Td>{record.totalAmount?.toLocaleString()} сум</Td>
                          <Td color="red.500">
                            {record.discount?.toLocaleString()} сум
                          </Td>
                          <Td fontWeight="bold" color="green.600">
                            {record.paidAmount?.toLocaleString()} сум
                          </Td>
                          <Td
                            fontWeight="bold"
                            color={
                              record.debtAmount > 0 ? "red.600" : "green.600"
                            }
                          >
                            {record.debtAmount?.toLocaleString()} сум
                          </Td>
                          <Td>{record.paymentMethod}</Td>
                          <Td>{getStatusBadge(record.status)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              ) : (
                <Text color="gray.500" fontStyle="italic">
                  Нет записей об оплате
                </Text>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Модальное окно добавления анализов - ОБНОВЛЕНО с добавлением бланков */}
      <Modal
        isOpen={isAddAnalysisOpen}
        onClose={() => {
          setIsAddAnalysisOpen(false);
          setModalSearchTerm("");
          setSelectedDepartment(null);
          setActiveTabIndex(0);
        }}
        size="6xl"
      >
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>
            Добавление анализов и бланков пациенту: {patientData.surname}{" "}
            {patientData.name} {patientData.lastName || ""} (ID: {id})
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto">
            {/* Вкладки для выбора типа */}
            <Tabs
              variant="enclosed"
              colorScheme="blue"
              mb={4}
              index={activeTabIndex}
              onChange={setActiveTabIndex}
            >
              <TabList>
                <Tab>Стандартные анализы</Tab>
                <Tab>Бланковые исследования</Tab>
              </TabList>

              <TabPanels>
                {/* Вкладка 1: Стандартные анализы */}
                <TabPanel>
                  {/* Вкладки с отделами */}
                  <Tabs variant="enclosed" colorScheme="blue" mb={4}>
                    <TabList overflowX="auto" py={2}>
                      <Tab onClick={() => setSelectedDepartment(null)}>
                        Все анализы
                      </Tab>
                      {Array.from(
                        new Set(
                          labCategories
                            .map((cat) => cat.department)
                            .filter(Boolean),
                        ),
                      ).map((dept) => (
                        <Tab
                          key={dept}
                          onClick={() => setSelectedDepartment(dept)}
                        >
                          {dept}
                        </Tab>
                      ))}
                    </TabList>

                    <TabPanels>
                      <TabPanel>
                        {/* Все анализы */}
                        {filteredLabCategories.length > 0 ? (
                          <SimpleGrid columns={2} spacing={4}>
                            {filteredLabCategories.map((category) => (
                              <AnalysisCard
                                key={category.id}
                                category={category}
                                isSelected={selectedAnalyses.find(
                                  (a) => a.categoryId === category.id,
                                )}
                                onSelect={handleAnalysisSelect}
                              />
                            ))}
                          </SimpleGrid>
                        ) : (
                          <Alert status="info">
                            <AlertIcon />
                            Нет доступных анализов
                          </Alert>
                        )}
                      </TabPanel>

                      {/* Отдельные вкладки для каждого отдела */}
                      {Array.from(
                        new Set(
                          labCategories
                            .map((cat) => cat.department)
                            .filter(Boolean),
                        ),
                      ).map((dept) => (
                        <TabPanel key={dept}>
                          <VStack align="stretch" spacing={4}>
                            <Heading size="md" color="blue.700">
                              {dept}
                            </Heading>
                            <SimpleGrid columns={2} spacing={4}>
                              {labCategories
                                .filter(
                                  (cat) =>
                                    cat.department === dept &&
                                    cat.isActive !== false,
                                )
                                .map((category) => (
                                  <AnalysisCard
                                    key={category.id}
                                    category={category}
                                    isSelected={selectedAnalyses.find(
                                      (a) => a.categoryId === category.id,
                                    )}
                                    onSelect={handleAnalysisSelect}
                                  />
                                ))}
                            </SimpleGrid>
                          </VStack>
                        </TabPanel>
                      ))}
                    </TabPanels>
                  </Tabs>
                </TabPanel>

                {/* Вкладка 2: Бланковые исследования */}
                <TabPanel>
                  {blanks.length > 0 ? (
                    <SimpleGrid columns={2} spacing={4}>
                      {blanks.map((blank) => (
                        <BlankCard
                          key={blank.id}
                          blank={blank}
                          isSelected={selectedBlankItems.find(
                            (b) => b.id === blank.id,
                          )}
                          onSelect={handleBlankSelect}
                        />
                      ))}
                    </SimpleGrid>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      Бланки не найдены. Создайте бланки в разделе управления
                      бланками.
                    </Alert>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>

            {/* Быстрый поиск внутри модального окна */}
            <Box mb={4} position="relative">
              <Input
                placeholder="🔍 Поиск по названию или коду..."
                value={modalSearchTerm}
                onChange={(e) => setModalSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && modalSearchSuggestions.length > 0) {
                    const item = modalSearchSuggestions[0];
                    if (item.type === "analysis") {
                      handleAnalysisSelect(item);
                    } else {
                      handleBlankSelect(item);
                    }
                    setModalSearchTerm("");
                  }
                }}
              />
              {modalSearchTerm && modalSearchSuggestions.length > 0 && (
                <Box
                  position="absolute"
                  top="100%"
                  left={0}
                  right={0}
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  shadow="lg"
                  zIndex={1000}
                  maxH="200px"
                  overflowY="auto"
                >
                  {modalSearchSuggestions.map((item) => (
                    <Box
                      key={`${item.type}-${item.id}`}
                      p={2}
                      borderBottom="1px solid"
                      borderColor="gray.100"
                      cursor="pointer"
                      _hover={{
                        bg: item.type === "analysis" ? "blue.50" : "purple.50",
                      }}
                      onClick={() => {
                        if (item.type === "analysis") {
                          handleAnalysisSelect(item);
                          setActiveTabIndex(0);
                        } else {
                          handleBlankSelect(item);
                          setActiveTabIndex(1);
                        }
                        setModalSearchTerm("");
                      }}
                    >
                      <HStack justify="space-between">
                        <VStack align="start" spacing={0}>
                          <HStack>
                            <Badge
                              colorScheme={
                                item.type === "analysis" ? "blue" : "purple"
                              }
                              size="sm"
                            >
                              {item.type === "analysis" ? "Анализ" : "Бланк"}
                            </Badge>
                            <Text fontWeight="medium">{item.name}</Text>
                          </HStack>
                          <HStack spacing={2}>
                            {item.code && (
                              <Badge colorScheme="blue" size="sm">
                                {item.code}
                              </Badge>
                            )}
                            {item.department && (
                              <Badge colorScheme="purple" size="sm">
                                {item.department}
                              </Badge>
                            )}
                          </HStack>
                        </VStack>
                        <Text fontWeight="bold" color="green.600">
                          {(
                            item.basePrice ||
                            item.price ||
                            item.sum ||
                            0
                          ).toLocaleString()}{" "}
                          сум
                        </Text>
                      </HStack>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Выбранные элементы */}
            {allSelectedItems.length > 0 && (
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Выбрано ({allSelectedItems.length}):
                </Text>
                <VStack align="stretch" spacing={2}>
                  {selectedAnalyses.map((analysis) => (
                    <Card
                      key={`sel-${analysis.categoryId}`}
                      variant="outline"
                      borderColor="blue.200"
                    >
                      <CardBody>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <HStack>
                              <Badge colorScheme="blue">Анализ</Badge>
                              <Text fontWeight="medium">{analysis.name}</Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              {analysis.sampleType}
                            </Text>
                          </VStack>
                          <HStack>
                            <Text fontWeight="bold" color="green.600">
                              {analysis.price.toLocaleString()} сум
                            </Text>
                            <IconButton
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() =>
                                removeAnalysis(analysis.categoryId)
                              }
                              aria-label="Удалить"
                            />
                          </HStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}

                  {selectedBlankItems.map((blank) => (
                    <Card
                      key={`sel-blank-${blank.id}`}
                      variant="outline"
                      borderColor="purple.200"
                    >
                      <CardBody>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <HStack>
                              <Badge colorScheme="purple">Бланк</Badge>
                              <Text fontWeight="medium">{blank.name}</Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              {blank.sampleType}
                            </Text>
                          </VStack>
                          <HStack>
                            <Text fontWeight="bold" color="green.600">
                              {blank.price.toLocaleString()} сум
                            </Text>
                            <IconButton
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => removeBlank(blank.id)}
                              aria-label="Удалить"
                            />
                          </HStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <VStack align="stretch" spacing={4} w="100%">
              {/* Оплата */}
              <Divider />
              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>Способ оплаты</FormLabel>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="cash">💵 Наличные</option>
                    <option value="card">💳 Карта</option>
                    <option value="transfer">🏦 Перевод</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Оплачено сейчас</FormLabel>
                  <Input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPaidAmount(value);
                    }}
                    placeholder="0"
                  />
                  <HStack mt={2}>
                    <Button
                      size="xs"
                      colorScheme="teal"
                      onClick={() => setPaidAmount(finalAmount.toString())}
                    >
                      Оплатить полностью
                    </Button>
                    <Button
                      size="xs"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => setPaidAmount("")}
                    >
                      Сбросить
                    </Button>
                  </HStack>
                </FormControl>
              </SimpleGrid>

              {/* Итоги */}
              <Box p={4} bg="gray.50" borderRadius="md">
                <SimpleGrid columns={3} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Общая сумма:
                    </Text>
                    <Text fontSize="xl" fontWeight="bold">
                      {totalAmount.toLocaleString()} сум
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      К оплате:
                    </Text>
                    <Text fontSize="xl" fontWeight="bold" color="green.600">
                      {finalAmount.toLocaleString()} сум
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Долг:
                    </Text>
                    <Text
                      fontSize="xl"
                      fontWeight="bold"
                      color={debtAmount > 0 ? "red.600" : "green.600"}
                    >
                      {debtAmount.toLocaleString()} сум
                    </Text>
                  </Box>
                </SimpleGrid>
                <HStack mt={3} spacing={4} fontSize="sm">
                  <Box>
                    <Text color="gray.600">
                      Анализов: {selectedAnalyses.length}
                    </Text>
                  </Box>
                  <Box>
                    <Text color="gray.600">
                      Бланков: {selectedBlankItems.length}
                    </Text>
                  </Box>
                </HStack>
              </Box>

              <HStack justify="space-between">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsAddAnalysisOpen(false);
                    setModalSearchTerm("");
                    setSelectedDepartment(null);
                    setActiveTabIndex(0);
                  }}
                >
                  Отмена
                </Button>
                <HStack>
                  <Badge colorScheme="blue" p={2}>
                    Выбрано: {allSelectedItems.length}
                  </Badge>
                  <Button
                    colorScheme="blue"
                    onClick={handleAddAnalyses}
                    isDisabled={allSelectedItems.length === 0}
                    isLoading={loading}
                  >
                    Добавить ({allSelectedItems.length})
                  </Button>
                </HStack>
              </HStack>
            </VStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальное окно для выбора анализов для печати */}
      <Modal isOpen={isPrintModalOpen} onClose={onPrintModalClose} size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Выбор результатов для печати</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={6}>
              {/* Обычные анализы */}
              {readyTests.length > 0 && (
                <Box>
                  <Flex justify="space-between" align="center" mb={3}>
                    <Text fontSize="lg" fontWeight="bold" color="blue.700">
                      Обычные анализы ({readyTests.length})
                    </Text>
                    <Button
                      size="sm"
                      onClick={handleSelectAll}
                      variant="outline"
                    >
                      {allSelected ? "Снять все" : "Выбрать все"}
                    </Button>
                  </Flex>
                  <VStack align="stretch" spacing={2}>
                    {readyTests.map((lab) => (
                      <Card
                        key={lab.id}
                        variant="outline"
                        borderColor={
                          selectedTests.includes(lab.id)
                            ? "blue.500"
                            : "gray.200"
                        }
                        bg={
                          selectedTests.includes(lab.id) ? "blue.50" : "white"
                        }
                      >
                        <CardBody p={3}>
                          <HStack justify="space-between">
                            <Checkbox
                              isChecked={selectedTests.includes(lab.id)}
                              onChange={() => handleToggleTest(lab.id)}
                            >
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="medium">{lab.name}</Text>
                                <HStack
                                  spacing={3}
                                  fontSize="sm"
                                  color="gray.600"
                                >
                                  <Badge colorScheme="purple">
                                    {lab.department}
                                  </Badge>
                                  <Text>
                                    Результат: {cleanResult(lab.result)}{" "}
                                    {lab.unit || ""}
                                  </Text>
                                  {checkAbnormal(
                                    lab.result,
                                    lab.referenceMin,
                                    lab.referenceMax,
                                    lab.referenceText,
                                  ) && (
                                    <Badge colorScheme="red">Отклонение</Badge>
                                  )}
                                </HStack>
                              </VStack>
                            </Checkbox>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </Box>
              )}

              {/* Бланковые исследования */}
              {readyBlanks.length > 0 && (
                <Box>
                  <Flex justify="space-between" align="center" mb={3}>
                    <Text fontSize="lg" fontWeight="bold" color="purple.700">
                      Бланковые исследования ({readyBlanks.length})
                    </Text>
                    <Button
                      size="sm"
                      onClick={handleSelectAllBlanks}
                      variant="outline"
                    >
                      {allBlanksSelected ? "Снять все" : "Выбрать все"}
                    </Button>
                  </Flex>
                  <VStack align="stretch" spacing={2}>
                    {readyBlanks.map((blank) => (
                      <Card
                        key={blank.id}
                        variant="outline"
                        borderColor={
                          selectedBlanks.includes(blank.id)
                            ? "purple.500"
                            : "gray.200"
                        }
                        bg={
                          selectedBlanks.includes(blank.id)
                            ? "purple.50"
                            : "white"
                        }
                      >
                        <CardBody p={3}>
                          <HStack justify="space-between">
                            <Checkbox
                              isChecked={selectedBlanks.includes(blank.id)}
                              onChange={() => handleToggleBlank(blank.id)}
                            >
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="medium">
                                  {blank.blank?.name || "—"}
                                </Text>
                                <HStack
                                  spacing={3}
                                  fontSize="sm"
                                  color="gray.600"
                                >
                                  <Badge colorScheme="purple">
                                    {blank.blank?.department || "—"}
                                  </Badge>
                                  <Text>
                                    {blank.sampleType ||
                                      blank.blank?.sampleType ||
                                      "—"}
                                  </Text>
                                </HStack>
                              </VStack>
                            </Checkbox>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </Box>
              )}

              {readyTests.length === 0 && readyBlanks.length === 0 && (
                <Alert status="info">
                  <AlertIcon />
                  <AlertDescription>
                    Нет готовых результатов для печати. Дождитесь завершения
                    анализов.
                  </AlertDescription>
                </Alert>
              )}

              {/* Информация о выборе */}
              {(selectedTests.length > 0 || selectedBlanks.length > 0) && (
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Text fontWeight="bold" mb={2}>
                    Выбрано для печати:
                  </Text>
                  <HStack spacing={4}>
                    {selectedTests.length > 0 && (
                      <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                        Анализов: {selectedTests.length}
                      </Badge>
                    )}
                    {selectedBlanks.length > 0 && (
                      <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                        Бланков: {selectedBlanks.length}
                      </Badge>
                    )}
                  </HStack>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPrintModalClose}>
              Отмена
            </Button>
            <Button
              colorScheme="teal"
              onClick={() => {
                handlePrint();
                onPrintModalClose();
              }}
              isDisabled={
                selectedTests.length === 0 && selectedBlanks.length === 0
              }
            >
              Печать ({selectedTests.length + selectedBlanks.length})
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
