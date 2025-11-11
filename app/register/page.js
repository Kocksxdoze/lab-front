"use client";
import React, { useState, useRef, useEffect } from "react";
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
} from "@chakra-ui/react";
import { DeleteIcon, InfoIcon, SearchIcon } from "@chakra-ui/icons";
import Header from "../../components/med/header";
import Footer from "../../components/med/footer";
import ParticlesComponent from "../../components/med/particles";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

function Register() {
  const formRef = useRef({});
  const [sex, setSex] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [promoCodes, setPromoCodes] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [labCategories, setLabCategories] = useState([]);
  const [selectedAnalyses, setSelectedAnalyses] = useState([]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);
  const router = useRouter();
  const toast = useToast();

  const {
    isOpen: isLabOpen,
    onOpen: onLabOpen,
    onClose: onLabClose,
  } = useDisclosure();

  // Медицинские сокращения и синонимы
  const medicalAbbreviations = {
    // Общие анализы
    общ: "общий",
    клин: "клинический",
    биох: "биохимический",
    биохим: "биохимический",

    // Кровь
    оак: "общий анализ крови",
    оам: "общий анализ мочи",
    сахар: "глюкоза",
    глюк: "глюкоза",

    // Гормоны
    ттг: "тиреотропный гормон",
    т3: "трийодтиронин",
    т4: "тироксин",
    лг: "лютеинизирующий гормон",
    фсг: "фолликулостимулирующий гормон",
    прол: "пролактин",
    тест: "тестостерон",
    эстр: "эстрадиол",
    корт: "кортизол",

    // Маркеры
    he4: "he4",
    ca125: "ca 125",
    psa: "psa",
    пса: "psa",

    // Инфекции
    вну: "вич",
    спид: "вич",
    гепа: "гепатит",
    геп: "гепатит",
    сиф: "сифилис",
    рпр: "rpr",

    // Биохимия
    алт: "alat",
    аст: "asat",
    креат: "креатинин",
    мочев: "мочевина",
    билир: "билирубин",
    холест: "холестерин",
    холес: "холестерин",
    липид: "липидный",

    // Витамины
    вит: "витамин",
    "вит д": "витамин d",
    д3: "витамин d",
    "вит в": "витамин b",
    в12: "витамин b12",

    // Общие термины
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
        const [promos, bens, labs] = await Promise.all([
          fetch(`http://localhost:4000/promocodes`).then((r) => r.json()),
          fetch(`http://localhost:4000/benefits`).then((r) => r.json()),
          fetch(`http://localhost:4000/lab-categories`).then((r) => r.json()),
        ]);

        setPromoCodes(Array.isArray(promos) ? promos : []);
        setBenefits(Array.isArray(bens) ? bens : []);
        setLabCategories(Array.isArray(labs) ? labs : []);
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

  // Функция для расшифровки медицинских сокращений
  const expandMedicalTerms = (query) => {
    let expandedQuery = query.toLowerCase();

    // Заменяем сокращения на полные термины
    Object.keys(medicalAbbreviations).forEach((abbr) => {
      if (expandedQuery.includes(abbr)) {
        expandedQuery = expandedQuery.replace(abbr, medicalAbbreviations[abbr]);
      }
    });

    return expandedQuery;
  };

  // Функция для поиска анализов с учетом сокращений
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

        // Проверяем, содержатся ли все термины запроса в тексте
        return terms.every((term) => searchText.includes(term));
      })
      .slice(0, 10); // Ограничиваем количество предложений

    setSearchSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0);
  };

  // Обработчик изменения поискового запроса
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

  // Выбор предложения из поиска
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

  // Быстрый поиск по первым буквам
  const handleQuickSearch = (e) => {
    if (e.key === "Enter" && searchSuggestions.length > 0) {
      handleSuggestionClick(searchSuggestions[0]);
    }
  };

  const change = (e) => {
    formRef.current[e.target.name] = e.target.value;
  };

  const handlePromoChange = (e) => {
    const promo = promoCodes.find((p) => p.id === parseInt(e.target.value));
    setSelectedPromo(promo);
  };

  const handleBenefitChange = (e) => {
    const benefit = benefits.find((b) => b.id === parseInt(e.target.value));
    setSelectedBenefit(benefit);
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

    // Получаем цену из правильного поля
    const price = category.basePrice || category.sum || 0;

    // Парсим тесты из JSON если они есть
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

    // Если нет тестов, создаем один основной
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
      description: `${category.name} (${price.toLocaleString()} сум)`,
      status: "success",
      duration: 2000,
    });
  };

  const removeAnalysis = (categoryId) => {
    setSelectedAnalyses((prev) =>
      prev.filter((a) => a.categoryId !== categoryId)
    );
  };

  const calculateTotals = () => {
    const totalAmount = selectedAnalyses.reduce(
      (sum, a) => sum + (parseInt(a.price) || 0),
      0
    );

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

    if (selectedAnalyses.length === 0) {
      const shouldContinue = window.confirm(
        "Не выбрано ни одного анализа. Продолжить?"
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
      };

      const clientResponse = await fetch(
        `http://localhost:4000/client/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clientData),
        }
      );

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

      // ШАГ 2: Создаем записи анализов
      if (selectedAnalyses.length > 0) {
        const labPromises = selectedAnalyses.flatMap((analysis) => {
          const tests = analysis.tests || [];

          // Если тестов нет, создаём один базовый
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

            console.log("📤 Отправка анализа:", labData);

            return fetch(`http://localhost:4000/lab/new`, {
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

          // Если есть тесты, создаём для каждого
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

            console.log("📤 Отправка теста:", labData);

            return fetch(`http://localhost:4000/lab/new`, {
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

        console.log(
          `📋 Всего запросов на создание анализов: ${labPromises.length}`
        );
        await Promise.all(labPromises);
        console.log("✅ Все анализы созданы успешно");
      }

      // ШАГ 3: Создаем запись в кассе
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
        servicesDescription: selectedAnalyses.map((a) => a.name).join(", "),
        labAnalyses: selectedAnalyses.map((a) => a.categoryId),
        promoCode: selectedPromo?.code || null,
        benefitCategory: selectedBenefit?.name || null,
        status: debtAmount === 0 ? "paid" : paidAmount > 0 ? "partial" : "debt",
        date: new Date().toISOString(),
        notes: null,
      };

      console.log("💰 Создание записи в кассе:", cashData);

      const cashResponse = await fetch(`http://localhost:4000/cashbox/create`, {
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

  const filteredCategories = labCategories.filter((cat) => {
    const term = searchTerm.toLowerCase();
    const expandedTerm = expandMedicalTerms(term);
    const terms = expandedTerm.split(/\s+/).filter((t) => t.length > 0);

    const searchText = `
      ${cat.name?.toLowerCase() || ""}
      ${cat.code?.toLowerCase() || ""}
      ${cat.department?.toLowerCase() || ""}
      ${cat.description?.toLowerCase() || ""}
      ${cat.sampleType?.toLowerCase() || ""}
    `;

    return terms.every((t) => searchText.includes(t));
  });

  return (
    <>
      <Box pos="absolute" w="100%">
        <Box zIndex="999" pos="relative" px="50px">
          <Header />
        </Box>

        <Box
          position="relative"
          w="full"
          bgColor="white.500"
          h="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDir="column"
          px="50px"
          bgGradient="linear(to-b, black, white)"
        >
          <ParticlesComponent />

          <Box
            shadow="2xl"
            zIndex="990"
            w="100%"
            h="100%"
            bg="#fff"
            mx="50px"
            px="30px"
            py="30px"
            mt="50px"
            borderRadius="16px"
          >
            <Heading mb={6}>Регистрация пациента в лаборатории</Heading>

            {/* Основная информация */}
            <SimpleGrid columns={2} spacing={8} mb={6}>
              <VStack align="stretch" spacing={4}>
                <Text fontWeight="bold" color="blue.700">
                  Личные данные
                </Text>

                <FormControl isRequired>
                  <FormLabel>Фамилия</FormLabel>
                  <Input
                    border={"1px solid black"}
                    name="surname"
                    onChange={change}
                    placeholder="Иванов"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Имя</FormLabel>
                  <Input
                    border={"1px solid black"}
                    name="name"
                    onChange={change}
                    placeholder="Иван"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Отчество</FormLabel>
                  <Input
                    border={"1px solid black"}
                    name="lastName"
                    onChange={change}
                    placeholder="Иванович"
                  />
                </FormControl>

                <HStack>
                  <FormControl>
                    <FormLabel>Дата рождения</FormLabel>
                    <Input
                      border={"1px solid black"}
                      type="date"
                      name="dateBirth"
                      onChange={change}
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
                    border={"1px solid black"}
                    name="phoneNumber"
                    onChange={change}
                    placeholder="+998 90 123 45 67"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    border={"1px solid black"}
                    type="email"
                    name="email"
                    onChange={change}
                    placeholder="patient@example.com"
                  />
                </FormControl>
              </VStack>

              <VStack align="stretch" spacing={4}>
                <Text fontWeight="bold" color="blue.700">
                  Дополнительная информация
                </Text>

                <FormControl>
                  <FormLabel>Адрес</FormLabel>
                  <Input
                    border={"1px solid black"}
                    name="addres"
                    onChange={change}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Место работы/учебы</FormLabel>
                  <Input
                    border={"1px solid black"}
                    name="work"
                    onChange={change}
                  />
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

            <Divider my={6} />

            {/* Анализы */}
            <Box mb={6}>
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="bold" color="blue.700">
                  Лабораторные исследования
                </Text>
                <Badge colorScheme="purple" fontSize="md" p={2}>
                  Выбрано: {selectedAnalyses.length}
                </Badge>
              </HStack>

              {/* Быстрый поиск анализов */}
              <Box position="relative" mb={4}>
                <Input
                  border={"1px solid black"}
                  ref={searchInputRef}
                  placeholder="🔍 Быстрый поиск анализов (начните вводить название, код или сокращение...)"
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

              <Button colorScheme="blue" onClick={onLabOpen} mb={4}>
                + Открыть полный каталог анализов
              </Button>

              {selectedAnalyses.length > 0 ? (
                <VStack align="stretch" spacing={3}>
                  {selectedAnalyses.map((analysis) => (
                    <Card key={analysis.categoryId} variant="outline">
                      <CardBody>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1} flex={1}>
                            <HStack>
                              <Badge colorScheme="blue">{analysis.code}</Badge>
                              <Text fontWeight="bold">{analysis.name}</Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              🧪 {analysis.sampleType}
                            </Text>
                            {analysis.executionTime && (
                              <Text fontSize="xs" color="gray.500">
                                ⏱️ Готовность: {analysis.executionTime} ч
                              </Text>
                            )}
                            {analysis.tests && analysis.tests.length > 1 && (
                              <Text fontSize="xs" color="blue.600">
                                📋 Включает {analysis.tests.length} параметров
                              </Text>
                            )}
                          </VStack>
                          <HStack>
                            <VStack align="end" spacing={0}>
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color="green.600"
                              >
                                {(analysis.price || 0).toLocaleString()} сум
                              </Text>
                              {analysis.department && (
                                <Text fontSize="xs" color="gray.500">
                                  {analysis.department}
                                </Text>
                              )}
                            </VStack>
                            <IconButton
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() =>
                                removeAnalysis(analysis.categoryId)
                              }
                              aria-label="Удалить анализ"
                            />
                          </HStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              ) : (
                <Alert status="info">
                  <AlertIcon />
                  Используйте быстрый поиск выше или откройте полный каталог для
                  выбора анализов
                </Alert>
              )}
            </Box>

            <Divider my={6} />

            {/* Скидки и оплата */}
            <SimpleGrid columns={2} spacing={8} mb={6}>
              <VStack align="stretch" spacing={4}>
                <Text fontWeight="bold" color="blue.700">
                  Скидки
                </Text>

                <FormControl>
                  <FormLabel>Промокод</FormLabel>
                  <Select
                    border={"1px solid black"}
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
                    border={"1px solid black"}
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
                <Text fontWeight="bold" color="blue.700">
                  Оплата
                </Text>

                <FormControl>
                  <FormLabel>Способ оплаты</FormLabel>
                  <Select
                    border={"1px solid black"}
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
                    border={"1px solid black"}
                    type="number"
                    value={paidAmount}
                    onChange={(e) =>
                      setPaidAmount(parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                  />
                </FormControl>
              </VStack>
            </SimpleGrid>

            {/* Итоги */}
            <Box p={6} bg="gray.50" borderRadius="md" mb={6}>
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
            </Box>

            {/* Кнопки */}
            <HStack justify="flex-end" spacing={4}>
              <Button
                variant="outline"
                onClick={() => router.push("/patients")}
              >
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
          </Box>

          <Box pos="relative" mt="50px" w="100%">
            <Footer />
          </Box>
        </Box>
      </Box>

      {/* Модальное окно анализов */}
      <Modal isOpen={isLabOpen} onClose={onLabClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>
            <VStack align="stretch" spacing={3}>
              <Text>Полный каталог лабораторных исследований</Text>
              <Input
                border={"1px solid black"}
                placeholder="🔍 Поиск по названию, коду, отделению или медицинскому сокращению..."
                value={searchTerm}
                onChange={handleSearchChange}
                size="md"
              />
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto">
            {loading ? (
              <Flex justify="center" py={10}>
                <Text>Загрузка...</Text>
              </Flex>
            ) : filteredCategories.length > 0 ? (
              <SimpleGrid columns={2} spacing={4}>
                {filteredCategories.map((category) => {
                  const price = category.basePrice || category.sum || 0;
                  const isSelected = selectedAnalyses.find(
                    (a) => a.categoryId === category.id
                  );

                  return (
                    <Card
                      key={category.id}
                      variant="outline"
                      borderWidth="2px"
                      borderColor={isSelected ? "blue.500" : "gray.200"}
                      bg={isSelected ? "blue.50" : "white"}
                      _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                      transition="all 0.2s"
                    >
                      <CardBody>
                        <VStack align="stretch" spacing={3}>
                          <HStack justify="space-between">
                            <Badge colorScheme="blue" fontSize="sm">
                              {category.code || category.id}
                            </Badge>
                            {category.department && (
                              <Badge colorScheme="purple" fontSize="xs">
                                {category.department}
                              </Badge>
                            )}
                          </HStack>

                          <Text fontWeight="bold" fontSize="lg">
                            {category.name}
                          </Text>

                          {category.description && (
                            <Text fontSize="sm" color="gray.600" noOfLines={2}>
                              {category.description}
                            </Text>
                          )}

                          <Divider />

                          <VStack align="stretch" spacing={1} fontSize="sm">
                            <HStack>
                              <Text color="gray.600">🧪 Биоматериал:</Text>
                              <Text fontWeight="medium">
                                {category.sampleType || "Не указан"}
                              </Text>
                            </HStack>

                            {category.executionTime && (
                              <HStack>
                                <Text color="gray.600">⏱️ Готовность:</Text>
                                <Text fontWeight="medium">
                                  {category.executionTime} часов
                                </Text>
                              </HStack>
                            )}

                            {category.tests &&
                              (() => {
                                try {
                                  const tests =
                                    typeof category.tests === "string"
                                      ? JSON.parse(category.tests)
                                      : category.tests;
                                  if (
                                    Array.isArray(tests) &&
                                    tests.length > 0
                                  ) {
                                    return (
                                      <HStack>
                                        <Text color="gray.600">
                                          📋 Параметров:
                                        </Text>
                                        <Text fontWeight="medium">
                                          {tests.length}
                                        </Text>
                                      </HStack>
                                    );
                                  }
                                } catch (e) {
                                  return null;
                                }
                              })()}
                          </VStack>

                          <Divider />

                          <HStack justify="space-between" mt={2}>
                            <VStack align="start" spacing={0}>
                              <Text
                                fontSize="xl"
                                fontWeight="bold"
                                color="green.600"
                              >
                                {parseInt(price).toLocaleString()} сум
                              </Text>
                            </VStack>
                            <Button
                              size="sm"
                              colorScheme={isSelected ? "green" : "blue"}
                              onClick={() => handleAnalysisSelect(category)}
                              isDisabled={isSelected}
                              leftIcon={isSelected ? <span>✓</span> : null}
                            >
                              {isSelected ? "Добавлено" : "Добавить"}
                            </Button>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </SimpleGrid>
            ) : (
              <Alert status="warning">
                <AlertIcon />
                {searchTerm
                  ? "Анализы не найдены. Попробуйте изменить поисковый запрос."
                  : "Категории анализов не найдены в базе данных."}
              </Alert>
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
    </>
  );
}

export default Register;
