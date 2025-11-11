"use client";
import React, { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { SearchIcon, DownloadIcon } from "@chakra-ui/icons";
import { getApiBaseUrl } from "../../utils/api";

function Cashbox() {
  const [cashRecords, setCashRecords] = useState([]);
  const [clients, setClients] = useState({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const toast = useToast();
  const api = getApiBaseUrl();

  const {
    isOpen: isReceiptOpen,
    onOpen: onReceiptOpen,
    onClose: onReceiptClose,
  } = useDisclosure();
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

  const loadCashRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/cashbox`);
      if (!response.ok) throw new Error("Ошибка загрузки кассы");

      const data = await response.json();
      const records = Array.isArray(data) ? data : [];
      setCashRecords(records);

      // Загружаем данные клиентов
      const clientIds = [...new Set(records.map((r) => r.clientId))];
      const clientsData = {};

      await Promise.all(
        clientIds.map(async (clientId) => {
          try {
            const response = await fetch(
              `http://localhost:4000/client/${clientId}`
            );
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
    if (!client) return "Неизвестный пациент";
    return `${client.surname || ""} ${client.name || ""} ${
      client.lastName || ""
    }`.trim();
  };

  const getClientPhone = (clientId) => {
    return clients[clientId]?.phoneNumber || "—";
  };

  const filteredRecords = cashRecords.filter((record) => {
    const clientName = getClientName(record.clientId).toLowerCase();
    const clientPhone = getClientPhone(record.clientId).toLowerCase();

    const searchMatch = [
      record.id,
      clientName,
      clientPhone,
      record.servicesDescription,
    ].some((field) =>
      field?.toString().toLowerCase().includes(search.toLowerCase())
    );

    const statusMatch =
      filterStatus === "all" || record.status === filterStatus;

    const paymentMatch =
      filterPayment === "all" || record.paymentMethod === filterPayment;

    // Фильтр по периоду
    let periodMatch = true;
    if (filterPeriod !== "all") {
      const recordDate = new Date(record.transactionDate);
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

  const getPaymentMethodLabel = (method) => {
    const methods = {
      cash: "💵 Наличные",
      card: "💳 Карта",
      transfer: "🏦 Перевод",
      terminal: "📱 Терминал",
      mixed: "🔀 Смешанный",
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
        `http://localhost:4000/cashbox/update/${selectedRecord.id}`,
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
          <span>${new Date(record.transactionDate).toLocaleDateString(
            "ru-RU"
          )}</span>
        </div>
        <div class="row">
          <span>Время:</span>
          <span>${new Date(record.transactionDate).toLocaleTimeString(
            "ru-RU"
          )}</span>
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
    }, 250);
  };

  // Статистика
  const stats = {
    totalRevenue: filteredRecords.reduce(
      (sum, r) => sum + (r.paidAmount || 0),
      0
    ),
    totalDebt: filteredRecords.reduce((sum, r) => sum + (r.debtAmount || 0), 0),
    totalDiscount: filteredRecords.reduce(
      (sum, r) => sum + (r.discount || 0),
      0
    ),
    totalAmount: filteredRecords.reduce(
      (sum, r) => sum + (r.totalAmount || 0),
      0
    ),
  };

  return (
    <Box p={4} borderRadius="16px" w="100%" bg="#fff">
      {/* Статистика */}
      <Box mb={6}>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>
          Касса
        </Text>

        <SimpleGrid columns={4} spacing={4} mb={4}>
          <Box p={4} bg="blue.50" borderRadius="md">
            <Text fontSize="sm" color="gray.600">
              Всего операций
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              {filteredRecords.length}
            </Text>
          </Box>

          <Box p={4} bg="green.50" borderRadius="md">
            <Text fontSize="sm" color="gray.600">
              Выручка
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="green.600">
              {stats.totalRevenue.toLocaleString()} сум
            </Text>
          </Box>

          <Box p={4} bg="red.50" borderRadius="md">
            <Text fontSize="sm" color="gray.600">
              Долг
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="red.600">
              {stats.totalDebt.toLocaleString()} сум
            </Text>
          </Box>

          <Box p={4} bg="yellow.50" borderRadius="md">
            <Text fontSize="sm" color="gray.600">
              Скидки
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="yellow.600">
              {stats.totalDiscount.toLocaleString()} сум
            </Text>
          </Box>
        </SimpleGrid>
      </Box>

      <Divider mb={6} />

      {/* Фильтры */}
      <HStack spacing={4} mb={4} wrap="wrap">
        <InputGroup w={{ base: "100%", md: "300px" }}>
          <Input
            placeholder="Поиск по пациенту, телефону..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputRightElement>
            <SearchIcon color="gray.400" />
          </InputRightElement>
        </InputGroup>

        <Select
          w={{ base: "100%", md: "150px" }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Все статусы</option>
          <option value="paid">Оплачено</option>
          <option value="partial">Частично</option>
          <option value="debt">Долг</option>
        </Select>

        <Select
          w={{ base: "100%", md: "150px" }}
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
        >
          <option value="all">Все оплаты</option>
          <option value="cash">Наличные</option>
          <option value="card">Карта</option>
          <option value="transfer">Перевод</option>
          <option value="terminal">Терминал</option>
          <option value="mixed">Смешанный</option>
        </Select>

        <Select
          w={{ base: "100%", md: "150px" }}
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
        >
          <option value="all">За все время</option>
          <option value="today">Сегодня</option>
          <option value="week">За неделю</option>
          <option value="month">За месяц</option>
        </Select>
      </HStack>

      {/* Таблица */}
      <TableContainer>
        <Table variant="striped" size="sm">
          <Thead bg="gray.100">
            <Tr>
              <Th>№</Th>
              <Th>Дата</Th>
              <Th>Пациент</Th>
              <Th>Телефон</Th>
              <Th>Услуги</Th>
              <Th>Сумма</Th>
              <Th>Скидка</Th>
              <Th>Итого</Th>
              <Th>Оплачено</Th>
              <Th>Долг</Th>
              <Th>Оплата</Th>
              <Th>Статус</Th>
              <Th>Действия</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredRecords.map((record) => (
              <Tr key={record.id} _hover={{ bg: "gray.50" }}>
                <Td fontWeight="medium">{record.id}</Td>
                <Td fontSize="xs">
                  {new Date(record.transactionDate).toLocaleDateString("ru-RU")}
                </Td>
                <Td>{getClientName(record.clientId)}</Td>
                <Td>{getClientPhone(record.clientId)}</Td>
                <Td fontSize="xs" maxW="200px" isTruncated>
                  {record.servicesDescription}
                </Td>
                <Td>{record.totalAmount?.toLocaleString()} сум</Td>
                <Td color="red.500">
                  {record.discount > 0
                    ? `-${record.discount.toLocaleString()}`
                    : "—"}
                </Td>
                <Td fontWeight="bold">
                  {record.finalAmount?.toLocaleString()} сум
                </Td>
                <Td fontWeight="bold" color="green.600">
                  {record.paidAmount?.toLocaleString()} сум
                </Td>
                <Td
                  fontWeight="bold"
                  color={record.debtAmount > 0 ? "red.600" : "gray.500"}
                >
                  {record.debtAmount?.toLocaleString()} сум
                </Td>
                <Td fontSize="xs">
                  {getPaymentMethodLabel(record.paymentMethod)}
                </Td>
                <Td>{getStatusBadge(record.status)}</Td>
                <Td>
                  <HStack spacing={2}>
                    <Button
                      size="xs"
                      leftIcon={<DownloadIcon />}
                      onClick={() => printReceipt(record)}
                    >
                      Чек
                    </Button>
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
                        Оплатить
                      </Button>
                    )}
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {filteredRecords.length === 0 && (
        <Box textAlign="center" py={8}>
          <Text color="gray.500">Записи не найдены</Text>
        </Box>
      )}

      {/* Модальное окно добавления платежа */}
      <Modal isOpen={isPaymentOpen} onClose={onPaymentClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Добавить платеж</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRecord && (
              <VStack align="stretch" spacing={4}>
                <Box p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" mb={1}>
                    <strong>Пациент:</strong>{" "}
                    {getClientName(selectedRecord.clientId)}
                  </Text>
                  <Text fontSize="sm" mb={1}>
                    <strong>Остаток долга:</strong>{" "}
                    {selectedRecord.debtAmount?.toLocaleString()} сум
                  </Text>
                </Box>

                <FormControl>
                  <FormLabel>Сумма платежа</FormLabel>
                  <Input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Способ оплаты</FormLabel>
                  <Select
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
            <Button variant="ghost" mr={3} onClick={onPaymentClose}>
              Отмена
            </Button>
            <Button
              colorScheme="green"
              onClick={handleAddPayment}
              isLoading={loading}
            >
              Добавить платеж
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Cashbox;
