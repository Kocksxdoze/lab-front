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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PatientPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patientData, setPatientData] = useState(null);
  const [labResults, setLabResults] = useState([]);
  const [cashRecords, setCashRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sampleType, setSampleType] = useState("Кровь (сыворотка)");
  const toast = useToast();

  const {
    isOpen: isPrintModalOpen,
    onOpen: onPrintModalOpen,
    onClose: onPrintModalClose,
  } = useDisclosure();

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);

      const clientResponse = await fetch(`http://localhost:4000/client/${id}`);
      if (!clientResponse.ok) throw new Error("Ошибка загрузки пациента");
      const client = await clientResponse.json();
      setPatientData(client);

      const labResponse = await fetch(`http://localhost:4000/lab/client/${id}`);
      if (labResponse.ok) {
        const labs = await labResponse.json();
        setLabResults(labs);
      }

      const cashResponse = await fetch(
        `http://localhost:4000/cashbox/client/${id}`
      );
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

  const handlePrint = () => {
    const readyResults = labResults.filter((lab) => lab.ready);

    if (readyResults.length === 0) {
      toast({
        title: "Нет готовых результатов",
        description: "Нет готовых результатов для печати",
        status: "warning",
      });
      return;
    }

    const printContent = generatePrintContent(readyResults);
    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const generatePrintContent = (results) => {
    const fio = `${patientData.surname || ""} ${patientData.name || ""} ${
      patientData.lastName || ""
    }`.trim();
    const birthDate = formatDate(patientData.dateBirth);
    const age = calculateAge(patientData.dateBirth);
    const today = new Date().toLocaleDateString("ru-RU");

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
      font-size: 11px;
      line-height: 1.4;
      color: #000;
      background: #fff;
    }
    
    .page {
      width: 210mm;
      min-height: 297mm;
      background: white;
      position: relative;
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
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 2px solid #2B7EC1;
    }
    
    .header-left {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      flex: 1;
    }
    
    .logo img {
      width: 70px;
      height: 70px;
    }
    
    .header-text {
      flex: 1;
    }
    
    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #2B7EC1;
      margin-bottom: 5px;
      letter-spacing: 1px;
    }
    
    .subtitle {
      font-size: 10px;
      color: #2B7EC1;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    
    .association {
      font-size: 8px;
      color: #666;
      line-height: 1.4;
      max-width: 400px;
    }
    
    .certificate {
      display: inline-block;
      border: 1px solid #000;
      padding: 3px 10px;
      font-size: 9px;
      margin-top: 8px;
    }
    
    .header-right {
      text-align: right;
      font-size: 9px;
      line-height: 1.6;
      color: #333;
    }
    
    .patient-info {
      margin: 20px 0;
      font-size: 10px;
    }
    
    .info-row {
      display: flex;
      margin-bottom: 8px;
      border-bottom: 1px solid #E8E8E8;
      padding-bottom: 5px;
    }
    
    .info-label {
      width: 150px;
      color: #666;
      font-weight: 500;
    }
    
    .info-value {
      flex: 1;
      color: #000;
    }
    
    .results-section {
      margin: 30px 0;
    }
    
    .results-title {
      text-align: center;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 20px;
      color: #2B7EC1;
    }
    
    .results-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    .results-table th {
      background: #F0F0F0;
      border: 1px solid #000;
      padding: 8px;
      text-align: center;
      font-weight: bold;
      font-size: 10px;
    }
    
    .results-table td {
      border: 1px solid #000;
      padding: 8px;
      vertical-align: middle;
    }
    
    .test-name {
      font-weight: bold;
      font-size: 11px;
    }
    
    .result-value {
      text-align: center;
      font-weight: bold;
      font-size: 12px;
    }
    
    .unit {
      text-align: center;
      font-size: 10px;
    }
    
    .reference {
      font-size: 9px;
      color: #666;
    }
    
    .footer-section {
      margin-top: 40px;
    }
    
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
    }
    
    .signature-block {
      width: 45%;
      text-align: center;
    }
    
    .signature-line {
      margin-top: 50px;
      padding-top: 5px;
      border-top: 1px solid #000;
      font-size: 10px;
    }
    
    .barcode {
      text-align: right;
      margin-top: 20px;
    }
    
    .disclaimer {
      margin-top: 30px;
      text-align: center;
      font-size: 9px;
      color: #FF9800;
      font-style: italic;
    }
    
    .document-footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #DDD;
      text-align: center;
      font-size: 8px;
      color: #999;
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
          <div class="info-value">${birthDate}</div>
        </div>
        <div class="info-row">
          <div class="info-label">номер пациента:</div>
          <div class="info-value">${id}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Дата выдачи:</div>
          <div class="info-value">${today}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Тип биоматериала:</div>
          <div class="info-value">${sampleType}</div>
        </div>
      </div>
      
      <div class="results-section">
        <div class="results-title">РЕЗУЛЬТАТЫ ЛАБОРАТОРНЫХ ИССЛЕДОВАНИЙ</div>
        
        <table class="results-table">
          <thead>
            <tr>
              <th style="width: 35%;">Показатель</th>
              <th style="width: 20%;">Результат</th>
              <th style="width: 15%;">Ед. изм.</th>
              <th style="width: 30%;">Референтные значения</th>
            </tr>
          </thead>
          <tbody>
            ${results
              .map(
                (lab) => `
              <tr>
                <td class="test-name">${lab.name}</td>
                <td class="result-value">${lab.result || "—"}</td>
                <td class="unit">${lab.unit || "—"}</td>
                <td class="reference">${
                  lab.referenceText ||
                  (lab.referenceMin && lab.referenceMax
                    ? `${lab.referenceMin} - ${lab.referenceMax}`
                    : "—")
                }</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
      
      <div class="footer-section">
        <div class="signatures">
          <div class="signature-block">
            <div class="signature-line">Врач-лаборант</div>
          </div>
          <div class="signature-block">
            <div class="signature-line">Дата выдачи: ${today}</div>
          </div>
        </div>
      </div>
      
      <div class="barcode">
        <svg viewBox="0 0 180 50" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="2" height="30" fill="#000"/>
          <rect x="10" y="5" width="1" height="30" fill="#000"/>
          <rect x="13" y="5" width="3" height="30" fill="#000"/>
          <rect x="18" y="5" width="1" height="30" fill="#000"/>
          <rect x="21" y="5" width="2" height="30" fill="#000"/>
          <rect x="25" y="5" width="1" height="30" fill="#000"/>
          <rect x="28" y="5" width="3" height="30" fill="#000"/>
          <rect x="33" y="5" width="1" height="30" fill="#000"/>
          <rect x="36" y="5" width="2" height="30" fill="#000"/>
          <rect x="40" y="5" width="1" height="30" fill="#000"/>
          <rect x="43" y="5" width="3" height="30" fill="#000"/>
          <rect x="48" y="5" width="2" height="30" fill="#000"/>
          <rect x="52" y="5" width="1" height="30" fill="#000"/>
          <rect x="55" y="5" width="2" height="30" fill="#000"/>
          <rect x="59" y="5" width="3" height="30" fill="#000"/>
          <rect x="64" y="5" width="1" height="30" fill="#000"/>
          <rect x="67" y="5" width="2" height="30" fill="#000"/>
          <rect x="71" y="5" width="1" height="30" fill="#000"/>
          <rect x="74" y="5" width="3" height="30" fill="#000"/>
          <rect x="79" y="5" width="1" height="30" fill="#000"/>
          <rect x="82" y="5" width="2" height="30" fill="#000"/>
          <rect x="86" y="5" width="1" height="30" fill="#000"/>
          <rect x="89" y="5" width="3" height="30" fill="#000"/>
          <rect x="94" y="5" width="2" height="30" fill="#000"/>
          <rect x="98" y="5" width="1" height="30" fill="#000"/>
          <rect x="101" y="5" width="2" height="30" fill="#000"/>
          <rect x="105" y="5" width="3" height="30" fill="#000"/>
          <rect x="110" y="5" width="1" height="30" fill="#000"/>
          <rect x="113" y="5" width="2" height="30" fill="#000"/>
          <rect x="117" y="5" width="1" height="30" fill="#000"/>
          <rect x="120" y="5" width="3" height="30" fill="#000"/>
          <rect x="125" y="5" width="1" height="30" fill="#000"/>
          <rect x="128" y="5" width="2" height="30" fill="#000"/>
          <rect x="132" y="5" width="1" height="30" fill="#000"/>
          <rect x="135" y="5" width="3" height="30" fill="#000"/>
          <rect x="140" y="5" width="2" height="30" fill="#000"/>
          <rect x="144" y="5" width="1" height="30" fill="#000"/>
          <rect x="147" y="5" width="2" height="30" fill="#000"/>
          <rect x="151" y="5" width="1" height="30" fill="#000"/>
          <rect x="154" y="5" width="3" height="30" fill="#000"/>
          <rect x="159" y="5" width="1" height="30" fill="#000"/>
          <rect x="162" y="5" width="2" height="30" fill="#000"/>
          <rect x="166" y="5" width="1" height="30" fill="#000"/>
          <rect x="169" y="5" width="3" height="30" fill="#000"/>
          <text x="90" y="45" font-size="7" text-anchor="middle" fill="#000">*188384**${id}**${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}*</text>
        </svg>
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
        <Heading size="lg">Карточка пациента #{id}</Heading>
        <HStack spacing={3}>
          <Button colorScheme="blue" onClick={() => router.push("/patients")}>
            Назад к списку
          </Button>
          <Button colorScheme="green" onClick={onPrintModalOpen}>
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
          </VStack>
        </Box>
      </SimpleGrid>

      {/* Лабораторные результаты */}
      <Box mb={8}>
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Лабораторные исследования
        </Text>
        {labResults.length > 0 ? (
          <TableContainer>
            <Table variant="striped" size="sm">
              <Thead bg="gray.100">
                <Tr>
                  <Th>Код</Th>
                  <Th>Название</Th>
                  <Th>Результат</Th>
                  <Th>Ед. изм.</Th>
                  <Th>Норма</Th>
                  <Th>Статус</Th>
                  <Th>Дата готовности</Th>
                </Tr>
              </Thead>
              <Tbody>
                {labResults.map((lab) => (
                  <Tr key={lab.id} bg={lab.isAbnormal ? "red.50" : undefined}>
                    <Td fontWeight="bold">{lab.testCode || "—"}</Td>
                    <Td>{lab.name}</Td>
                    <Td
                      fontWeight="bold"
                      color={lab.isAbnormal ? "red.600" : "green.600"}
                    >
                      {lab.result || "—"}
                    </Td>
                    <Td>{lab.unit || "—"}</Td>
                    <Td fontSize="xs">
                      {lab.referenceText ||
                        (lab.referenceMin && lab.referenceMax
                          ? `${lab.referenceMin} - ${lab.referenceMax}`
                          : "—")}
                    </Td>
                    <Td>
                      {lab.ready ? (
                        <Badge colorScheme="green">Готово</Badge>
                      ) : (
                        <Badge colorScheme="yellow">В работе</Badge>
                      )}
                    </Td>
                    <Td>{lab.readyDate ? formatDate(lab.readyDate) : "—"}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        ) : (
          <Text color="gray.500" fontStyle="italic">
            Нет лабораторных исследований
          </Text>
        )}
      </Box>

      {/* История платежей */}
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
                      color={record.debtAmount > 0 ? "red.600" : "green.600"}
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

      {/* Модальное окно печати */}
      <Modal isOpen={isPrintModalOpen} onClose={onPrintModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Печать результатов анализов</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text>
                Готово к печати:{" "}
                <strong>{labResults.filter((l) => l.ready).length}</strong> из{" "}
                <strong>{labResults.length}</strong> анализов
              </Text>

              <FormControl>
                <FormLabel>Тип биоматериала</FormLabel>
                <Select
                  value={sampleType}
                  onChange={(e) => setSampleType(e.target.value)}
                >
                  <option value="Кровь (сыворотка)">Кровь (сыворотка)</option>
                  <option value="Кровь (цельная)">Кровь (цельная)</option>
                  <option value="Кровь (плазма)">Кровь (плазма)</option>
                  <option value="Моча">Моча</option>
                  <option value="Слюна">Слюна</option>
                  <option value="Мазок">Мазок</option>
                  <option value="Кал">Кал</option>
                  <option value="Биопсийный материал">
                    Биопсийный материал
                  </option>
                </Select>
              </FormControl>

              {labResults.filter((l) => !l.ready).length > 0 && (
                <Box p={3} bg="yellow.50" borderRadius="md">
                  <Text fontSize="sm" color="yellow.800">
                    ⚠️ Некоторые результаты еще не готовы и не будут включены в
                    печать
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPrintModalClose}>
              Отмена
            </Button>
            <Button
              colorScheme="green"
              onClick={() => {
                handlePrint();
                onPrintModalClose();
              }}
            >
              Печать
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
