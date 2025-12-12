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

function Partners() {
  const [partners, setPartners] = useState([]);
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    partnerType: "",
    bonus: "",
    clientsPerMonth: "",
    allClients: "",
  });
  const api = getApiBaseUrl();

  async function loadPartners() {
    const data = await fetcher("partners");
    setPartners(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadPartners();
  }, []);

  const filteredPartners = partners.filter((partner) =>
    [
      partner?.id,
      partner?.fullName,
      partner?.partnerType,
      partner?.createdAt,
    ].some((field) =>
      field?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleCreatePartner = async () => {
    try {
      // Преобразование числовых полей
      const formattedData = {
        ...formData,
        bonus: formData.bonus ? parseFloat(formData.bonus) : 0,
        clientsPerMonth: formData.clientsPerMonth
          ? parseInt(formData.clientsPerMonth)
          : 0,
        allClients: formData.allClients ? parseInt(formData.allClients) : 0,
      };

      if (isEditing) {
        await axios.put(`${api}/partner/update/${editingId}`, formattedData);
        toast({
          title: "Партнёр обновлён.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      } else {
        await axios.post(`${api}/partner/new`, formattedData);
        toast({
          title: "Партнёр создан.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      }

      loadPartners();
      handleClose();
    } catch (error) {
      toast({
        title: "Ошибка при сохранении партнёра.",
        description: error.response?.data?.message || "Попробуйте снова позже.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      console.error("Ошибка при сохранении партнёра:", error);
    }
  };

  const handleDeletePartner = async (id) => {
    try {
      await axios.delete(`${api}/partner/delete/${id}`);
      toast({
        title: "Партнёр удалён.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });
      loadPartners();
    } catch (error) {
      toast({
        title: "Ошибка при удалении.",
        description: error.response?.data?.message || "Попробуйте снова позже.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      console.error("Ошибка при удалении партнёра:", error);
    }
  };

  const handleEditPartner = (partner) => {
    setIsEditing(true);
    setEditingId(partner.id);
    setFormData({
      fullName: partner.fullName || "",
      partnerType: partner.partnerType || "",
      bonus: partner.bonus?.toString() || "",
      clientsPerMonth: partner.clientsPerMonth?.toString() || "",
      allClients: partner.allClients?.toString() || "",
    });
    onOpen();
  };

  const handleClose = () => {
    onClose();
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      fullName: "",
      partnerType: "",
      bonus: "",
      clientsPerMonth: "",
      allClients: "",
    });
  };

  const partnerTypeOptions = [
    { value: "doctor", label: "Доктор" },
    { value: "medical_representative", label: "Мед представитель" },
  ];

  return (
    <Box p={4} borderRadius="16px" w="100%" overflowX="auto" bg="#fff">
      <Flex justify="space-between" mb={4} flexWrap="wrap" gap={4}>
        <InputGroup w={{ base: "100%", md: "50%" }}>
          <Input
            placeholder="Поиск по ID, имени, типу или дате создания"
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
        <Button colorScheme="blue" onClick={onOpen}>
          Создать партнёра
        </Button>
      </Flex>

      <TableContainer overflowX="auto" width="100%">
        <Table variant="striped" size="sm" width="100%">
          <Thead position="sticky" top={0} zIndex={1} bg="white">
            <Tr>
              <Th>ID</Th>
              <Th>Полное имя</Th>
              <Th>Тип партнёра</Th>
              <Th>Бонус</Th>
              <Th>Клиентов в месяц</Th>
              <Th>Всего клиентов</Th>
              <Th>Дата создания</Th>
              <Th>Действия</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredPartners.map((partner) => (
              <Tr key={partner.id}>
                <Td>{partner.id}</Td>
                <Td>{partner.fullName}</Td>
                <Td>
                  {partner.partnerType === "doctor"
                    ? "Доктор"
                    : partner.partnerType === "medical_representative"
                    ? "Мед представитель"
                    : partner.partnerType}
                </Td>
                <Td>{partner.bonus || 0}</Td>
                <Td>{partner.clientsPerMonth || 0}</Td>
                <Td>{partner.allClients || 0}</Td>
                <Td>{new Date(partner.createdAt).toLocaleDateString()}</Td>
                <Td>
                  <Flex gap={2}>
                    <Button
                      size="xs"
                      colorScheme="yellow"
                      onClick={() => handleEditPartner(partner)}
                    >
                      Редактировать
                    </Button>
                    <Button
                      size="xs"
                      colorScheme="red"
                      onClick={() => handleDeletePartner(partner.id)}
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
      <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "Редактирование партнёра" : "Создание нового партнёра"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={3}>
              <FormLabel>Полное имя</FormLabel>
              <Input
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="Введите полное имя партнёра"
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Тип партнёра</FormLabel>
              <Select
                value={formData.partnerType}
                onChange={(e) =>
                  setFormData({ ...formData, partnerType: e.target.value })
                }
                placeholder="Выберите тип партнёра"
              >
                {partnerTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Бонус</FormLabel>
              <Input
                type="number"
                value={formData.bonus}
                onChange={(e) =>
                  setFormData({ ...formData, bonus: e.target.value })
                }
                placeholder="Введите размер бонуса"
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Клиентов в месяц</FormLabel>
              <Input
                type="number"
                value={formData.clientsPerMonth}
                onChange={(e) =>
                  setFormData({ ...formData, clientsPerMonth: e.target.value })
                }
                placeholder="Введите количество клиентов в месяц"
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Всего клиентов</FormLabel>
              <Input
                type="number"
                value={formData.allClients}
                onChange={(e) =>
                  setFormData({ ...formData, allClients: e.target.value })
                }
                placeholder="Введите общее количество клиентов"
              />
            </FormControl>

            <Flex justifyContent="flex-end" mt={4}>
              <Button colorScheme="blue" mr={3} onClick={handleCreatePartner}>
                {isEditing ? "Сохранить" : "Создать"}
              </Button>
              <Button onClick={handleClose}>Отмена</Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Partners;
