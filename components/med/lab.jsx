"use client";
import React, { useState, useEffect } from "react";
import {
  Flex,
  Box,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  InputGroup,
  InputRightElement,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useToast,
  Textarea,
  Select,
  VStack,
  HStack,
  Badge,
  IconButton,
  Tooltip,
  Switch,
  NumberInput,
  NumberInputField,
  Divider,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import { SearchIcon, AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";
import { getApiBaseUrl } from "../../utils/api";

function Lab() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    description: "",
    department: "",
    basePrice: 0,
    sampleType: "Кровь (сыворотка)",
    sampleVolume: "",
    normalRange: "",
    referenceValue: "",
    unit: "",
    nomenclature: "",
    tests: [],
    isActive: true,
    orderIndex: 0,
  });

  const api = getApiBaseUrl();

  const loadCategories = async () => {
    try {
      const res = await axios.get(`${api}/lab-categories`);
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Ошибка при загрузке категорий:", error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить категории анализов",
        status: "error",
      });
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    [
      cat?.id,
      cat?.name,
      cat?.shortName,
      cat?.department,
      cat?.basePrice,
      cat?.sampleType,
      cat?.normalRange,
      cat?.referenceValue,
      cat?.unit,
    ].some((field) =>
      field?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleCreateOrUpdate = async () => {
    try {
      // Валидация
      if (!formData.name) {
        toast({
          title: "Ошибка",
          description: "Заполните обязательное поле: Название",
          status: "warning",
        });
        return;
      }

      // Преобразуем тесты в JSON если они не пустые
      const dataToSend = {
        ...formData,
        basePrice: parseInt(formData.basePrice) || 0,
        orderIndex: parseInt(formData.orderIndex) || 0,
        tests:
          Array.isArray(formData.tests) && formData.tests.length > 0
            ? formData.tests
            : [],
      };

      if (isEditing) {
        await axios.put(`${api}/lab-category/update/${editingId}`, dataToSend);
        toast({
          title: "Категория обновлена",
          status: "success",
          duration: 3000,
        });
      } else {
        await axios.post(`${api}/lab-category/new`, dataToSend);
        toast({
          title: "Категория создана",
          status: "success",
          duration: 3000,
        });
      }
      loadCategories();
      handleClose();
    } catch (error) {
      toast({
        title: "Ошибка при сохранении",
        description: error.response?.data?.message || "Попробуйте снова позже.",
        status: "error",
        duration: 4000,
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту категорию?")) {
      return;
    }

    try {
      await axios.delete(`${api}/lab-category/delete/${id}`);
      toast({
        title: "Категория удалена",
        status: "success",
        duration: 3000,
      });
      loadCategories();
    } catch (error) {
      toast({
        title: "Ошибка при удалении",
        description: error.response?.data?.message || "Попробуйте снова позже.",
        status: "error",
        duration: 4000,
      });
    }
  };

  const handleEdit = (category) => {
    setIsEditing(true);
    setEditingId(category.id);

    // Парсим тесты если они в виде строки
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

    setFormData({
      name: category.name || "",
      shortName: category.shortName || "",
      description: category.description || "",
      department: category.department || "",
      basePrice: category.basePrice || 0,
      sampleType: category.sampleType || "Кровь (сыворотка)",
      sampleVolume: category.sampleVolume || "",
      normalRange: category.normalRange || "",
      referenceValue: category.referenceValue || "",
      unit: category.unit || "",
      nomenclature: category.nomenclature || "",
      tests: tests,
      isActive: category.isActive !== false,
      orderIndex: category.orderIndex || 0,
    });
    onOpen();
  };

  const handleClose = () => {
    onClose();
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: "",
      shortName: "",
      description: "",
      department: "",
      basePrice: 0,
      sampleType: "Кровь (сыворотка)",
      sampleVolume: "",
      normalRange: "",
      referenceValue: "",
      unit: "",
      nomenclature: "",
      tests: [],
      isActive: true,
      orderIndex: 0,
    });
  };

  return (
    <Box p={4} borderRadius="16px" w="100%" overflowX="auto" bg="#fff">
      <Flex justify="space-between" mb={4} flexWrap="wrap" gap={4}>
        <InputGroup w={{ base: "100%", md: "50%" }}>
          <Input
            placeholder="Поиск по любому параметру"
            color="black"
            _placeholder={{ color: "gray.500" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            border="1px solid #000"
            pr="2.5rem"
          />
          <InputRightElement>
            <SearchIcon color="gray.500" />
          </InputRightElement>
        </InputGroup>
        <Button colorScheme="blue" leftIcon={<AddIcon />} onClick={onOpen}>
          Создать категорию
        </Button>
      </Flex>

      <TableContainer overflowX="auto">
        <Table variant="striped" size="sm">
          <Thead position="sticky" top={0} zIndex={1} bg="white">
            <Tr>
              <Th>Название</Th>
              <Th>Отделение</Th>
              <Th>Цена</Th>
              <Th>Биоматериал</Th>
              <Th>Норма</Th>
              <Th>Реф. норма</Th>
              <Th>Ед. изм.</Th>
              <Th>Параметров</Th>
              <Th>Статус</Th>
              <Th>Действия</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredCategories.map((cat) => {
              let testsCount = 0;
              if (cat.tests) {
                try {
                  const tests =
                    typeof cat.tests === "string"
                      ? JSON.parse(cat.tests)
                      : cat.tests;
                  testsCount = Array.isArray(tests) ? tests.length : 0;
                } catch (e) {
                  testsCount = 0;
                }
              }

              return (
                <Tr key={cat.id}>
                  <Td fontWeight="medium">
                    <Box>
                      <Text fontWeight="bold">{cat.name}</Text>
                      {cat.shortName && (
                        <Text fontSize="sm" color="gray.600">
                          {cat.shortName}
                        </Text>
                      )}
                    </Box>
                  </Td>
                  <Td>
                    {cat.department ? (
                      <Badge colorScheme="purple">{cat.department}</Badge>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td fontWeight="bold" color="green.600">
                    {(cat.basePrice || 0).toLocaleString()} сум
                  </Td>
                  <Td fontSize="sm">
                    <Box>
                      <Text>{cat.sampleType || "—"}</Text>
                      {cat.sampleVolume && (
                        <Text fontSize="xs" color="gray.500">
                          {cat.sampleVolume}
                        </Text>
                      )}
                    </Box>
                  </Td>
                  <Td>
                    {cat.normalRange ? (
                      <Badge colorScheme="green">{cat.normalRange}</Badge>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td>
                    {cat.referenceValue ? (
                      <Badge colorScheme="blue">{cat.referenceValue}</Badge>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td>{cat.unit || "—"}</Td>
                  <Td>
                    <Badge colorScheme={testsCount > 0 ? "green" : "gray"}>
                      {testsCount}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={cat.isActive ? "green" : "red"}>
                      {cat.isActive ? "Активна" : "Неактивна"}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Tooltip label="Редактировать">
                        <IconButton
                          icon={<EditIcon />}
                          size="xs"
                          colorScheme="yellow"
                          onClick={() => handleEdit(cat)}
                          aria-label="Редактировать"
                        />
                      </Tooltip>
                      <Tooltip label="Удалить">
                        <IconButton
                          icon={<DeleteIcon />}
                          size="xs"
                          colorScheme="red"
                          onClick={() => handleDelete(cat.id)}
                          aria-label="Удалить"
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>

      {filteredCategories.length === 0 && (
        <Box textAlign="center" py={10}>
          <Text color="gray.500">
            {search ? "Категории не найдены" : "Нет категорий для отображения"}
          </Text>
        </Box>
      )}

      {/* Модальное окно создания/редактирования */}
      <Modal isOpen={isOpen} onClose={handleClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "Редактировать категорию" : "Создать категорию"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              {/* Основная информация */}
              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Полное название</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Общий анализ крови"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Краткое название</FormLabel>
                  <Input
                    value={formData.shortName}
                    onChange={(e) =>
                      setFormData({ ...formData, shortName: e.target.value })
                    }
                    placeholder="ОАК"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Отделение</FormLabel>
                  <Select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                  >
                    <option value="">Не указано</option>
                    <option value="Клиническая лаборатория">
                      Клиническая лаборатория
                    </option>
                    <option value="Биохимическая лаборатория">
                      Биохимическая лаборатория
                    </option>
                    <option value="Бактериологическая лаборатория">
                      Бактериологические исследования
                    </option>
                    <option value="Гормональная лаборатория">
                      Гормональная лаборатория
                    </option>
                    <option value="Микробиологическая лаборатория">
                      Микробиологическая лаборатория
                    </option>
                    <option value="Коагулограмма ">Коагулограмма </option>
                    <option value="ПЦР лаборатория">ПЦР лаборатория</option>
                    <option value="Иммунохроматографический анализ">
                      Иммунохроматографический анализ
                    </option>
                    <option value="Иммуноферментный анализ">
                      Иммуноферментный анализ (ИФА)
                    </option>
                    <option value="Иммунохемилюминисцентный анализ">
                      Иммунохемилюминисцентный анализ (ИХЛА)
                    </option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Номенклатура</FormLabel>
                  <Input
                    value={formData.nomenclature}
                    onChange={(e) =>
                      setFormData({ ...formData, nomenclature: e.target.value })
                    }
                    placeholder="Код по номенклатуре"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Описание</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Описание категории анализов"
                  rows={3}
                />
              </FormControl>

              <Divider />

              {/* Цена и сортировка */}
              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Базовая цена (сум)</FormLabel>
                  <NumberInput
                    value={formData.basePrice}
                    onChange={(valueString) =>
                      setFormData({
                        ...formData,
                        basePrice: parseInt(valueString) || 0,
                      })
                    }
                    min={0}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Порядок сортировки</FormLabel>
                  <NumberInput
                    value={formData.orderIndex}
                    onChange={(valueString) =>
                      setFormData({
                        ...formData,
                        orderIndex: parseInt(valueString) || 0,
                      })
                    }
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

              <Divider />

              {/* Биоматериал */}
              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>Тип биоматериала</FormLabel>
                  <Select
                    value={formData.sampleType}
                    onChange={(e) =>
                      setFormData({ ...formData, sampleType: e.target.value })
                    }
                  >
                    <option value="Кровь (сыворотка)">Кровь (сыворотка)</option>
                    <option value="Кровь (плазма)">Кровь (плазма)</option>
                    <option value="Цельная кровь">Цельная кровь</option>
                    <option value="Моча">Моча</option>
                    <option value="Кал">Кал</option>
                    <option value="Мазок">Мазок</option>
                    <option value="Слюна">Слюна</option>
                    <option value="Спинномозговая жидкость">
                      Спинномозговая жидкость
                    </option>
                    <option value="Синовиальная жидкость">
                      Синовиальная жидкость
                    </option>
                    <option value="Плевральная жидкость">
                      Плевральная жидкость
                    </option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Требуемый объем</FormLabel>
                  <Input
                    value={formData.sampleVolume}
                    onChange={(e) =>
                      setFormData({ ...formData, sampleVolume: e.target.value })
                    }
                    placeholder="Например: 5 мл"
                  />
                </FormControl>
              </SimpleGrid>

              <Divider />

              {/* Поля нормы и единиц измерения */}
              <SimpleGrid columns={3} spacing={4}>
                <FormControl>
                  <FormLabel>Диапазон нормы</FormLabel>
                  <Input
                    value={formData.normalRange}
                    onChange={(e) =>
                      setFormData({ ...formData, normalRange: e.target.value })
                    }
                    placeholder="Например: 120-150"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Референтная норма</FormLabel>
                  <Select
                    value={formData.referenceValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        referenceValue: e.target.value,
                      })
                    }
                  >
                    <option value="">Не указано</option>
                    <option value="Отрицательно">Отрицательно</option>
                    <option value="Положительно">Положительно</option>
                    <option value="Норма">Норма</option>
                    <option value="Выше нормы">Выше нормы</option>
                    <option value="Ниже нормы">Ниже нормы</option>
                    <option value="Пограничный">Пограничный</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Единица измерения</FormLabel>
                  <Input
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    placeholder="Например: г/л, ммоль/л, МЕ/л"
                  />
                </FormControl>
              </SimpleGrid>

              <Divider />

              {/* Статус */}
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Активная категория</FormLabel>
                <Switch
                  isChecked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  colorScheme="green"
                />
              </FormControl>
            </VStack>

            <HStack spacing={3} mt={6}>
              <Button onClick={handleClose}>Отмена</Button>
              <Button colorScheme="blue" onClick={handleCreateOrUpdate}>
                {isEditing ? "Сохранить изменения" : "Создать категорию"}
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Lab;
