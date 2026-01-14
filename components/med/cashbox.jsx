"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
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
  Badge,
  Select,
  Button,
  HStack,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useToast,
  VStack,
  SimpleGrid,
  Divider,
  IconButton,
  Flex,
  Grid,
  GridItem,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { SearchIcon, DownloadIcon } from "@chakra-ui/icons";
import { getApiBaseUrl } from "../../utils/api";

const PrinterIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
  </svg>
);

function Cashbox() {
  const [cashRecords, setCashRecords] = useState([]);
  const [clients, setClients] = useState({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [receiptOperationId, setReceiptOperationId] = useState("");
  const toast = useToast();
  const api = getApiBaseUrl();

  const {
    isOpen: isPaymentOpen,
    onOpen: onPaymentOpen,
    onClose: onPaymentClose,
  } = useDisclosure();

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: "cash",
  });

  useEffect(() => {
    loadCashRecords();
  }, []);

  const parseDate = (dateString) => {
    if (!dateString) return new Date();
    let date = new Date(dateString);
    if (isNaN(date.getTime())) {
      date = new Date(parseInt(dateString));
    }
    if (isNaN(date.getTime())) {
      return new Date();
    }
    return date;
  };

  const formatDateForTable = (dateString) => {
    const date = parseDate(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatDateTimeForReceipt = (dateString) => {
    const date = parseDate(dateString);
    return {
      date: date.toLocaleDateString("ru-RU"),
      time: date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const loadCashRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${api}/cashbox`);
      if (!response.ok) throw new Error("Ошибка загрузки кассы");

      const data = await response.json();
      const records = Array.isArray(data) ? data : [];

      setCashRecords(records);

      const clientIds = [...new Set(records.map((r) => r.clientId))];
      const clientsData = {};

      await Promise.all(
        clientIds.map(async (clientId) => {
          try {
            const response = await fetch(`${api}/client/${clientId}`);
            if (response.ok) {
              const client = await response.json();
              clientsData[clientId] = client;
            }
          } catch (error) {
            console.error(`Ошибка загрузки клиента ${clientId}:`, error);
          }
        })
      );

      setClients(clientsData);
    } catch (error) {
      console.error("Ошибка загрузки кассы:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить записи кассы",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (clientId) => {
    const client = clients[clientId];
    if (!client) return "—";
    const surname = client.surname || "";
    const name = client.name || "";
    const lastName = client.lastName || "";
    return `${surname} ${name} ${lastName}`.trim() || "—";
  };

  const getClientPhone = (clientId) => {
    return clients[clientId]?.phoneNumber || "—";
  };

  const filteredRecords = useMemo(() => {
    return cashRecords.filter((record) => {
      const clientName = getClientName(record.clientId).toLowerCase();
      const clientPhone = getClientPhone(record.clientId).toLowerCase();

      const searchMatch = [
        record.id?.toString(),
        clientName,
        clientPhone,
        record.servicesDescription?.toLowerCase(),
      ].some((field) => field?.includes(search.toLowerCase()));

      const statusMatch =
        filterStatus === "all" || record.status === filterStatus;

      const paymentMatch =
        filterPayment === "all" || record.paymentMethod === filterPayment;

      let periodMatch = true;
      if (filterPeriod !== "all") {
        // Используем createdAt для фильтрации периода
        const recordDate = parseDate(
          record.createdAt || record.transactionDate
        );
        const today = new Date();

        if (filterPeriod === "today") {
          periodMatch = recordDate.toDateString() === today.toDateString();
        } else if (filterPeriod === "week") {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          periodMatch = recordDate >= weekAgo;
        } else if (filterPeriod === "month") {
          periodMatch =
            recordDate.getMonth() === today.getMonth() &&
            recordDate.getFullYear() === today.getFullYear();
        }
      }

      return searchMatch && statusMatch && paymentMatch && periodMatch;
    });
  }, [cashRecords, search, filterStatus, filterPayment, filterPeriod]);

  const getStatusBadge = (status) => {
    const statusMap = {
      paid: { label: "Оплачено", color: "green" },
      partial: { label: "Частично", color: "yellow" },
      debt: { label: "Долг", color: "red" },
      cancelled: { label: "Отмена", color: "gray" },
    };
    const s = statusMap[status] || { label: status, color: "gray" };
    return (
      <Badge colorScheme={s.color} fontSize="xs" px={2} py={0.5}>
        {s.label}
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      cash: "Налич.",
      card: "Карта",
      transfer: "Перевод",
      terminal: "Термин.",
      mixed: "Смешан.",
    };
    return methods[method] || method;
  };

  const handleAddPayment = async () => {
    if (!selectedRecord || paymentForm.amount <= 0) {
      toast({
        title: "Ошибка",
        description: "Укажите корректную сумму платежа",
        status: "warning",
      });
      return;
    }

    try {
      setLoading(true);

      const newPaidAmount = selectedRecord.paidAmount + paymentForm.amount;
      const newDebtAmount = Math.max(
        0,
        selectedRecord.finalAmount - newPaidAmount
      );

      let newStatus = selectedRecord.status;
      if (newDebtAmount === 0) {
        newStatus = "paid";
      } else if (newPaidAmount > 0) {
        newStatus = "partial";
      }

      const response = await fetch(
        `${api}/cashbox/update/${selectedRecord.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paidAmount: newPaidAmount,
            debtAmount: newDebtAmount,
            status: newStatus,
            paymentMethod:
              selectedRecord.paymentMethod === paymentForm.method
                ? selectedRecord.paymentMethod
                : "mixed",
          }),
        }
      );

      if (!response.ok) throw new Error("Ошибка обновления платежа");

      toast({
        title: "Успешно",
        description: "Платеж добавлен",
        status: "success",
      });

      onPaymentClose();
      await loadCashRecords();
    } catch (error) {
      console.error("Ошибка добавления платежа:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить платеж",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = (record) => {
    const client = clients[record.clientId];
    // Используем createdAt для чека, если есть, иначе transactionDate
    const dateField = record.createdAt || record.transactionDate;
    const { date, time } = formatDateTimeForReceipt(dateField);

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Чек №${record.id}</title>
        <style>
          @page { size: 58mm auto; margin: 0; }
          body {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            width: 58mm;
            margin: 0;
            padding: 5mm;
          }
          .header {
            text-align: center;
            margin-bottom: 8px;
            font-weight: bold;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          .total {
            font-weight: bold;
            font-size: 13px;
            margin-top: 5px;
          }
          .footer {
            margin-top: 10px;
            text-align: center;
            font-size: 9px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="font-size: 14px;">VIRUSOLOGYA</div>
          <div style="font-size: 10px;">ЧЕК №${record.id}</div>
        </div>
        
        <div class="row">
          <span>Дата:</span>
          <span>${date}</span>
        </div>
        <div class="row">
          <span>Время:</span>
          <span>${time}</span>
        </div>
        
        <div class="divider"></div>
        
        <div><strong>Пациент:</strong></div>
        <div>${getClientName(record.clientId)}</div>
        <div>Тел: ${getClientPhone(record.clientId)}</div>
        
        <div class="divider"></div>
        
        <div><strong>Услуги:</strong></div>
        <div style="white-space: pre-wrap; font-size: 9px;">${
          record.servicesDescription || "Лабораторные услуги"
        }</div>
        
        <div class="divider"></div>
        
        <div class="row">
          <span>Сумма:</span>
          <span>${record.totalAmount?.toLocaleString()} UZS</span>
        </div>
        
        ${
          record.discount > 0
            ? `
        <div class="row">
          <span>Скидка:</span>
          <span>-${record.discount?.toLocaleString()} UZS</span>
        </div>
        `
            : ""
        }
        
        <div class="row total">
          <span>ИТОГО:</span>
          <span>${record.finalAmount?.toLocaleString()} UZS</span>
        </div>
        
        <div class="row">
          <span>Оплачено:</span>
          <span>${record.paidAmount?.toLocaleString()} UZS</span>
        </div>
        
        ${
          record.debtAmount > 0
            ? `
        <div class="row" style="color: #d00;">
          <span>Долг:</span>
          <span>${record.debtAmount?.toLocaleString()} UZS</span>
        </div>
        `
            : ""
        }
        
        <div class="row">
          <span>Оплата:</span>
          <span>${getPaymentMethodLabel(record.paymentMethod)}</span>
        </div>
        
        <div class="divider"></div>
        
        <div class="footer">
          <p>СПАСИБО ЗА ВИЗИТ!</p>
          <p>г. Фергана, Пахлавон Махмуд 23</p>
          <p>+99895-023-47-03</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=250,height=600");
    printWindow.document.write(receiptHTML);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handlePrintReceipt = () => {
    if (!receiptOperationId.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите ID операции",
        status: "warning",
      });
      return;
    }

    // Ищем по ID кассовой операции
    const record = cashRecords.find(
      (r) => r.id.toString() === receiptOperationId.trim()
    );

    if (!record) {
      toast({
        title: "Ошибка",
        description: "Запись с таким ID операции не найдена",
        status: "error",
      });
      return;
    }

    printReceipt(record);
    setReceiptOperationId("");
  };

  const stats = useMemo(() => {
    return {
      totalRevenue: filteredRecords.reduce(
        (sum, r) => sum + (r.paidAmount || 0),
        0
      ),
      totalDebt: filteredRecords.reduce(
        (sum, r) => sum + (r.debtAmount || 0),
        0
      ),
      totalDiscount: filteredRecords.reduce(
        (sum, r) => sum + (r.discount || 0),
        0
      ),
      totalTransactions: filteredRecords.length,
    };
  }, [filteredRecords]);

  return (
    <Box p={{ base: 2, md: 4 }} borderRadius="16px" w="100%" bg="#fff">
      {/* Заголовок и кнопка печати */}
      <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={2}>
        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
          Касса
        </Text>

        <HStack spacing={2}>
          <InputGroup size="sm" w={{ base: "120px", md: "150px" }}>
            <Input
              placeholder="ID операции"
              value={receiptOperationId}
              onChange={(e) => setReceiptOperationId(e.target.value)}
              fontSize="xs"
            />
          </InputGroup>
          <Button
            size="sm"
            leftIcon={<PrinterIcon />}
            onClick={handlePrintReceipt}
            colorScheme="blue"
          >
            Чек
          </Button>
        </HStack>
      </Flex>

      {/* Статистика */}
      <Grid
        templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
        gap={3}
        mb={4}
      >
        <GridItem>
          <Box p={3} bg="gray.50" borderRadius="md" h="100%">
            <Text fontSize="xs" color="gray.600" mb={1}>
              Операции
            </Text>
            <Text fontSize="lg" fontWeight="bold">
              {stats.totalTransactions}
            </Text>
          </Box>
        </GridItem>
        <GridItem>
          <Box p={3} bg="green.50" borderRadius="md" h="100%">
            <Text fontSize="xs" color="gray.600" mb={1}>
              Выручка
            </Text>
            <Text fontSize="lg" fontWeight="bold" color="green.600">
              {stats.totalRevenue.toLocaleString()}
            </Text>
          </Box>
        </GridItem>
        <GridItem>
          <Box p={3} bg="red.50" borderRadius="md" h="100%">
            <Text fontSize="xs" color="gray.600" mb={1}>
              Долг
            </Text>
            <Text fontSize="lg" fontWeight="bold" color="red.600">
              {stats.totalDebt.toLocaleString()}
            </Text>
          </Box>
        </GridItem>
        <GridItem>
          <Box p={3} bg="yellow.50" borderRadius="md" h="100%">
            <Text fontSize="xs" color="gray.600" mb={1}>
              Скидки
            </Text>
            <Text fontSize="lg" fontWeight="bold" color="yellow.600">
              {stats.totalDiscount.toLocaleString()}
            </Text>
          </Box>
        </GridItem>
      </Grid>

      <Divider mb={4} />

      {/* Фильтры */}
      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        }}
        gap={3}
        mb={4}
      >
        <GridItem colSpan={{ base: 1, sm: 2, md: 1 }}>
          <InputGroup size="sm">
            <Input
              placeholder="Поиск..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fontSize="xs"
            />
            <InputRightElement>
              <SearchIcon color="gray.400" boxSize={3} />
            </InputRightElement>
          </InputGroup>
        </GridItem>

        <GridItem>
          <Select
            size="sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            fontSize="xs"
          >
            <option value="all">Все статусы</option>
            <option value="paid">Оплачено</option>
            <option value="partial">Частично</option>
            <option value="debt">Долг</option>
          </Select>
        </GridItem>

        <GridItem>
          <Select
            size="sm"
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            fontSize="xs"
          >
            <option value="all">Оплата</option>
            <option value="cash">Налич.</option>
            <option value="card">Карта</option>
            <option value="transfer">Перевод</option>
            <option value="terminal">Термин.</option>
          </Select>
        </GridItem>

        <GridItem>
          <Select
            size="sm"
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            fontSize="xs"
          >
            <option value="all">Весь период</option>
            <option value="today">Сегодня</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
          </Select>
        </GridItem>
      </Grid>

      {/* Таблица */}
      <Box overflowX="auto">
        <TableContainer
          minW="800px"
          maxH="calc(100vh - 400px)" // Ограничиваем высоту
          overflowY="auto" // Добавляем вертикальный скролл
          borderWidth="1px"
          borderRadius="md"
          borderColor="gray.200"
        >
          <Table size="sm" variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th px={2} py={2} fontSize="xs" fontWeight="bold" width="60px">
                  №
                </Th>
                <Th px={2} py={2} fontSize="xs" fontWeight="bold" width="70px">
                  Дата
                </Th>
                <Th px={2} py={2} fontSize="xs" fontWeight="bold" width="120px">
                  Пациент
                </Th>
                <Th px={2} py={2} fontSize="xs" fontWeight="bold" width="100px">
                  Услуги
                </Th>
                <Th px={2} py={2} fontSize="xs" fontWeight="bold" width="80px">
                  Сумма
                </Th>
                <Th px={2} py={2} fontSize="xs" fontWeight="bold" width="70px">
                  Итого
                </Th>
                <Th px={2} py={2} fontSize="xs" fontWeight="bold" width="80px">
                  Оплата
                </Th>
                <Th px={2} py={2} fontSize="xs" fontWeight="bold" width="80px">
                  Статус
                </Th>
                <Th px={2} py={2} fontSize="xs" fontWeight="bold" width="100px">
                  Действия
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredRecords.map((record) => (
                <Tr key={record.id} _hover={{ bg: "gray.50" }}>
                  <Td px={2} py={2} fontSize="xs" fontWeight="medium">
                    {record.id}
                  </Td>
                  <Td px={2} py={2} fontSize="xs">
                    {/* Используем createdAt, если есть, иначе transactionDate */}
                    {formatDateForTable(
                      record.createdAt || record.transactionDate
                    )}
                  </Td>
                  <Td px={2} py={2}>
                    <Box>
                      <Text fontSize="xs" fontWeight="medium">
                        {getClientName(record.clientId)}
                      </Text>
                      <Text fontSize="2xs" color="gray.600">
                        {getClientPhone(record.clientId)}
                      </Text>
                    </Box>
                  </Td>
                  <Td px={2} py={2} fontSize="2xs" maxW="120px" isTruncated>
                    {record.servicesDescription || "—"}
                  </Td>
                  <Td px={2} py={2} fontSize="xs" textAlign="right">
                    <Box>
                      <Text>{record.totalAmount?.toLocaleString()}</Text>
                      {record.discount > 0 && (
                        <Text fontSize="2xs" color="red.500">
                          -{record.discount?.toLocaleString()}
                        </Text>
                      )}
                    </Box>
                  </Td>
                  <Td
                    px={2}
                    py={2}
                    fontSize="xs"
                    fontWeight="bold"
                    textAlign="right"
                  >
                    {record.finalAmount?.toLocaleString()}
                  </Td>
                  <Td px={2} py={2} fontSize="xs">
                    <Box>
                      <Text>{getPaymentMethodLabel(record.paymentMethod)}</Text>
                      <HStack spacing={1} mt={0.5}>
                        <Text fontSize="2xs" color="green.600">
                          {record.paidAmount?.toLocaleString()}
                        </Text>
                        {record.debtAmount > 0 && (
                          <Text fontSize="2xs" color="red.600">
                            +{record.debtAmount?.toLocaleString()}
                          </Text>
                        )}
                      </HStack>
                    </Box>
                  </Td>
                  <Td px={2} py={2}>
                    {getStatusBadge(record.status)}
                  </Td>
                  <Td px={2} py={2}>
                    <HStack spacing={1}>
                      <IconButton
                        aria-label="Печать чека"
                        icon={<PrinterIcon />}
                        size="xs"
                        colorScheme="blue"
                        onClick={() => printReceipt(record)}
                      />
                      {record.debtAmount > 0 && (
                        <Button
                          size="xs"
                          colorScheme="green"
                          onClick={() => {
                            setSelectedRecord(record);
                            setPaymentForm({
                              amount: record.debtAmount,
                              method: "cash",
                            });
                            onPaymentOpen();
                          }}
                        >
                          Внести
                        </Button>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      {filteredRecords.length === 0 && (
        <Box textAlign="center" py={8}>
          <Text color="gray.500" fontSize="sm">
            Записи не найдены
          </Text>
        </Box>
      )}

      {/* Модальное окно добавления платежа */}
      <Modal isOpen={isPaymentOpen} onClose={onPaymentClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="md">Добавить платеж</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRecord && (
              <VStack align="stretch" spacing={3}>
                <Box p={3} bg="gray.50" borderRadius="md" fontSize="sm">
                  <Text mb={1}>
                    <strong>Пациент:</strong>{" "}
                    {getClientName(selectedRecord.clientId)}
                  </Text>
                  <Text mb={1}>
                    <strong>Итого:</strong>{" "}
                    {selectedRecord.finalAmount?.toLocaleString()} сум
                  </Text>
                  <Text>
                    <strong>Долг:</strong>{" "}
                    {selectedRecord.debtAmount?.toLocaleString()} сум
                  </Text>
                </Box>

                <FormControl>
                  <FormLabel fontSize="sm">Сумма платежа</FormLabel>
                  <NumberInput
                    size="sm"
                    value={paymentForm.amount}
                    onChange={(value) =>
                      setPaymentForm({
                        ...paymentForm,
                        amount: parseFloat(value) || 0,
                      })
                    }
                    min={0}
                    max={selectedRecord.debtAmount}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Способ оплаты</FormLabel>
                  <Select
                    size="sm"
                    value={paymentForm.method}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, method: e.target.value })
                    }
                  >
                    <option value="cash">Наличные</option>
                    <option value="card">Карта</option>
                    <option value="transfer">Перевод</option>
                    <option value="terminal">Терминал</option>
                  </Select>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button size="sm" variant="ghost" mr={3} onClick={onPaymentClose}>
              Отмена
            </Button>
            <Button
              size="sm"
              colorScheme="green"
              onClick={handleAddPayment}
              isLoading={loading}
            >
              Добавить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Cashbox;
