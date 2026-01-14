"use client";
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
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
} from "@chakra-ui/react";
import {
  DeleteIcon,
  EditIcon,
  AddIcon,
  MinusIcon,
  CopyIcon,
  DownloadIcon,
  ChevronDownIcon,
} from "@chakra-ui/icons";
import { getApiBaseUrl } from "../../utils/api";

const TableIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M20 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14H5v-2h6v2zm8 0h-6v-2h6v2zm0-4H5v-2h14v2zM5 7h14v2H5z" />
  </svg>
);

const FontSizeIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z" />
  </svg>
);

const BoldIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
  </svg>
);

const ItalicIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" />
  </svg>
);

const UnderlineIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
  </svg>
);

const AlignLeftIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" />
  </svg>
);

const AlignCenterIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
  </svg>
);

const AlignRightIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />
  </svg>
);

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
  };

  // Улучшенная функция вставки с сохранением стилей
  // Улучшенная функция вставки с правильной обработкой таблиц
  const handlePaste = (e) => {
    e.preventDefault();

    const clipboardData = e.clipboardData || window.clipboardData;
    let htmlData = clipboardData.getData("text/html");
    const textData = clipboardData.getData("text/plain");

    // Если есть HTML из Word/Excel
    if (htmlData) {
      // Создаем временный контейнер для парсинга
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlData;

      // Проверяем, есть ли таблицы
      const tables = tempDiv.querySelectorAll("table");

      if (tables.length > 0) {
        // Обрабатываем каждую таблицу
        tables.forEach((table) => {
          // Применяем стили для правильного отображения
          table.style.borderCollapse = "collapse";
          table.style.width = "100%";
          table.style.margin = "15px 0";
          table.style.fontSize = "12px";

          // Обрабатываем ячейки
          const rows = table.querySelectorAll("tr");
          rows.forEach((row) => {
            const cells = row.querySelectorAll("td, th");
            cells.forEach((cell) => {
              cell.style.border = "1px solid #000";
              cell.style.padding = "8px";

              // Для ячеек с результатами делаем желтый фон
              if (cell.textContent.trim() === "") {
                cell.style.backgroundColor = "#FFFFCC";
                cell.setAttribute("contenteditable", "true");
              }

              // Для заголовков делаем серый фон
              if (cell.tagName === "TH") {
                cell.style.backgroundColor = "#f0f0f0";
                cell.style.fontWeight = "bold";
                cell.style.textAlign = "center";
              }
            });
          });
        });

        // Вставляем обработанный HTML
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(tempDiv);
      } else {
        // Если нет таблиц, вставляем как есть с базовыми стилями
        document.execCommand("insertHTML", false, htmlData);
      }
    }
    // Если вставлен текст с табуляцией (из Excel)
    else if (textData) {
      const lines = textData.split("\n").filter((line) => line.trim());

      // Проверяем, есть ли табуляция (признак таблицы из Excel)
      const hasTabs = lines.some((line) => line.includes("\t"));

      if (hasTabs && lines.length > 1) {
        // Создаем таблицу с правильной структурой
        let tableHTML = `
        <table style="border-collapse: collapse; width: 100%; margin: 15px 0; font-size: 12px;">
          <tbody>
      `;

        lines.forEach((line, rowIndex) => {
          const cells = line.split("\t");
          tableHTML += "<tr>";

          cells.forEach((cell, cellIndex) => {
            const isHeaderRow = rowIndex === 0;
            const isResultCell = cellIndex === 2; // Третий столбец для результатов

            const tag = isHeaderRow ? "th" : "td";
            const bgColor = isHeaderRow
              ? "#f0f0f0"
              : isResultCell
              ? "#FFFFCC"
              : "transparent";
            const textAlign = isHeaderRow ? "center" : "left";
            const fontWeight = isHeaderRow ? "bold" : "normal";

            const content =
              isResultCell && !isHeaderRow
                ? `<span contenteditable="true">${cell}</span>`
                : cell;

            tableHTML += `
            <${tag} style="
              border: 1px solid #000;
              padding: 8px;
              background-color: ${bgColor};
              text-align: ${textAlign};
              font-weight: ${fontWeight};
            ">
              ${content}
            </${tag}>
          `;
          });

          tableHTML += "</tr>";
        });

        tableHTML += "</tbody></table>";

        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const div = document.createElement("div");
        div.innerHTML = tableHTML;
        range.deleteContents();
        range.insertNode(div);
      } else {
        // Обычный текст без таблицы
        document.execCommand("insertText", false, textData);
      }
    }

    updateContentFromEditor();
  };

  // Добавьте эту функцию в компонент BlanksPage
  const fixExistingTables = () => {
    if (contentEditableRef.current) {
      const tables = contentEditableRef.current.querySelectorAll("table");

      tables.forEach((table) => {
        // Применяем базовые стили для всех таблиц
        table.style.borderCollapse = "collapse";
        table.style.width = "100%";
        table.style.margin = "15px 0";
        table.style.fontSize = "12px";

        // Обрабатываем все ячейки
        const cells = table.querySelectorAll("td, th");
        cells.forEach((cell) => {
          if (!cell.style.border || cell.style.border === "none") {
            cell.style.border = "1px solid #000";
          }

          if (!cell.style.padding) {
            cell.style.padding = "8px";
          }

          // Для пустых ячеек или ячеек с результатами
          if (
            cell.textContent.trim() === "" ||
            cell.getAttribute("contenteditable") === "true"
          ) {
            cell.style.backgroundColor = "#FFFFCC";
            cell.setAttribute("contenteditable", "true");
          }

          // Для заголовков
          if (cell.tagName === "TH") {
            cell.style.backgroundColor = "#f0f0f0";
            cell.style.fontWeight = "bold";
            cell.style.textAlign = "center";
          }
        });
      });

      updateContentFromEditor();
    }
  };

  const updateContentFromEditor = () => {
    if (contentEditableRef.current) {
      setFormData((prev) => ({
        ...prev,
        content: contentEditableRef.current.innerHTML,
      }));
    }
  };

  // Функции для редактирования таблицы
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    updateContentFromEditor();
  };

  const insertTable = (rows = 3, cols = 5) => {
    let tableHTML = `
    <table style="
      border-collapse: collapse;
      width: 100%;
      margin: 15px 0;
      font-size: 12px;
      border: 2px solid #2B7EC1;
    ">
  `;

    // Заголовок таблицы
    tableHTML += `
    <thead>
      <tr style="background: linear-gradient(to right, #f0f0f0, #e0e0e0);">
  `;

    for (let i = 0; i < cols; i++) {
      const headers = ["№", "Показатель", "Результат", "Ед. изм.", "Норма"];
      const headerText = headers[i] || `Заголовок ${i + 1}`;

      tableHTML += `
      <th style="
        border: 1px solid #000;
        padding: 10px;
        text-align: center;
        font-weight: bold;
        color: #2B7EC1;
      ">
        ${headerText}
      </th>
    `;
    }

    tableHTML += `</tr></thead><tbody>`;

    // Строки данных
    for (let i = 0; i < rows; i++) {
      tableHTML += `<tr>`;

      for (let j = 0; j < cols; j++) {
        const isFirstCell = j === 0;
        const isResultCell = j === 2;
        const isLastCell = j === cols - 1;

        let cellContent = "";
        let align = "left";

        if (isFirstCell) {
          cellContent = (i + 1).toString();
          align = "center";
        } else if (isResultCell) {
          cellContent =
            '<span contenteditable="true" style="display: block; min-height: 24px;">&nbsp;</span>';
        } else if (isLastCell) {
          cellContent = "—";
          align = "center";
        } else {
          cellContent = "Значение";
        }

        tableHTML += `
        <td style="
          border: 1px solid #000;
          padding: 8px;
          text-align: ${align};
          ${isResultCell ? "background-color: #FFFFCC;" : ""}
          ${i % 2 === 0 ? "background-color: #f9f9f9;" : ""}
        ">
          ${cellContent}
        </td>
      `;
      }

      tableHTML += `</tr>`;
    }

    tableHTML += `</tbody></table>`;

    if (contentEditableRef.current) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const div = document.createElement("div");
      div.innerHTML = tableHTML;
      range.insertNode(div);
      updateContentFromEditor();
    }
  };

  const addTableRow = () => {
    const selection = window.getSelection();
    const table = selection.anchorNode?.closest?.("table");

    if (table) {
      const tbody = table.querySelector("tbody") || table;
      const lastRow = tbody.lastElementChild;
      if (lastRow) {
        const newRow = lastRow.cloneNode(true);
        // Очищаем ячейки в новой строке
        newRow.querySelectorAll("td, th").forEach((cell) => {
          if (cell.hasAttribute("contenteditable")) {
            cell.innerHTML = "";
          } else {
            cell.innerHTML = "Новое значение";
          }
        });
        tbody.appendChild(newRow);
        updateContentFromEditor();
      }
    } else {
      toast({
        title: "Внимание",
        description: "Выделите таблицу для добавления строки",
        status: "warning",
      });
    }
  };

  const addTableColumn = () => {
    const selection = window.getSelection();
    const table = selection.anchorNode?.closest?.("table");

    if (table) {
      const rows = table.querySelectorAll("tr");
      rows.forEach((row, rowIndex) => {
        const cell = document.createElement(rowIndex === 0 ? "th" : "td");
        cell.style.border = "1px solid #000";
        cell.style.padding = "8px";

        if (rowIndex === 0) {
          cell.style.background = "#f0f0f0";
          cell.style.fontWeight = "bold";
          cell.style.textAlign = "center";
          cell.innerHTML = "Новый столбец";
        } else {
          const isResultCol = row.children.length === 2; // Второй столбец для результатов
          if (isResultCol) {
            cell.style.background = "#FFFFCC";
            cell.innerHTML = '<span contenteditable="true"> </span>';
          } else {
            cell.innerHTML = "Значение";
          }
        }

        row.appendChild(cell);
      });
      updateContentFromEditor();
    } else {
      toast({
        title: "Внимание",
        description: "Выделите таблицу для добавления столбца",
        status: "warning",
      });
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
                <Tab>Редактор бланка</Tab>
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
                    {/* Панель инструментов */}
                    <Box
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                    >
                      <HStack spacing={2} wrap="wrap">
                        <Menu>
                          <MenuButton
                            as={Button}
                            size="sm"
                            leftIcon={<FontSizeIcon />}
                            rightIcon={<ChevronDownIcon />}
                          >
                            Размер текста
                          </MenuButton>
                          <MenuList>
                            <MenuItem
                              onClick={() => formatText("fontSize", "1")}
                            >
                              Очень маленький
                            </MenuItem>
                            <MenuItem
                              onClick={() => formatText("fontSize", "2")}
                            >
                              Маленький
                            </MenuItem>
                            <MenuItem
                              onClick={() => formatText("fontSize", "3")}
                            >
                              Обычный
                            </MenuItem>
                            <MenuItem
                              onClick={() => formatText("fontSize", "4")}
                            >
                              Средний
                            </MenuItem>
                            <MenuItem
                              onClick={() => formatText("fontSize", "5")}
                            >
                              Крупный
                            </MenuItem>
                            <MenuItem
                              onClick={() => formatText("fontSize", "6")}
                            >
                              Очень крупный
                            </MenuItem>
                            <MenuItem
                              onClick={() => formatText("fontSize", "7")}
                            >
                              Огромный
                            </MenuItem>
                          </MenuList>
                        </Menu>

                        <HStack>
                          <Tooltip label="Жирный">
                            <IconButton
                              size="sm"
                              icon={<BoldIcon />}
                              onClick={() => formatText("bold")}
                              aria-label="Жирный"
                            />
                          </Tooltip>
                          <Tooltip label="Курсив">
                            <IconButton
                              size="sm"
                              icon={<ItalicIcon />}
                              onClick={() => formatText("italic")}
                              aria-label="Курсив"
                            />
                          </Tooltip>
                          <Tooltip label="Подчеркнутый">
                            <IconButton
                              size="sm"
                              icon={<UnderlineIcon />}
                              onClick={() => formatText("underline")}
                              aria-label="Подчеркнутый"
                            />
                          </Tooltip>
                        </HStack>

                        <HStack>
                          <Tooltip label="Выравнивание по левому краю">
                            <IconButton
                              size="sm"
                              icon={<AlignLeftIcon />}
                              onClick={() => formatText("justifyLeft")}
                              aria-label="Выравнивание по левому краю"
                            />
                          </Tooltip>
                          <Tooltip label="Выравнивание по центру">
                            <IconButton
                              size="sm"
                              icon={<AlignCenterIcon />}
                              onClick={() => formatText("justifyCenter")}
                              aria-label="Выравнивание по центру"
                            />
                          </Tooltip>
                          <Tooltip label="Выравнивание по правому краю">
                            <IconButton
                              size="sm"
                              icon={<AlignRightIcon />}
                              onClick={() => formatText("justifyRight")}
                              aria-label="Выравнивание по правому краю"
                            />
                          </Tooltip>
                        </HStack>

                        <Menu>
                          <MenuButton
                            as={Button}
                            size="sm"
                            leftIcon={<TableIcon />}
                            rightIcon={<ChevronDownIcon />}
                          >
                            Таблица
                          </MenuButton>
                          <MenuList>
                            <MenuGroup title="Создать таблицу">
                              <MenuItem onClick={() => insertTable(3, 5)}>
                                3x5 (стандартная)
                              </MenuItem>
                              <MenuItem onClick={() => insertTable(5, 7)}>
                                5x7 (большая)
                              </MenuItem>
                              <MenuItem onClick={() => insertTable(2, 4)}>
                                2x4 (маленькая)
                              </MenuItem>
                            </MenuGroup>
                            <MenuGroup title="Редактировать таблицу">
                              <MenuItem
                                onClick={addTableRow}
                                icon={<AddIcon />}
                              >
                                Добавить строку
                              </MenuItem>
                              <MenuItem
                                onClick={addTableColumn}
                                icon={<AddIcon />}
                              >
                                Добавить столбец
                              </MenuItem>
                            </MenuGroup>
                          </MenuList>
                        </Menu>

                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() => {
                            // Шаблон для гематологии
                            const template = `
                              <h3 style="text-align: center; color: #2B7EC1; margin-bottom: 20px;">ГЕМАТОЛОГИЧЕСКОЕ ИССЛЕДОВАНИЕ</h3>
                              <table style="border-collapse: collapse; width: 100%; margin: 15px 0; font-size: 12px;">
                                <thead>
                                  <tr style="background: #f0f0f0;">
                                    <th style="border: 1px solid #000; padding: 8px; text-align: center;">№</th>
                                    <th style="border: 1px solid #000; padding: 8px; text-align: center;">Показатель</th>
                                    <th style="border: 1px solid #000; padding: 8px; text-align: center;">Результат</th>
                                    <th style="border: 1px solid #000; padding: 8px; text-align: center;">Ед. изм.</th>
                                    <th style="border: 1px solid #000; padding: 8px; text-align: center;">Референтные значения</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">1</td>
                                    <td style="border: 1px solid #000; padding: 8px;">WBC (Лейкоциты)</td>
                                    <td style="border: 1px solid #000; padding: 8px; background: #FFFFCC;">
                                      <span contenteditable="true"> </span>
                                    </td>
                                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">10^9/L</td>
                                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">4.00-10.00</td>
                                  </tr>
                                  <tr>
                                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">2</td>
                                    <td style="border: 1px solid #000; padding: 8px;">RBC (Эритроциты)</td>
                                    <td style="border: 1px solid #000; padding: 8px; background: #FFFFCC;">
                                      <span contenteditable="true"> </span>
                                    </td>
                                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">10^12/L</td>
                                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">3.50-5.20</td>
                                  </tr>
                                  <tr>
                                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">3</td>
                                    <td style="border: 1px solid #000; padding: 8px;">HGB (Гемоглобин)</td>
                                    <td style="border: 1px solid #000; padding: 8px; background: #FFFFCC;">
                                      <span contenteditable="true"> </span>
                                    </td>
                                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">g/L</td>
                                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">120-160</td>
                                  </tr>
                                </tbody>
                              </table>
                            `;

                            if (contentEditableRef.current) {
                              contentEditableRef.current.innerHTML += template;
                              updateContentFromEditor();
                            }
                          }}
                        >
                          Шаблон гематологии
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="orange"
                          onClick={fixExistingTables}
                          leftIcon={<EditIcon />}
                        >
                          Исправить таблицы
                        </Button>
                      </HStack>
                    </Box>

                    <FormControl isRequired>
                      <FormLabel>
                        Содержимое бланка (можно вставить из Word/Excel с
                        сохранением таблиц)
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
                        minH="500px"
                        maxH="600px"
                        overflowY="auto"
                        bg="white"
                        dangerouslySetInnerHTML={{ __html: formData.content }}
                        style={{
                          outline: "none",
                          fontFamily: "Arial, sans-serif",
                          fontSize: "14px",
                          lineHeight: "1.5",
                        }}
                      />
                      <Text fontSize="xs" color="gray.600" mt={2}>
                        Подсказка: Вставляйте таблицы из Word/Excel - они
                        сохранят свою структуру. Для редактирования результатов
                        используйте ячейки с желтым фоном.
                      </Text>
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
