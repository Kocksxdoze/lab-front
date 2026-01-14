"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Box,
  Flex,
  Input,
  Button,
  Text,
  Heading,
  Radio,
  Checkbox,
  RadioGroup,
  Stack,
  Select,
  useToast,
  VStack,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  SimpleGrid,
  FormControl,
  FormLabel,
  Textarea,
  Divider,
  Badge,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  DeleteIcon,
  InfoIcon,
  SearchIcon,
  CheckIcon,
  AddIcon,
} from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { getApiBaseUrl } from "../../utils/api";

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

function RegisterPage() {
  // Добавляем функцию капитализации в самом начале компонента, после импортов
  const capitalizeString = (str) => {
    if (!str) return str;
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formRef = useRef({});
  const [sex, setSex] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [promoCodes, setPromoCodes] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [partners, setPartners] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [labCategories, setLabCategories] = useState([]);
  const [blanks, setBlanks] = useState([]);
  const [selectedAnalyses, setSelectedAnalyses] = useState([]);
  const [selectedBlanks, setSelectedBlanks] = useState([]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [modalSearchSuggestions, setModalSearchSuggestions] = useState([]);
  const searchInputRef = useRef(null);
  const router = useRouter();
  const toast = useToast();
  const api = getApiBaseUrl();

  // Добавляем состояние для полей формы для отображения в реальном времени
  const [formFields, setFormFields] = useState({
    surname: "",
    name: "",
    lastName: "",
    addres: "",
    work: "",
    phoneNumber: "",
    email: "",
    dateBirth: "",
  });

  const {
    isOpen: isLabOpen,
    onOpen: onLabOpen,
    onClose: onLabClose,
  } = useDisclosure();

  const {
    isOpen: isBlankOpen,
    onOpen: onBlankOpen,
    onClose: onBlankClose,
  } = useDisclosure();

  // Медицинские сокращения
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
    лг: "лютеинизирующий гормон",
    фсг: "фолликулостимулирующий гормон",
    прол: "пролактин",
    тест: "тестостерон",
    эстр: "эстрадиол",
    корт: "кортизол",
    he4: "he4",
    ca125: "ca 125",
    psa: "psa",
    пса: "psa",
    вну: "вич",
    спид: "вич",
    гепа: "гепатит",
    геп: "гепатит",
    сиф: "сифилис",
    рпр: "rpr",
    алт: "alat",
    аст: "asat",
    креат: "креатинин",
    мочев: "мочевина",
    билир: "билирубин",
    холест: "холестерин",
    холес: "холестерин",
    липид: "липидный",
    вит: "витамин",
    "вит д": "витамин d",
    д3: "витамин d",
    "вит в": "витамин b",
    в12: "витамин b12",
    анал: "анализ",
    исслед: "исследование",
    диаг: "диагностика",
    скрин: "скрининг",
    панель: "панель",
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [promos, bens, labs, blanksData, partnersData] =
          await Promise.all([
            fetch(`${api}/promocodes`).then((r) => r.json()),
            fetch(`${api}/benefits`).then((r) => r.json()),
            fetch(`${api}/lab-categories`).then((r) => r.json()),
            fetch(`${api}/blanks`).then((r) => r.json()),
            fetch(`${api}/partners`).then((r) => r.json()),
          ]);

        setPromoCodes(Array.isArray(promos) ? promos : []);
        setBenefits(Array.isArray(bens) ? bens : []);
        setLabCategories(Array.isArray(labs) ? labs : []);
        setBlanks(
          Array.isArray(blanksData) ? blanksData.filter((b) => b.isActive) : []
        );
        setPartners(Array.isArray(partnersData) ? partnersData : []);
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить справочники",
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const filteredLabCategories = useMemo(() => {
    let filtered = labCategories.filter((cat) => cat.isActive !== false);

    if (selectedDepartment) {
      filtered = filtered.filter(
        (cat) => cat.department === selectedDepartment
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
          ${category.code?.toLowerCase() || ""}
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

      const suggestions = labCategories
        .filter((category) => {
          const searchText = `
            ${category.name?.toLowerCase() || ""}
            ${category.code?.toLowerCase() || ""}
            ${category.department?.toLowerCase() || ""}
            ${category.description?.toLowerCase() || ""}
          `;
          return terms.every((term) => searchText.includes(term));
        })
        .slice(0, 5);

      setModalSearchSuggestions(suggestions);
    } else {
      setModalSearchSuggestions([]);
    }
  }, [modalSearchTerm, labCategories]);

  const expandMedicalTerms = (query) => {
    let expandedQuery = query.toLowerCase();
    Object.keys(medicalAbbreviations).forEach((abbr) => {
      if (expandedQuery.includes(abbr)) {
        expandedQuery = expandedQuery.replace(abbr, medicalAbbreviations[abbr]);
      }
    });
    return expandedQuery;
  };

  const searchAnalyses = (query) => {
    if (!query.trim()) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const expandedQuery = expandMedicalTerms(query);
    const terms = expandedQuery.split(/\s+/).filter((term) => term.length > 0);

    const suggestions = labCategories
      .filter((category) => {
        const searchText = `
        ${category.name?.toLowerCase() || ""}
        ${category.code?.toLowerCase() || ""}
        ${category.department?.toLowerCase() || ""}
        ${category.description?.toLowerCase() || ""}
        ${category.sampleType?.toLowerCase() || ""}
      `;
        return terms.every((term) => searchText.includes(term));
      })
      .slice(0, 10);

    setSearchSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length >= 2) {
      searchAnalyses(value);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (category) => {
    handleAnalysisSelect(category);
    setSearchTerm("");
    setSearchSuggestions([]);
    setShowSuggestions(false);

    toast({
      title: "Анализ добавлен",
      description: `${category.name}`,
      status: "success",
      duration: 1500,
    });
  };

  const handleQuickSearch = (e) => {
    if (e.key === "Enter" && searchSuggestions.length > 0) {
      handleSuggestionClick(searchSuggestions[0]);
    }
  };

  // Обновленная функция change с капитализацией
  const change = (e) => {
    const { name, value, type, checked } = e.target;

    // Для checkbox
    if (type === "checkbox") {
      formRef.current[name] = checked;
      return;
    }

    // Для select
    if (type === "select-one") {
      formRef.current[name] = value;
      return;
    }

    // Поля, которые нужно капитализировать
    const fieldsToCapitalize = [
      "surname",
      "name",
      "lastName",
      "addres",
      "work",
    ];

    if (fieldsToCapitalize.includes(name)) {
      const capitalizedValue = capitalizeString(value);
      formRef.current[name] = capitalizedValue;
      setFormFields((prev) => ({
        ...prev,
        [name]: capitalizedValue,
      }));
    } else {
      formRef.current[name] = value;
      setFormFields((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePromoChange = (e) => {
    const promo = promoCodes.find((p) => p.id === parseInt(e.target.value));
    setSelectedPromo(promo);
  };

  const handleBenefitChange = (e) => {
    const benefit = benefits.find((b) => b.id === parseInt(e.target.value));
    setSelectedBenefit(benefit);
  };

  const handlePartnerChange = (e) => {
    const partner = partners.find((p) => p.id === parseInt(e.target.value));
    setSelectedPartner(partner);
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
        tests = [];
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
        type: "analysis",
      },
    ]);
  };

  const handleBlankSelect = (blank) => {
    if (selectedBlanks.find((b) => b.id === blank.id)) {
      toast({
        title: "Уведомление",
        description: "Этот бланк уже добавлен",
        status: "info",
      });
      return;
    }

    setSelectedBlanks((prev) => [
      ...prev,
      {
        id: blank.id,
        name: blank.name,
        price: parseInt(blank.price) || 0,
        department: blank.department,
        sampleType: blank.sampleType,
        type: "blank",
      },
    ]);

    toast({
      title: "Бланк добавлен",
      description: `${blank.name}`,
      status: "success",
      duration: 1500,
    });
  };

  const removeAnalysis = (categoryId) => {
    setSelectedAnalyses((prev) =>
      prev.filter((a) => a.categoryId !== categoryId)
    );
  };

  const removeBlank = (blankId) => {
    setSelectedBlanks((prev) => prev.filter((b) => b.id !== blankId));
  };

  const calculateTotals = () => {
    const analysisTotal = selectedAnalyses.reduce(
      (sum, a) => sum + (parseInt(a.price) || 0),
      0
    );
    const blankTotal = selectedBlanks.reduce(
      (sum, b) => sum + (parseInt(b.price) || 0),
      0
    );
    const totalAmount = analysisTotal + blankTotal;

    let discount = 0;
    let discountPercent = 0;

    if (selectedPromo?.presentage) {
      discountPercent += parseFloat(selectedPromo.presentage);
    }

    if (selectedBenefit?.discount) {
      discount += parseFloat(selectedBenefit.discount);
    }

    if (discountPercent > 0) {
      discount += (totalAmount * discountPercent) / 100;
    }

    const finalAmount = Math.max(0, totalAmount - discount);
    const debtAmount = Math.max(0, finalAmount - paidAmount);

    return { totalAmount, discount, discountPercent, finalAmount, debtAmount };
  };

  const { totalAmount, discount, discountPercent, finalAmount, debtAmount } =
    calculateTotals();

  const handleSubmit = async () => {
    if (
      !formRef.current.surname ||
      !formRef.current.name ||
      !formRef.current.phoneNumber
    ) {
      toast({
        title: "Ошибка",
        description: "Заполните обязательные поля: Фамилия, Имя, Телефон",
        status: "error",
      });
      return;
    }

    if (selectedAnalyses.length === 0 && selectedBlanks.length === 0) {
      const shouldContinue = window.confirm(
        "Не выбрано ни одного анализа или бланка. Продолжить?"
      );
      if (!shouldContinue) return;
    }

    try {
      setLoading(true);

      const token = Cookies.get("token");
      let registrator = "Неизвестно";
      let registratorId = null;

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          registrator = `${payload.surname || ""} ${payload.name || ""}`.trim();
          registratorId = payload.id;
        } catch (e) {
          console.error("Ошибка парсинга токена:", e);
        }
      }

      // ШАГ 1: Создаем пациента
      const clientData = {
        ...formRef.current,
        sex: sex ? parseInt(sex) : null,
        registrator,
        debt: debtAmount.toString(),
        registrationDate: new Date().toISOString().split("T")[0],
        partnerId: selectedPartner?.id || null,
      };

      const clientResponse = await fetch(`${api}/client/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      });

      if (!clientResponse.ok) {
        const errorData = await clientResponse.json();
        throw new Error(errorData.message || "Ошибка создания пациента");
      }

      const createdClient = await clientResponse.json();
      const clientId = createdClient.id || createdClient.client?.id;

      if (!clientId) {
        throw new Error("Не удалось получить ID созданного пациента");
      }

      console.log("✅ Пациент создан с ID:", clientId);

      // ШАГ 2: Обновляем счетчик партнера
      if (selectedPartner) {
        try {
          await fetch(`${api}/partner/update/${selectedPartner.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...selectedPartner,
              clientsPerMonth: (selectedPartner.clientsPerMonth || 0) + 1,
              allClients: (selectedPartner.allClients || 0) + 1,
            }),
          });
        } catch (err) {
          console.warn("⚠️ Не удалось обновить счетчик партнера:", err);
        }
      }

      // ШАГ 3: Создаем записи анализов
      if (selectedAnalyses.length > 0) {
        const labPromises = selectedAnalyses.flatMap((analysis) => {
          const tests = analysis.tests || [];

          if (!Array.isArray(tests) || tests.length === 0) {
            const labData = {
              clientId,
              categoryId: analysis.categoryId,
              name: analysis.name,
              testCode: analysis.code || "",
              price: analysis.price || 0,
              sampleType: analysis.sampleType || "Кровь (сыворотка)",
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
            }).then(async (response) => {
              if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Ошибка ответа сервера:", errorText);
                throw new Error(`Ошибка создания анализа: ${analysis.name}`);
              }
              return response.json();
            });
          }

          return tests.map((test) => {
            const labData = {
              clientId,
              categoryId: analysis.categoryId,
              name: test.name || analysis.name,
              testCode: test.code || analysis.code || "",
              price: analysis.price || 0,
              sampleType: analysis.sampleType || "Кровь (сыворотка)",
              unit: test.unit || null,
              referenceMin: test.referenceMin || null,
              referenceMax: test.referenceMax || null,
              referenceText:
                test.referenceMale && test.referenceFemale
                  ? `М: ${test.referenceMale}, Ж: ${test.referenceFemale}`
                  : test.referenceText || null,
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
            }).then(async (response) => {
              if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Ошибка ответа сервера:", errorText);
                throw new Error(`Ошибка создания теста: ${test.name}`);
              }
              return response.json();
            });
          });
        });

        await Promise.all(labPromises);
        console.log("✅ Все анализы созданы успешно");
      }

      // ШАГ 4: Создаем назначения бланков
      if (selectedBlanks.length > 0) {
        const blankPromises = selectedBlanks.map((blank) => {
          const assignmentData = {
            clientId,
            blankId: blank.id,
            status: "pending",
            assignedAt: new Date().toISOString(),
          };

          return fetch(`${api}/blank-assignment/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(assignmentData),
          }).then(async (response) => {
            if (!response.ok) {
              const errorText = await response.text();
              console.error("❌ Ошибка назначения бланка:", errorText);
              throw new Error(`Ошибка назначения бланка: ${blank.name}`);
            }
            return response.json();
          });
        });

        await Promise.all(blankPromises);
        console.log("✅ Все бланки назначены успешно");
      }

      // ШАГ 5: Создаем запись в кассе
      const servicesDescription = [
        ...selectedAnalyses.map((a) => a.name),
        ...selectedBlanks.map((b) => b.name),
      ].join(", ");

      const cashData = {
        clientId,
        doctorId: null,
        registratorId: registratorId || null,
        totalAmount,
        discount,
        discountPercent,
        finalAmount,
        paidAmount,
        debtAmount,
        paymentMethod,
        servicesDescription,
        labAnalyses: selectedAnalyses.map((a) => a.categoryId),
        blanks: selectedBlanks.map((b) => b.id),
        promoCode: selectedPromo?.code || null,
        benefitCategory: selectedBenefit?.name || null,
        partnerId: selectedPartner?.id || null,
        partnerName: selectedPartner?.fullName || null,
        status: debtAmount === 0 ? "paid" : paidAmount > 0 ? "partial" : "debt",
        date: new Date().toISOString(),
        notes: null,
      };

      const cashResponse = await fetch(`${api}/cashbox/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cashData),
      });

      if (!cashResponse.ok) {
        console.warn("⚠️ Запись в кассе не создана");
      } else {
        console.log("✅ Запись в кассе создана");
      }

      toast({
        title: "Успешно",
        description: `Пациент ${clientData.surname} ${clientData.name} зарегистрирован`,
        status: "success",
        duration: 3000,
      });

      setTimeout(() => {
        router.push(`/patient/${clientId}`);
      }, 1500);
    } catch (error) {
      console.error("❌ Ошибка регистрации:", error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось зарегистрировать пациента",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const allSelectedItems = [...selectedAnalyses, ...selectedBlanks];

  return (
    <Box p={4} bg="white" borderRadius="16px" w="100%">
      <Heading mb={6}>Регистрация пациента в лаборатории</Heading>

      <Tabs>
        <TabList>
          <Tab>Личные данные</Tab>
          <Tab>Анализы и бланки ({allSelectedItems.length})</Tab>
          <Tab>Оплата</Tab>
        </TabList>

        <TabPanels>
          {/* Вкладка 1: Личные данные */}
          <TabPanel>
            <SimpleGrid columns={2} spacing={6}>
              <VStack align="stretch" spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Фамилия</FormLabel>
                  <Input
                    name="surname"
                    onChange={change}
                    placeholder="Иванов"
                    value={formFields.surname}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Имя</FormLabel>
                  <Input
                    name="name"
                    onChange={change}
                    placeholder="Иван"
                    value={formFields.name}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Отчество</FormLabel>
                  <Input
                    name="lastName"
                    onChange={change}
                    placeholder="Иванович"
                    value={formFields.lastName}
                  />
                </FormControl>

                <HStack>
                  <FormControl>
                    <FormLabel>Дата рождения</FormLabel>
                    <Input
                      type="date"
                      name="dateBirth"
                      onChange={change}
                      value={formFields.dateBirth}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Пол</FormLabel>
                    <RadioGroup onChange={setSex} value={sex}>
                      <Stack direction="row">
                        <Radio value="1">М</Radio>
                        <Radio value="0">Ж</Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                </HStack>

                <FormControl isRequired>
                  <FormLabel>Телефон</FormLabel>
                  <Input
                    name="phoneNumber"
                    onChange={change}
                    placeholder="+998 90 123 45 67"
                    value={formFields.phoneNumber}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    onChange={change}
                    placeholder="patient@example.com"
                    value={formFields.email}
                  />
                </FormControl>
              </VStack>

              <VStack align="stretch" spacing={4}>
                <FormControl>
                  <FormLabel>Адрес</FormLabel>
                  <Input
                    name="addres"
                    onChange={change}
                    value={formFields.addres}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Место работы/учебы</FormLabel>
                  <Input
                    name="work"
                    onChange={change}
                    value={formFields.work}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>
                    <HStack>
                      <Text>Партнер (направил в лабораторию)</Text>
                    </HStack>
                  </FormLabel>
                  <Select
                    placeholder="Выберите партнера (необязательно)"
                    onChange={handlePartnerChange}
                  >
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.fullName} (
                        {partner.partnerType === "doctor"
                          ? "Доктор"
                          : "Мед. представитель"}
                        )
                      </option>
                    ))}
                  </Select>
                  {selectedPartner && (
                    <Badge colorScheme="green" mt={2}>
                      Бонус партнеру: {selectedPartner.bonus} сум
                    </Badge>
                  )}
                </FormControl>

                <HStack>
                  <Checkbox
                    name="smsNotification"
                    onChange={(e) =>
                      (formRef.current.smsNotification = e.target.checked)
                    }
                  >
                    СМС уведомления
                  </Checkbox>
                  <Checkbox
                    name="emailNotification"
                    onChange={(e) =>
                      (formRef.current.emailNotification = e.target.checked)
                    }
                  >
                    Email уведомления
                  </Checkbox>
                </HStack>
              </VStack>
            </SimpleGrid>
          </TabPanel>

          {/* Вкладка 2: Анализы и бланки */}
          <TabPanel>
            <VStack align="stretch" spacing={6}>
              {/* Быстрый поиск */}
              <Box position="relative">
                <Input
                  ref={searchInputRef}
                  placeholder="🔍 Быстрый поиск анализов и бланков..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyPress={handleQuickSearch}
                  size="lg"
                />
                {showSuggestions && (
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
                    maxH="300px"
                    overflowY="auto"
                  >
                    {searchSuggestions.map((category) => (
                      <Box
                        key={category.id}
                        p={3}
                        borderBottom="1px solid"
                        borderColor="gray.100"
                        cursor="pointer"
                        _hover={{ bg: "blue.50" }}
                        onClick={() => handleSuggestionClick(category)}
                      >
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <HStack>
                              <Badge colorScheme="blue">{category.code}</Badge>
                              <Text fontWeight="medium">{category.name}</Text>
                            </HStack>
                            {category.department && (
                              <Text fontSize="sm" color="gray.600">
                                {category.department}
                              </Text>
                            )}
                          </VStack>
                          <Text fontWeight="bold" color="green.600">
                            {(
                              category.basePrice ||
                              category.sum ||
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

              <HStack>
                <Button colorScheme="blue" onClick={onLabOpen}>
                  + Стандартные анализы
                </Button>
                <Button colorScheme="purple" onClick={onBlankOpen}>
                  + Комплексные бланки
                </Button>
              </HStack>

              {/* Выбранные анализы и бланки */}
              {allSelectedItems.length > 0 ? (
                <VStack align="stretch" spacing={3}>
                  {selectedAnalyses.map((analysis) => (
                    <Card
                      key={`analysis-${analysis.categoryId}`}
                      variant="outline"
                      borderColor="blue.200"
                    >
                      <CardBody>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1} flex={1}>
                            <HStack>
                              <Badge colorScheme="blue">Анализ</Badge>
                              <Text fontWeight="bold">{analysis.name}</Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              🧪 {analysis.sampleType}
                            </Text>
                            {analysis.tests && analysis.tests.length > 1 && (
                              <Text fontSize="xs" color="blue.600">
                                📋 Включает {analysis.tests.length} параметров
                              </Text>
                            )}
                          </VStack>
                          <HStack>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color="green.600"
                            >
                              {(analysis.price || 0).toLocaleString()} сум
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

                  {selectedBlanks.map((blank) => (
                    <Card
                      key={`blank-${blank.id}`}
                      variant="outline"
                      borderColor="purple.200"
                    >
                      <CardBody>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1} flex={1}>
                            <HStack>
                              <Badge colorScheme="purple">Бланк</Badge>
                              <Text fontWeight="bold">{blank.name}</Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              🧪 {blank.sampleType}
                            </Text>
                            {blank.department && (
                              <Text fontSize="xs" color="purple.600">
                                📂 {blank.department}
                              </Text>
                            )}
                          </VStack>
                          <HStack>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color="green.600"
                            >
                              {(blank.price || 0).toLocaleString()} сум
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
              ) : (
                <></>
              )}
            </VStack>
          </TabPanel>

          {/* Вкладка 3: Оплата */}
          <TabPanel>
            <SimpleGrid columns={2} spacing={8}>
              <VStack align="stretch" spacing={4}>
                <Text fontWeight="bold" color="blue.700" fontSize="lg">
                  Скидки
                </Text>

                <FormControl>
                  <FormLabel>Промокод</FormLabel>
                  <Select
                    placeholder="Выберите промокод"
                    onChange={handlePromoChange}
                  >
                    {promoCodes.map((promo) => (
                      <option key={promo.id} value={promo.id}>
                        {promo.code} ({promo.presentage}%)
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Льготы</FormLabel>
                  <Select
                    placeholder="Выберите льготу"
                    onChange={handleBenefitChange}
                  >
                    {benefits.map((benefit) => (
                      <option key={benefit.id} value={benefit.id}>
                        {benefit.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>

              <VStack align="stretch" spacing={4}>
                <Text fontWeight="bold" color="blue.700" fontSize="lg">
                  Оплата
                </Text>

                <FormControl>
                  <FormLabel>Способ оплаты</FormLabel>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="cash">💵 Наличные</option>
                    <option value="card">💳 Карта</option>
                    <option value="transfer">🏦 Перевод</option>
                    <option value="terminal">📱 Терминал</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Оплачено сейчас</FormLabel>
                  <Input
                    type="number"
                    value={paidAmount || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        setPaidAmount(0);
                      } else {
                        const numValue = parseFloat(value);
                        setPaidAmount(isNaN(numValue) ? 0 : numValue);
                      }
                    }}
                    placeholder="0"
                  />
                </FormControl>

                <Button
                  colorScheme="teal"
                  onClick={() => {
                    setPaidAmount(finalAmount);
                    // Фокус на поле оплаты после установки суммы
                    setTimeout(() => {
                      const input = document.querySelector(
                        'input[type="number"][placeholder="0"]'
                      );
                      if (input) {
                        input.focus();
                        input.select();
                      }
                    }, 100);
                  }}
                  size="sm"
                >
                  Оплатить полностью
                </Button>
              </VStack>
            </SimpleGrid>

            <Divider my={6} />

            {/* Итоги */}
            <Box p={6} bg="gray.50" borderRadius="md">
              <SimpleGrid columns={2} spacing={4}>
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    Сумма за услуги:
                  </Text>
                  <Text fontSize="xl" fontWeight="bold">
                    {totalAmount.toLocaleString()} сум
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    Скидка:
                  </Text>
                  <Text fontSize="xl" fontWeight="bold" color="red.500">
                    -{discount.toLocaleString()} сум{" "}
                    {discountPercent > 0 && `(${discountPercent}%)`}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    К оплате:
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {finalAmount.toLocaleString()} сум
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    Долг:
                  </Text>
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color={debtAmount > 0 ? "red.600" : "green.600"}
                  >
                    {debtAmount.toLocaleString()} сум
                  </Text>
                </Box>
              </SimpleGrid>

              {selectedPartner && (
                <>
                  <Divider my={4} />
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Бонус партнеру:
                    </Text>
                    <Badge colorScheme="green" fontSize="md" p={2}>
                      {selectedPartner.fullName}: {selectedPartner.bonus} сум
                    </Badge>
                  </HStack>
                </>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Кнопки действий */}
      <HStack justify="flex-end" spacing={4} mt={6}>
        <Button variant="outline" onClick={() => router.push("/patients")}>
          Отмена
        </Button>
        <Button
          colorScheme="blue"
          onClick={handleSubmit}
          isLoading={loading}
          size="lg"
        >
          Зарегистрировать пациента
        </Button>
      </HStack>

      {/* Модальное окно стандартных анализов */}
      <Modal isOpen={isLabOpen} onClose={onLabClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>Каталог стандартных анализов</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto">
            {/* Вкладки с отделами */}
            <Tabs variant="enclosed" colorScheme="blue" mb={4}>
              <TabList overflowX="auto" py={2}>
                <Tab onClick={() => setSelectedDepartment(null)}>
                  Все анализы
                </Tab>
                {Array.from(
                  new Set(
                    labCategories.map((cat) => cat.department).filter(Boolean)
                  )
                ).map((dept) => (
                  <Tab key={dept} onClick={() => setSelectedDepartment(dept)}>
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
                            (a) => a.categoryId === category.id
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
                    labCategories.map((cat) => cat.department).filter(Boolean)
                  )
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
                              cat.department === dept && cat.isActive !== false
                          )
                          .map((category) => (
                            <AnalysisCard
                              key={category.id}
                              category={category}
                              isSelected={selectedAnalyses.find(
                                (a) => a.categoryId === category.id
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

            {/* Быстрый поиск внутри модального окна */}
            <Box mb={4} position="relative">
              <Input
                placeholder="🔍 Поиск по названию или коду..."
                value={modalSearchTerm}
                onChange={(e) => setModalSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && modalSearchSuggestions.length > 0) {
                    handleAnalysisSelect(modalSearchSuggestions[0]);
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
                  {modalSearchSuggestions.map((category) => (
                    <Box
                      key={category.id}
                      p={2}
                      borderBottom="1px solid"
                      borderColor="gray.100"
                      cursor="pointer"
                      _hover={{ bg: "blue.50" }}
                      onClick={() => {
                        handleAnalysisSelect(category);
                        setModalSearchTerm("");
                      }}
                    >
                      <HStack justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{category.name}</Text>
                          <HStack spacing={2}>
                            <Badge colorScheme="blue" size="sm">
                              {category.code}
                            </Badge>
                            {category.department && (
                              <Badge colorScheme="purple" size="sm">
                                {category.department}
                              </Badge>
                            )}
                          </HStack>
                        </VStack>
                        <Text fontWeight="bold" color="green.600">
                          {(
                            category.basePrice ||
                            category.sum ||
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

            {/* Выбранные анализы (мини-панель) */}
            {selectedAnalyses.length > 0 && (
              <Box mb={4} p={3} bg="blue.50" borderRadius="md">
                <HStack justify="space-between">
                  <Text fontWeight="bold" color="blue.700">
                    Выбрано анализов: {selectedAnalyses.length}
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => setSelectedAnalyses([])}
                  >
                    Очистить все
                  </Button>
                </HStack>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Badge colorScheme="blue" p={2}>
                Выбрано: {selectedAnalyses.length}
              </Badge>
              <Button onClick={onLabClose}>Закрыть</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальное окно бланков */}
      <Modal isOpen={isBlankOpen} onClose={onBlankClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>Каталог комплексных бланков</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto">
            {blanks.length > 0 ? (
              <SimpleGrid columns={2} spacing={4}>
                {blanks.map((blank) => {
                  const isSelected = selectedBlanks.find(
                    (b) => b.id === blank.id
                  );

                  return (
                    <Card
                      key={blank.id}
                      variant="outline"
                      borderWidth="2px"
                      borderColor={isSelected ? "purple.500" : "gray.200"}
                      bg={isSelected ? "purple.50" : "white"}
                    >
                      <CardBody>
                        <VStack align="stretch" spacing={3}>
                          <HStack justify="space-between">
                            <Badge colorScheme="purple">
                              Бланк #{blank.id}
                            </Badge>
                            {blank.department && (
                              <Badge colorScheme="blue" fontSize="xs">
                                {blank.department}
                              </Badge>
                            )}
                          </HStack>

                          <Text fontWeight="bold" fontSize="lg">
                            {blank.name}
                          </Text>

                          {blank.description && (
                            <Text fontSize="sm" color="gray.600" noOfLines={3}>
                              {blank.description}
                            </Text>
                          )}

                          <VStack align="stretch" spacing={1} fontSize="sm">
                            {blank.sampleType && (
                              <HStack>
                                <Text color="gray.600">🧪 Биоматериал:</Text>
                                <Text fontWeight="medium">
                                  {blank.sampleType}
                                </Text>
                              </HStack>
                            )}
                            {blank.category && (
                              <HStack>
                                <Text color="gray.600">📂 Категория:</Text>
                                <Text fontWeight="medium">
                                  {blank.category}
                                </Text>
                              </HStack>
                            )}
                          </VStack>

                          <Divider />

                          <HStack justify="space-between">
                            <Text
                              fontSize="xl"
                              fontWeight="bold"
                              color="green.600"
                            >
                              {(blank.price || 0).toLocaleString()} сум
                            </Text>
                            <Button
                              size="sm"
                              colorScheme={isSelected ? "green" : "purple"}
                              onClick={() => handleBlankSelect(blank)}
                              isDisabled={isSelected}
                            >
                              {isSelected ? "✓ Добавлено" : "Добавить"}
                            </Button>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </SimpleGrid>
            ) : (
              <Alert status="info">
                <AlertIcon />
                Бланки не найдены. Создайте бланки в разделе управления
                бланками.
              </Alert>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Badge colorScheme="purple" p={2}>
                Выбрано бланков: {selectedBlanks.length}
              </Badge>
              <Button onClick={onBlankClose}>Закрыть</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default RegisterPage;
