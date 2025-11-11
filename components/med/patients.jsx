"use client";
import React, { useState, useEffect, Suspense } from "react";
import {
  Box,
  Input,
  InputGroup,
  InputRightElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Badge,
  HStack,
  Text,
  Select,
  Button,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiBaseUrl } from "../../utils/api";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDebt, setFilterDebt] = useState("all");
  const [sortBy, setSortBy] = useState("id");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const api = getApiBaseUrl();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      setSearch(decodeURIComponent(searchQuery));
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${api}/clients`);
      if (!response.ok) throw new Error("Ошибка загрузки пациентов");

      const data = await response.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Ошибка загрузки пациентов:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients
    .filter((patient) => {
      // Поиск
      const searchMatch = [
        patient?.id?.toString(),
        patient?.name,
        patient?.surname,
        patient?.lastName,
        `${patient?.surname} ${patient?.name} ${patient?.lastName}`,
        patient?.phoneNumber,
      ].some((field) =>
        field?.toString().toLowerCase().includes(search.toLowerCase())
      );

      // Фильтр по долгу
      let debtMatch = true;
      if (filterDebt === "withDebt") {
        debtMatch = (patient?.debt || 0) > 0;
      } else if (filterDebt === "noDebt") {
        debtMatch = (patient?.debt || 0) === 0;
      }

      return searchMatch && debtMatch;
    })
    .sort((a, b) => {
      // Сортировка
      if (sortBy === "id") return b.id - a.id;
      if (sortBy === "name")
        return (a.surname || "").localeCompare(b.surname || "");
      if (sortBy === "debt") return (b.debt || 0) - (a.debt || 0);
      if (sortBy === "date")
        return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim()) {
      router.push(`/patients?search=${encodeURIComponent(value.trim())}`);
    } else {
      router.push("/patients");
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

  return (
    <Box p={4} borderRadius="16px" w="100%" bg="#fff">
      {/* Заголовок и статистика */}
      <HStack justify="space-between" mb={4}>
        <Text fontSize="2xl" fontWeight="bold">
          Список пациентов
        </Text>
        <HStack spacing={4}>
          <Box textAlign="center" p={2} bg="blue.50" borderRadius="md">
            <Text fontSize="xs" color="gray.600">
              Всего
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="blue.600">
              {patients.length}
            </Text>
          </Box>
          <Box textAlign="center" p={2} bg="red.50" borderRadius="md">
            <Text fontSize="xs" color="gray.600">
              С долгом
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="red.600">
              {patients.filter((p) => (p.debt || 0) > 0).length}
            </Text>
          </Box>
        </HStack>
      </HStack>

      {/* Фильтры и поиск */}
      <HStack spacing={4} mb={4} wrap="wrap">
        <InputGroup w={{ base: "100%", md: "300px" }}>
          <Input
            placeholder="Поиск по ФИО, телефону..."
            value={search}
            onChange={handleSearchChange}
          />
          <InputRightElement>
            <SearchIcon color="gray.400" />
          </InputRightElement>
        </InputGroup>

        <Select
          w={{ base: "100%", md: "150px" }}
          value={filterDebt}
          onChange={(e) => setFilterDebt(e.target.value)}
        >
          <option value="all">Все пациенты</option>
          <option value="withDebt">С долгом</option>
          <option value="noDebt">Без долга</option>
        </Select>

        <Select
          w={{ base: "100%", md: "150px" }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="id">По ID (новые)</option>
          <option value="name">По имени</option>
          <option value="debt">По долгу</option>
          <option value="date">По дате регистрации</option>
        </Select>

        <Button colorScheme="blue" onClick={() => router.push("/register")}>
          + Новый пациент
        </Button>
      </HStack>

      {/* Таблица */}
      {loading ? (
        <Spinner size="xl" />
      ) : (
        <TableContainer>
          <Table variant="striped" size="sm">
            <Thead bg="gray.100">
              <Tr>
                <Th>ID</Th>
                <Th>ФИО</Th>
                <Th>Возраст</Th>
                <Th>Пол</Th>
                <Th>Телефон</Th>
                <Th>Дата регистрации</Th>
                <Th>Долг</Th>
                <Th>Регистратор</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredPatients.map((patient) => (
                <Tr
                  key={patient.id}
                  onClick={() => router.push(`/patient/${patient.id}`)}
                  _hover={{ backgroundColor: "blue.50", cursor: "pointer" }}
                >
                  <Td fontWeight="bold">{patient.id}</Td>
                  <Td>
                    {`${patient.surname || ""} ${patient.name || ""} ${
                      patient.lastName || ""
                    }`.trim()}
                  </Td>
                  <Td>{calculateAge(patient.dateBirth) || "—"}</Td>
                  <Td>
                    <Badge colorScheme={patient.sex === 1 ? "blue" : "pink"}>
                      {patient.sex === 1 ? "М" : "Ж"}
                    </Badge>
                  </Td>
                  <Td>{patient.phoneNumber || "—"}</Td>
                  <Td fontSize="xs">
                    {patient.createdAt
                      ? new Date(patient.createdAt).toLocaleDateString("ru-RU")
                      : "—"}
                  </Td>
                  <Td>
                    {(patient.debt || 0) > 0 ? (
                      <Badge colorScheme="red" fontSize="sm">
                        {patient.debt?.toLocaleString()} сум
                      </Badge>
                    ) : (
                      <Badge colorScheme="green">✓</Badge>
                    )}
                  </Td>
                  <Td fontSize="xs">{patient.registrator || "—"}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {filteredPatients.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <Text color="gray.500">Пациенты не найдены</Text>
        </Box>
      )}
    </Box>
  );
}

export default function PatientsPage() {
  return (
    <Suspense fallback={<Spinner size="xl" />}>
      <Patients />
    </Suspense>
  );
}
