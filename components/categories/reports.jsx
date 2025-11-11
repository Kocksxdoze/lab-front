"use client";
import React, { useState, useEffect } from "react";
import fetcher from "../../utils/fetcher";
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
  Select,
  useToast,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import axios from "axios";
import { getApiBaseUrl } from "../../utils/api";
function Reports() {
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]); // Состояние для категорий
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
  });
  const api = getApiBaseUrl();

  // Загрузка подкатегорий
  async function loadreports() {
    const data = await fetcher("reports");
    setReports(Array.isArray(data) ? data : []);
  }

  // Загрузка категорий
  async function loadCategories() {
    const data = await fetcher("doctors");
    setCategories(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadreports();
    loadCategories();
  }, []);

  const filteredreports = reports.filter((report) =>
    [report?.id, report?.name, report?.createdAt].some((field) =>
      field?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleCreatereport = async () => {
    if (!formData.name || formData.name.trim() === "") {
      toast({
        title: "Имя отчета обязательно.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      if (isEditing) {
        //
        await axios.put(`${api}/report/edit/${editingId}`, formData);
        toast({
          title: "Отчет обновлен.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      } else {
        // Создание
        await axios.post(`${api}/report/create`, formData);
        toast({
          title: "Отчет создан.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      }
      loadreports();
      onClose();
      setFormData({
        name: "",
        reportCategory: "",
        desc: "",
        doctorId: "",
        createdAt: "",
      });
    } catch (error) {
      toast({
        title: "Ошибка при сохранении отчета.",
        description: error.response?.data?.message || "Попробуйте снова позже.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      console.error("Ошибка при сохранении отчета:", error);
    }
  };

  const handleDeletereport = async (id) => {
    try {
      await axios.delete(`${api}/report/delete/${id}`);
      toast({
        title: "Подкатегория удалена.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });
      loadreports();
    } catch (error) {
      toast({
        title: "Ошибка при удалении.",
        description: error.response?.data?.message || "Попробуйте снова позже.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      console.error("Ошибка при удалении подкатегории:", error);
    }
  };

  const handleEditreport = (report) => {
    setIsEditing(true);
    setEditingId(report.id);
    setFormData({
      name: report.name,
      reportCategory: report.reportCategory,
      desc: report.desc || "",
      doctorId: report.doctorId || "",
      createdAt: report.createdAt || "",
    });
    onOpen();
  };
  const handleClose = () => {
    onClose();
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: "",
      reportCategory: "",
      desc: "",
      doctorId: "",
      createdAt: "",
    });
  };

  return (
    <Box p={4} borderRadius="16px" w="100%" overflowX="auto" bg="#fff">
      <Flex justify="space-between" mb={4} gap={4}>
        <InputGroup w={{ base: "100%", md: "50%" }}>
          <Input
            placeholder="Поиск по любому параметру"
            color="black"
            _placeholder={{ color: "black" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            border="1px solid #000"
            pr="2.5rem"
          />
          <InputRightElement>
            <SearchIcon color="black.500" />
          </InputRightElement>
        </InputGroup>
        <Button w={"auto"} colorScheme="blue" onClick={onOpen}>
          Создать
        </Button>
      </Flex>

      <TableContainer overflowX="auto" width="100%">
        <Table variant="striped" size="sm" width="100%">
          <Thead position="sticky" top={0} zIndex={1} bg="white">
            <Tr>
              <Th>id</Th>
              <Th>Категория отчета</Th>
              <Th>Количество отчетов у категории</Th>
              <Th>Создан</Th>
              <Th>Обновлен</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredreports.map((report) => (
              <Tr key={report.id}>
                <Td>{report.id}</Td>
                <Td>{report.name}</Td>
                <Td>{report.reportsTo?.length || 0}</Td>
                <Td>
                  {new Date(report.createdAt).toISOString().split("T")[0]}
                </Td>
                <Td>
                  {new Date(report.updatedAt).toISOString().split("T")[0]}
                </Td>
                <Td>
                  <Flex gap={2}>
                    <Button
                      size="xs"
                      colorScheme="yellow"
                      onClick={() => handleEditreport(report)}
                    >
                      Редактировать
                    </Button>
                    <Button
                      size="xs"
                      colorScheme="red"
                      onClick={() => handleDeletereport(report.id)}
                    >
                      Удалить
                    </Button>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Модальное окно */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Создание отчета</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={3}>
              <FormLabel>Категория отчета</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ formData, name: e.target.value })
                }
                placeholder="Введите имя категории"
              />
            </FormControl>

            <Button colorScheme="blue" mr={3} onClick={handleCreatereport}>
              {isEditing ? "Сохранить" : "Создать"}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Reports;
