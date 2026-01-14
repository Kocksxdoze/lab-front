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
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getApiBaseUrl } from "../../utils/api";
import {
  DeleteIcon,
  SearchIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@chakra-ui/icons";

export default function PatientPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patientData, setPatientData] = useState(null);
  const [labResults, setLabResults] = useState([]);
  const [blankAssignments, setBlankAssignments] = useState([]);
  const [cashRecords, setCashRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sampleType, setSampleType] = useState("Кровь (сыворотка)");
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
  const [paidAmount, setPaidAmount] = useState(0);

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
                `${api}/lab-category/${lab.categoryId}`
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
          })
        );

        setLabResults(labsWithCategories);
      }

      const blankAssignmentsResponse = await fetch(
        `${api}/blank-assignments/client/${id}`
      );
      if (blankAssignmentsResponse.ok) {
        const assignments = await blankAssignmentsResponse.json();
        const assignmentsWithDetails = await Promise.all(
          assignments.map(async (assignment) => {
            try {
              const blankResponse = await fetch(
                `${api}/blank/${assignment.blankId}`
              );
              const blank = blankResponse.ok
                ? await blankResponse.json()
                : null;
              return { ...assignment, blank };
            } catch (err) {
              return assignment;
            }
          })
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
      ].slice(0, 8)
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
      prev.filter((a) => a.categoryId !== categoryId)
    );
  };

  const removeBlank = (blankId) => {
    setSelectedBlankItems((prev) => prev.filter((b) => b.id !== blankId));
  };

  const calculateTotals = () => {
    const analysisTotal = selectedAnalyses.reduce(
      (sum, a) => sum + (parseInt(a.price) || 0),
      0
    );
    const blankTotal = selectedBlankItems.reduce(
      (sum, b) => sum + (parseInt(b.price) || 0),
      0
    );
    const totalAmount = analysisTotal + blankTotal;
    const finalAmount = totalAmount;
    const debtAmount = Math.max(0, finalAmount - paidAmount);

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
        paidAmount,
        debtAmount,
        paymentMethod,
        servicesDescription,
        labAnalyses: selectedAnalyses.map((a) => a.categoryId),
        blanks: selectedBlankItems.map((b) => b.id),
        status: debtAmount === 0 ? "paid" : paidAmount > 0 ? "partial" : "debt",
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
      setPaidAmount(0);
      setSearchAnalysisTerm("");

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
        : [...prev, testId]
    );
  };

  const handleToggleBlank = (blankId) => {
    setSelectedBlanks((prev) =>
      prev.includes(blankId)
        ? prev.filter((id) => id !== blankId)
        : [...prev, blankId]
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
      selectedTests.includes(lab.id)
    );
    const selectedBlankResults = blankAssignments.filter((blank) =>
      selectedBlanks.includes(blank.id)
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
      selectedBlankResults
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

    // Стандартная проверка числового диапазона
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

  // Функция для очистки результата от лишних нулей
  // Функция для очистки результата - СОХРАНЯЕМ дробную часть
  const cleanResult = (result) => {
    if (!result) return "—";

    const resultStr = String(result).trim();

    // Если содержит операторы < или >, оставляем как есть
    if (resultStr.includes("<") || resultStr.includes(">")) {
      return resultStr;
    }

    // Пробуем распарсить как число
    const numResult = parseFloat(resultStr);
    if (!isNaN(numResult)) {
      // Сохраняем дробную часть, убирая только незначащие нули
      if (Number.isInteger(numResult)) {
        return numResult.toString(); // Целое число
      } else {
        // Сохраняем до 4 знаков после запятой, убирая незначащие нули
        return parseFloat(numResult.toFixed(4)).toString();
      }
    }

    return resultStr;
  };

  // Функция для группировки анализов по категориям для лучшей организации
  const groupResultsByCategory = (results) => {
    const groups = {};

    // Список тестов, которые должны быть вместе
    const relatedTests = {
      // Печеночные пробы
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

      // Почечные пробы
      Креатинин: ["Мочевина", "Мочевая кислота"],
      Мочевина: ["Креатинин", "Мочевая кислота"],

      // Липидный профиль
      "Холестерин общий": [
        "Холестерин ЛПВП",
        "Холестерин ЛПНП",
        "Триглицериды",
      ],
      "Холестерин ЛПВП": ["Холестерин ЛПНП", "Холестерин общий"],

      // Гормоны щитовидной железы
      ТТГ: ["Т3 свободный", "Т4 свободный"],
      "Т3 свободный": ["Т4 свободный", "ТТГ"],
      "Т4 свободный": ["Т3 свободный", "ТТГ"],

      // Общий анализ крови
      Гемоглобин: ["Эритроциты", "Лейкоциты", "Тромбоциты", "Гематокрит"],
      Лейкоциты: [
        "Нейтрофилы",
        "Лимфоциты",
        "Моноциты",
        "Эозинофилы",
        "Базофилы",
      ],
    };

    // Сначала создаем группы для связанных тестов
    results.forEach((lab) => {
      const testName = lab.name.trim();
      let groupFound = false;

      // Ищем, есть ли этот тест в списке связанных
      for (const [key, relatedList] of Object.entries(relatedTests)) {
        if (relatedList.includes(testName) || testName === key) {
          if (!groups[key]) {
            groups[key] = [];
          }
          // Проверяем, нет ли уже этого теста в группе
          if (!groups[key].some((item) => item.name === lab.name)) {
            groups[key].push(lab);
          }
          groupFound = true;
          break;
        }
      }

      // Если тест не связан с другими, создаем отдельную группу
      if (!groupFound) {
        groups[testName] = [lab];
      }
    });

    return groups;
  };

  // Обновленная функция generatePrintContent с улучшенной группировкой
  const generatePrintContent = (results, blankResults) => {
    const fio = `${patientData.surname || ""} ${patientData.name || ""} ${
      patientData.lastName || ""
    }`.trim();
    const birthDate = formatDate(patientData.dateBirth);
    const age = calculateAge(patientData.dateBirth);
    const today = new Date().toLocaleDateString("ru-RU");

    // Группируем результаты по связанным тестам
    const groupedResults = groupResultsByCategory(results);

    // Группируем также по отделениям для заголовков
    const departmentGroups = results.reduce((acc, lab) => {
      const dept = lab.department || "Общие анализы";
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(lab);
      return acc;
    }, {});

    return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VIRUSOLOGIYA — Результаты лабораторных исследований</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, sans-serif;
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
    }
    
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.05;
      z-index: 0;
      pointer-events: none;
    }
    
    .watermark img {
      width: 450px;
      height: 450px;
    }
    
    .content {
      position: relative;
      z-index: 1;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 2px solid #2B7EC1;
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
      font-size: 9px;
      color: #2B7EC1;
      margin-bottom: 6px;
      text-transform: uppercase;
    }
    
    .association {
      font-size: 7px;
      color: #666;
      line-height: 1.3;
      max-width: 400px;
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
      font-size: 8px;
      line-height: 1.5;
      color: #333;
    }
    
    .patient-info {
      margin: 15px 0;
      font-size: 9px;
    }
    
    .info-row {
      display: flex;
      margin-bottom: 6px;
      border-bottom: 1px solid #E8E8E8;
      padding-bottom: 4px;
    }
    
    .info-label {
      width: 130px;
      color: #666;
      font-weight: 500;
    }
    
    .info-value {
      flex: 1;
      color: #000;
    }
    
    .results-section {
      margin: 20px 0;
    }
    
    .results-title {
      text-align: center;
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #2B7EC1;
    }

    .department-title {
      font-size: 11px;
      font-weight: bold;
      color: #2B7EC1;
      margin: 20px 0 10px 0;
      padding: 6px 10px;
      background: linear-gradient(to right, #F0F0F0, #FFFFFF);
      border-left: 4px solid #2B7EC1;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .results-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
      font-size: 9px;
      border: 1px solid #DDD;
    }
    
    .results-table th {
      background: #F8F9FA;
      border: 1px solid #CCC;
      padding: 7px 5px;
      text-align: center;
      font-weight: bold;
      font-size: 9px;
      color: #2B7EC1;
    }
    
    .results-table td {
      border: 1px solid #DDD;
      padding: 6px 5px;
      vertical-align: middle;
    }
    
    .test-name {
      font-weight: 500;
      font-size: 9.5px;
      padding-left: 8px !important;
    }
    
    .result-value {
      text-align: center;
      font-weight: bold;
      font-size: 10.5px;
      font-family: 'Courier New', monospace;
      padding: 6px 3px !important;
    }

    .arrow {
      display: inline-block;
      margin-left: 4px;
      font-size: 13px;
      font-weight: bold;
      position: relative;
      top: 1px;
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
      padding: 6px 3px !important;
    }
    
    .reference {
      font-size: 9px;
      color: #444;
      text-align: center;
      padding: 6px 3px !important;
      font-family: 'Arial', sans-serif;
    }
    
    .abnormal {
      background-color: #FFF5F5 !important;
      border-left: 3px solid #D32F2F !important;
    }
    
    .result-abnormal {
      color: #D32F2F;
      font-weight: bold;
    }
    
    .footer-section {
      margin-top: 30px;
    }
    
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 25px;
    }
    
    .signature-block {
      width: 45%;
      text-align: center;
    }
    
    .signature-line {
      margin-top: 40px;
      padding-top: 4px;
      border-top: 1px solid #000;
      font-size: 9px;
    }
    
    .barcode {
      text-align: right;
      margin-top: 15px;
      margin-bottom: 12px;
    }

    .barcode img {
      height: 35px;
      width: auto;
    }
    
    .disclaimer {
      margin-top: 12px;
      text-align: center;
      font-size: 8px;
      color: #FF9800;
      font-style: italic;
      padding: 8px;
      background: #FFF8E1;
      border-radius: 4px;
    }
    
    .document-footer {
      margin-top: 15px;
      padding-top: 8px;
      border-top: 1px solid #DDD;
      text-align: center;
      font-size: 7px;
      color: #999;
    }
    
    .method-info {
      font-size: 8px;
      color: #666;
      font-style: italic;
      margin-top: 2px;
    }
    
    .conclusion-section {
      margin-top: 15px;
      padding: 10px;
      background: #F5F9FF;
      border-left: 3px solid #2B7EC1;
      border-radius: 0 4px 4px 0;
    }
    
    .conclusion-title {
      font-weight: bold;
      font-size: 10px;
      margin-bottom: 6px;
      color: #2B7EC1;
    }
    
    .conclusion-text {
      font-size: 9.5px;
      line-height: 1.4;
      color: #333;
    }

    .blank-section {
      margin: 25px 0;
      page-break-inside: avoid;
    }

    .blank-title {
      font-size: 12px;
      font-weight: bold;
      color: #2B7EC1;
      margin-bottom: 12px;
      padding: 8px 12px;
      background: linear-gradient(to right, #F0F0F0, #FFFFFF);
      border-left: 4px solid #2B7EC1;
    }

    .blank-content {
      margin: 15px 0;
      padding: 10px;
      border: 1px solid #E0E0E0;
      border-radius: 4px;
      background: #FAFAFA;
    }

    .blank-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }

    .blank-content table th,
    .blank-content table td {
      border: 1px solid #000;
      padding: 8px;
      font-size: 9.5px;
    }

    .blank-content table th {
      background: #F0F0F0;
      font-weight: bold;
      color: #2B7EC1;
    }

    .test-group-header {
      background: #F0F8FF !important;
      font-weight: bold !important;
      color: #2B7EC1 !important;
      border-bottom: 2px solid #2B7EC1 !important;
    }

    .test-group-spacer {
      height: 5px;
      background: #FAFAFA;
    }

    .related-tests-group {
      margin-bottom: 20px;
      border: 1px solid #E0E0E0;
      border-radius: 6px;
      overflow: hidden;
    }

    .related-tests-title {
      background: linear-gradient(to right, #2B7EC1, #4A90E2);
      color: white;
      padding: 8px 12px;
      font-size: 10.5px;
      font-weight: bold;
      margin: 0;
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
        width: 100%;
      }
      
      .watermark {
        position: fixed !important;
      }

      .results-table th {
        background: #F8F9FA !important;
        -webkit-print-color-adjust: exact;
      }

      .abnormal {
        background-color: #FFF5F5 !important;
        -webkit-print-color-adjust: exact;
      }

      .test-group-header {
        background: #F0F8FF !important;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="watermark">
      <img src="/lab.svg" alt="Laboratory Federation Logo">
    </div>
    
    <div class="content">
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
      
      ${
        results.length > 0
          ? `
      <div class="results-section">
        <div class="results-title">РЕЗУЛЬТАТЫ ЛАБОРАТОРНЫХ ИССЛЕДОВАНИЙ</div>
        
        ${Object.entries(departmentGroups)
          .map(([department, deptResults]) => {
            // Группируем тесты внутри отделения
            const groupedDeptResults = groupResultsByCategory(deptResults);

            return `
                <div class="department-title">${department}</div>
                
                ${Object.entries(groupedDeptResults)
                  .map(([groupName, groupTests]) => {
                    // Если в группе несколько тестов - это связанные тесты
                    if (groupTests.length > 1) {
                      return `
                        <div class="related-tests-group">
                          <div class="related-tests-title">${groupName} и связанные показатели</div>
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
                              ${groupTests
                                .map((lab) => {
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

                                  // Очищаем результат (сохраняем дробную часть)
                                  const cleanedResult = cleanResult(lab.result);

                                  // Определяем стрелку отклонения
                                  const arrow = getArrow(
                                    lab.result,
                                    lab.referenceMin,
                                    lab.referenceMax,
                                    lab.referenceText
                                  );

                                  // Проверяем отклонение
                                  const isAbnormal = checkAbnormal(
                                    lab.result,
                                    lab.referenceMin,
                                    lab.referenceMax,
                                    lab.referenceText
                                  );

                                  return `
                                    <tr${isAbnormal ? ' class="abnormal"' : ""}>
                                      <td class="test-name">
                                        <div>${lab.name}</div>
                                        ${
                                          lab.testCode
                                            ? `<div class="test-code">${lab.testCode}</div>`
                                            : ""
                                        }
                                      </td>
                                      <td class="result-value${
                                        isAbnormal ? " result-abnormal" : ""
                                      }">
                                        ${cleanedResult}${arrow}
                                      </td>
                                      <td class="unit">${lab.unit || "—"}</td>
                                      <td class="reference">${referenceDisplay}</td>
                                      <td style="font-size: 9px; text-align: center;">
                                        ${lab.method || "—"}
                                      </td>
                                    </tr>
                                    ${
                                      lab.conclusion
                                        ? `
                                    <tr>
                                      <td colspan="5" style="padding: 8px; background: #F5F9FF;">
                                        <div class="conclusion-title">Заключение врача-лаборанта:</div>
                                        <div class="conclusion-text">${
                                          lab.conclusion
                                        }</div>
                                        ${
                                          lab.executedBy
                                            ? `<div class="method-info" style="margin-top: 4px;">Исполнитель: ${lab.executedBy}</div>`
                                            : ""
                                        }
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
                        </div>
                      `;
                    } else {
                      // Одиночные тесты
                      const lab = groupTests[0];
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
                        lab.referenceText
                      );
                      const isAbnormal = checkAbnormal(
                        lab.result,
                        lab.referenceMin,
                        lab.referenceMax,
                        lab.referenceText
                      );

                      return `
                        <table class="results-table" style="margin-bottom: 15px;">
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
                            <tr${isAbnormal ? ' class="abnormal"' : ""}>
                              <td class="test-name">
                                <div>${lab.name}</div>
                                ${
                                  lab.testCode
                                    ? `<div class="test-code">${lab.testCode}</div>`
                                    : ""
                                }
                              </td>
                              <td class="result-value${
                                isAbnormal ? " result-abnormal" : ""
                              }">
                                ${cleanedResult}${arrow}
                              </td>
                              <td class="unit">${lab.unit || "—"}</td>
                              <td class="reference">${referenceDisplay}</td>
                              <td style="font-size: 9px; text-align: center;">
                                ${lab.method || "—"}
                              </td>
                            </tr>
                            ${
                              lab.conclusion
                                ? `
                            <tr>
                              <td colspan="5" style="padding: 8px; background: #F5F9FF;">
                                <div class="conclusion-title">Заключение врача-лаборанта:</div>
                                <div class="conclusion-text">${
                                  lab.conclusion
                                }</div>
                                ${
                                  lab.executedBy
                                    ? `<div class="method-info" style="margin-top: 4px;">Исполнитель: ${lab.executedBy}</div>`
                                    : ""
                                }
                              </td>
                            </tr>
                            `
                                : ""
                            }
                          </tbody>
                        </table>
                      `;
                    }
                  })
                  .join("")}
              `;
          })
          .join("")}
      </div>
      `
          : ""
      }

      ${
        blankResults.length > 0
          ? blankResults
              .map(
                (blankAssignment) => `
        <div class="blank-section">
          <div class="blank-title">${
            blankAssignment.blank?.name || "Бланковое исследование"
          }</div>
          <div class="blank-content">
            ${
              blankAssignment.filledContent ||
              blankAssignment.blank?.content ||
              "Содержимое не заполнено"
            }
          </div>
          ${
            blankAssignment.conclusion
              ? `
            <div class="conclusion-section">
              <div class="conclusion-title">Заключение врача-лаборанта:</div>
              <div class="conclusion-text">${blankAssignment.conclusion}</div>
              ${
                blankAssignment.executedBy
                  ? `
                <div class="method-info" style="margin-top: 4px;">Исполнитель: ${blankAssignment.executedBy}</div>
              `
                  : ""
              }
            </div>
          `
              : ""
          }
        </div>
      `
              )
              .join("")
          : ""
      }
      
      <div class="barcode">
        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyIiBoZWlnaHQ9IjQwIi8+PHJlY3QgeD0iNCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iNDAiLz48cmVjdCB4PSI4IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjEzIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjE2IiB5PSIwIiB3aWR0aD0iMiIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjIwIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjI0IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjI5IiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjMyIiB5PSIwIiB3aWR0aD0iMiIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjM2IiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjQwIiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjQ1IiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjQ4IiB5PSIwIiB3aWR0aD0iMiIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjUyIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjU2IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjYxIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjY0IiB5PSIwIiB3aWR0aD0iMiIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjY4IiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjcyIiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9Ijc3IiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjgwIiB5PSIwIiB3aWR0aD0iMiIgaGVpZht0PSI0MCIvPjxyZWN0IHg9Ijg0IiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9Ijg4IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjkzIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9Ijk2IiB5PSIwIiB3aWR0aD0iMiIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjEwMCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iNDAiLz48cmVjdCB4PSIxMDQiIHk9IjAiIHdpZHRoPSIzIiBoZWlnaHQ9IjQwIi8+PHJlY3QgeD0iMTA5IiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjExMiIgeT0iMCIgd2lkdGg9IjIiIGhlaWdodD0iNDAiLz48cmVjdCB4PSIxMTYiIHk9IjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjQwIi8+PHJlY3QgeD0iMTIwIiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjEyNSIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iNDAiLz48cmVjdCB4PSIxMjgiIHk9IjAiIHdpZHRoPSIyIiBoZWlnaHQ9IjQwIi8+PHJlY3QgeD0iMTMyIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjEzNiIgeT0iMCIgd2lkdGg9IjMiIGhlaWdodD0iNDAiLz48cmVjdCB4PSIxNDEiIHk9IjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjQwIi8+PHJlY3QgeD0iMTQ0IiB5PSIwIiB3aWR0aD0iMiIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjE0OCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iNDAiLz48cmVjdCB4PSIxNTIiIHk9IjAiIHdpZHRoPSIzIiBoZWlnaHQ9IjQwIi8+PHJlY3QgeD0iMTU3IiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjE2MCIgeT0iMCIgd2lkdGg9IjIiIGhlaWdodD0iNDAiLz48cmVjdCB4PSIxNjQiIHk9IjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjQwIi8+PHJlY3QgeD0iMTY4IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjE3MyIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iNDAiLz48cmVjdCB4PSIxNzYiIHk9IjAiIHdpZHRoPSIyIiBoZWlnaHQ9IjQwIi8+PHJlY3QgeD0iMTgwIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjE4NCIgeT0iMCIgd2lkdGgPSIzIiBoZWlnaHQ9IjQwIi8+PHJlY3QgeD0iMTg5IiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIvPjxyZWN0IHg9IjE5MiIgeT0iMCIgd2lkdGg9IjIiIGhlaWdodD0iNDAiLz48dGV4dCB4PSIxMjUiIHk9IjQ4IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+MjQxNjIwMjQtNTEwMDE5MjUtMjAyNDEyMDwvdGV4dD48L3N2Zz4=" alt="Barcode">
      </div>
      
      <div class="disclaimer">
         Результаты исследований не являются диагнозом, необходима консультация специалиста.
      </div>
      
      <div class="document-footer">
        <div>ООО «VIRUSOLOGIYA» • 150100, г. Фергана, Пахлавон Махмуд 23 • Тел: +99895-023-47-03 • e-mail: @Virusologiya_bot</div>
        <div>Все права защищены © ${new Date().getFullYear()}</div>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  };

  if (!patientData) return <Text>Загрузка...</Text>;

  const totalDebt = cashRecords.reduce(
    (sum, record) => sum + (record.debtAmount || 0),
    0
  );
  const totalPaid = cashRecords.reduce(
    (sum, record) => sum + (record.paidAmount || 0),
    0
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
                        <Th>Референтные значения</Th>
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
                              lab.referenceText
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
                                lab.referenceText
                              )
                                ? "red.600"
                                : "green.600"
                            }
                          >
                            {lab.result ? (
                              <>
                                {cleanResult(lab.result)}
                                {lab.referenceMin &&
                                  lab.referenceMax &&
                                  !isNaN(parseFloat(lab.result)) && (
                                    <>
                                      {parseFloat(lab.result) >
                                        parseFloat(lab.referenceMax) && (
                                        <ArrowUpIcon ml={1} color="red.500" />
                                      )}
                                      {parseFloat(lab.result) <
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
                                  assignment.id
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

      {/* Модальное окно добавления анализов */}
      <Modal
        isOpen={isAddAnalysisOpen}
        onClose={() => setIsAddAnalysisOpen(false)}
        size="4xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Добавление анализов пациенту: {patientData.surname}{" "}
            {patientData.name} {patientData.lastName || ""} (ID: {id})
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              {/* Поиск */}
              <Box>
                <Input
                  placeholder="🔍 Поиск анализов и бланков..."
                  value={searchAnalysisTerm}
                  onChange={(e) => handleAnalysisSearch(e.target.value)}
                  size="lg"
                />

                {searchAnalysisTerm.length >= 2 &&
                  filteredCategories.length > 0 && (
                    <Box mt={2} p={3} bg="gray.50" borderRadius="md">
                      <Text fontSize="sm" fontWeight="bold" mb={2}>
                        Результаты поиска:
                      </Text>
                      <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                        {filteredCategories.map((item) => (
                          <Card
                            key={`${item.type}-${item.id}`}
                            size="sm"
                            cursor="pointer"
                            onClick={() => handleSuggestionClick(item)}
                            _hover={{
                              bg:
                                item.type === "analysis"
                                  ? "blue.50"
                                  : "purple.50",
                            }}
                            borderColor={
                              item.type === "analysis"
                                ? "blue.200"
                                : "purple.200"
                            }
                            borderWidth="1px"
                          >
                            <CardBody p={2}>
                              <HStack justify="space-between">
                                <VStack align="start" spacing={0}>
                                  <Badge
                                    colorScheme={
                                      item.type === "analysis"
                                        ? "blue"
                                        : "purple"
                                    }
                                    fontSize="xs"
                                  >
                                    {item.type === "analysis"
                                      ? "Анализ"
                                      : "Бланк"}{" "}
                                    • {item.code || item.id}
                                  </Badge>
                                  <Text fontSize="sm" fontWeight="medium">
                                    {item.name}
                                  </Text>
                                </VStack>
                                <Text
                                  fontSize="sm"
                                  fontWeight="bold"
                                  color="green.600"
                                >
                                  {(
                                    item.basePrice ||
                                    item.price ||
                                    item.sum ||
                                    0
                                  ).toLocaleString()}{" "}
                                  сум
                                </Text>
                              </HStack>
                            </CardBody>
                          </Card>
                        ))}
                      </Grid>
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
                                🧪 {analysis.sampleType}
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
                                🧪 {blank.sampleType}
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
                    onChange={(e) =>
                      setPaidAmount(parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                  />
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
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setIsAddAnalysisOpen(false)}
            >
              Отмена
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleAddAnalyses}
              isDisabled={allSelectedItems.length === 0}
              isLoading={loading}
            >
              Добавить ({allSelectedItems.length})
            </Button>
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
                                    lab.referenceText
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
