import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
  VStack,
  HStack,
  Badge,
  IconButton,
  Select,
  NumberInput,
  NumberInputField,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Text,
  Card,
  CardBody,
  Checkbox,
  useDisclosure,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, ViewIcon, CopyIcon } from "@chakra-ui/icons";
import { getApiBaseUrl } from "../../utils/api";

const BlanksPage = () => {
  const [blanks, setBlanks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingBlank, setEditingBlank] = useState(null);
  const toast = useToast();
  const api = getApiBaseUrl();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const contentEditableRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    content: "",
    department: "",
    code: "",
    executionTime: 24,
    sampleType: "Кровь (сыворотка)",
    category: "",
    isActive: true,
  });

  useEffect(() => {
    loadBlanks();
  }, []);

  const loadBlanks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${api}/blanks`);
      const data = await response.json();
      setBlanks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Ошибка загрузки бланков:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список бланков",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingBlank(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      content: "",
      department: "",
      code: "",
      executionTime: 24,
      sampleType: "Кровь (сыворотка)",
      category: "",
      isActive: true,
    });
    onOpen();
  };

  const handleOpenEdit = (blank) => {
    setEditingBlank(blank);
    setFormData({
      name: blank.name || "",
      description: blank.description || "",
      price: blank.price || 0,
      content: blank.content || "",
      department: blank.department || "",
      code: blank.code || "",
      executionTime: blank.executionTime || 24,
      sampleType: blank.sampleType || "Кровь (сыворотка)",
      category: blank.category || "",
      isActive: blank.isActive !== false,
    });
    onOpen();

    // Задержка для загрузки HTML в редактор
    setTimeout(() => {
      if (contentEditableRef.current) {
        contentEditableRef.current.innerHTML = blank.content || "";
      }
    }, 100);
  };

  const handlePaste = (e) => {
    e.preventDefault();

    // Получаем данные из буфера обмена
    const clipboardData = e.clipboardData || window.clipboardData;
    const htmlData = clipboardData.getData("text/html");
    const textData = clipboardData.getData("text/plain");

    if (htmlData) {
      // Если есть HTML (из Word/Excel), вставляем его
      document.execCommand("insertHTML", false, htmlData);
    } else if (textData) {
      // Если только текст, создаем простую таблицу
      const lines = textData.split("\n").filter((line) => line.trim());
      const rows = lines
        .map((line) => {
          const cells = line.split("\t");
          return `<tr>${cells
            .map(
              (cell) =>
                `<td style="border: 1px solid #000; padding: 8px;">${cell}</td>`
            )
            .join("")}</tr>`;
        })
        .join("");

      const table = `<table style="border-collapse: collapse; width: 100%; margin: 10px 0;">${rows}</table>`;
      document.execCommand("insertHTML", false, table);
    }

    // Обновляем состояние
    updateContentFromEditor();
  };

  const updateContentFromEditor = () => {
    if (contentEditableRef.current) {
      setFormData((prev) => ({
        ...prev,
        content: contentEditableRef.current.innerHTML,
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.content) {
      toast({
        title: "Ошибка",
        description: "Заполните название и содержимое бланка",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      const url = editingBlank
        ? `${api}/blank/update/${editingBlank.id}`
        : `${api}/blank/create`;

      const method = editingBlank ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Ошибка сохранения");

      toast({
        title: "Успешно",
        description: editingBlank ? "Бланк обновлен" : "Бланк создан",
        status: "success",
        duration: 3000,
      });

      onClose();
      loadBlanks();
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить бланк",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот бланк?")) return;

    try {
      const response = await fetch(`${api}/blank/delete/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Ошибка удаления");

      toast({
        title: "Успешно",
        description: "Бланк удален",
        status: "success",
        duration: 3000,
      });

      loadBlanks();
    } catch (error) {
      console.error("Ошибка удаления:", error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить бланк",
        status: "error",
        duration: 3000,
      });
    }
  };

  const insertTable = () => {
    const table = `
      <table style="border-collapse: collapse; width: 100%; margin: 10px 0;">
        <thead>
          <tr style="background: #f0f0f0;">
            <th style="border: 1px solid #000; padding: 8px;">№</th>
            <th style="border: 1px solid #000; padding: 8px;">Показатель</th>
            <th style="border: 1px solid #000; padding: 8px;">Результат</th>
            <th style="border: 1px solid #000; padding: 8px;">Ед. изм.</th>
            <th style="border: 1px solid #000; padding: 8px;">Референтные значения</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #000; padding: 8px;">1</td>
            <td style="border: 1px solid #000; padding: 8px;">WBC (Лейкоциты)</td>
            <td style="border: 1px solid #000; padding: 8px; background: #FFFFCC;" contenteditable="true"></td>
            <td style="border: 1px solid #000; padding: 8px;">10^9/L</td>
            <td style="border: 1px solid #000; padding: 8px;">4.00-10.00</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px;">2</td>
            <td style="border: 1px solid #000; padding: 8px;">RBC (Эритроциты)</td>
            <td style="border: 1px solid #000; padding: 8px; background: #FFFFCC;" contenteditable="true"></td>
            <td style="border: 1px solid #000; padding: 8px;">10^12/L</td>
            <td style="border: 1px solid #000; padding: 8px;">3.50-5.20</td>
          </tr>
        </tbody>
      </table>
    `;

    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML += table;
      updateContentFromEditor();
    }
  };

  const filteredBlanks = blanks.filter((blank) => {
    const term = searchTerm.toLowerCase();
    return (
      blank.name?.toLowerCase().includes(term) ||
      blank.code?.toLowerCase().includes(term) ||
      blank.department?.toLowerCase().includes(term) ||
      blank.category?.toLowerCase().includes(term)
    );
  });

  return (
    <Box p={4} bg="white" borderRadius="16px" w="100%">
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Input
            placeholder="🔍 Поиск бланков..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW="400px"
          />
          <Button colorScheme="blue" onClick={handleOpenCreate}>
            + Создать бланк
          </Button>
        </HStack>

        <TableContainer>
          <Table variant="striped" size="sm">
            <Thead bg="gray.100">
              <Tr>
                <Th>ID</Th>
                <Th>Название</Th>
                <Th>Отделение</Th>
                <Th>Цена</Th>
                <Th>Статус</Th>
                <Th>Действия</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredBlanks.map((blank) => (
                <Tr key={blank.id}>
                  <Td fontWeight="bold">{blank.id}</Td>
                  <Td>{blank.name}</Td>

                  <Td fontSize="sm">{blank.department || "—"}</Td>
                  <Td fontWeight="bold" color="green.600">
                    {(blank.price || 0).toLocaleString()} сум
                  </Td>

                  <Td>
                    {blank.isActive ? (
                      <Badge colorScheme="green">Активен</Badge>
                    ) : (
                      <Badge colorScheme="gray">Неактивен</Badge>
                    )}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<EditIcon />}
                        size="xs"
                        colorScheme="blue"
                        onClick={() => handleOpenEdit(blank)}
                        aria-label="Редактировать"
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        size="xs"
                        colorScheme="red"
                        onClick={() => handleDelete(blank.id)}
                        aria-label="Удалить"
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        {filteredBlanks.length === 0 && (
          <Alert status="info">
            <AlertIcon />
            Бланки не найдены. Создайте первый бланк.
          </Alert>
        )}
      </VStack>

      {/* Модальное окно создания/редактирования */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>
            {editingBlank ? "Редактирование бланка" : "Создание нового бланка"}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody overflowY="auto">
            <Tabs>
              <TabList>
                <Tab>Основная информация</Tab>
                <Tab>Содержимое (таблица)</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Название бланка</FormLabel>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Например: Hematology Analysis Report"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Описание</FormLabel>
                      <Textarea
                        minH={"200px"}
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Краткое описание исследования"
                        rows={2}
                      />
                    </FormControl>

                    <HStack>
                      <FormControl isRequired>
                        <FormLabel>Цена (сум)</FormLabel>
                        <NumberInput
                          value={formData.price}
                          onChange={(val) =>
                            setFormData({
                              ...formData,
                              price: parseFloat(val) || 0,
                            })
                          }
                          min={0}
                        >
                          <NumberInputField />
                        </NumberInput>
                      </FormControl>
                    </HStack>

                    <HStack>
                      <FormControl>
                        <FormLabel>Отделение</FormLabel>
                        <Select
                          value={formData.department}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              department: e.target.value,
                            })
                          }
                        >
                          <option value="">Выберите отделение</option>
                          <option value="Гематология">Гематология</option>
                          <option value="Биохимия">Биохимия</option>
                          <option value="Иммунология">Иммунология</option>
                          <option value="Микробиология">Микробиология</option>
                          <option value="Молекулярная диагностика">
                            Молекулярная диагностика
                          </option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Категория</FormLabel>
                        <Input
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                          placeholder="Общий анализ"
                        />
                      </FormControl>
                    </HStack>

                    <HStack>
                      <FormControl>
                        <FormLabel>Тип биоматериала</FormLabel>
                        <Select
                          value={formData.sampleType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sampleType: e.target.value,
                            })
                          }
                        >
                          <option value="Кровь (сыворотка)">
                            Кровь (сыворотка)
                          </option>
                          <option value="Кровь (плазма)">Кровь (плазма)</option>
                          <option value="Кровь (цельная)">
                            Кровь (цельная)
                          </option>
                          <option value="Моча">Моча</option>
                          <option value="Кал">Кал</option>
                          <option value="Слюна">Слюна</option>
                          <option value="Мазок">Мазок</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel display={"none"}>
                          Время выполнения (часов)
                        </FormLabel>
                        <NumberInput
                          display={"none"}
                          value={formData.executionTime}
                          onChange={(val) =>
                            setFormData({
                              ...formData,
                              executionTime: parseInt(val) || 24,
                            })
                          }
                          min={1}
                        >
                          <NumberInputField />
                        </NumberInput>
                      </FormControl>
                    </HStack>

                    <FormControl>
                      <Checkbox
                        isChecked={formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
                      >
                        Бланк активен
                      </Checkbox>
                    </FormControl>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    <Button colorScheme="green" onClick={insertTable} size="sm">
                      + Вставить шаблон таблицы
                    </Button>

                    <FormControl isRequired>
                      <FormLabel>
                        Содержимое бланка (можно вставить из Word/Excel)
                      </FormLabel>
                      <Box
                        ref={contentEditableRef}
                        contentEditable
                        onPaste={handlePaste}
                        onInput={updateContentFromEditor}
                        border="2px solid"
                        borderColor="blue.300"
                        borderRadius="md"
                        p={4}
                        minH="400px"
                        maxH="500px"
                        overflowY="auto"
                        bg="white"
                        dangerouslySetInnerHTML={{ __html: formData.content }}
                        style={{
                          outline: "none",
                        }}
                      />
                    </FormControl>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Отмена
            </Button>
            <Button colorScheme="blue" onClick={handleSave} isLoading={loading}>
              {editingBlank ? "Сохранить изменения" : "Создать бланк"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BlanksPage;
