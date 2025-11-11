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
  useToast,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import axios from "axios";
import { getApiBaseUrl } from "../../utils/api";

function Palate() {
  const [bases, setBases] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    palate: "",
    floor: "",
    clientId: "",
    palateType: "",
  });
  const api = getApiBaseUrl();

  async function loadbases() {
    const data = await fetcher("palates");
    setBases(Array.isArray(data) ? data : []);
  }
  async function loadClients() {
    const data = await fetcher("clients");
    setClients(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadbases();
    loadClients();
  }, []);

  const filteredbases = bases.filter((base) =>
    [base?.id, base?.palate, base?.createdAt].some((field) =>
      field?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleCreatebase = async () => {
    try {
      if (isEditing) {
        await axios.put(`${api}/palate/edit/${editingId}`, formData);
        toast({
          title: "Филиал обновлён.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      } else {
        await axios.post(`${api}/palate/new`, formData);
        toast({
          title: "Филиал создан.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      }

      loadbases();
      loadClients();
      onClose();
      setFormData({
        palate: "",
        floor: "",
        clientId: "",
        palateType: "",
      });
    } catch (error) {
      toast({
        title: "Ошибка при создании филлиала.",
        description: error.response?.data?.message || "Попробуйте снова позже.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      console.error("Ошибка при создании врача:", error);
    }
  };

  const handleDeleteBase = async (id) => {
    try {
      await axios.delete(`${api}/palate/delete/${id}`);
      toast({
        title: "Филиал удалён.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });
      loadbases();
      loadClients();
    } catch (error) {
      toast({
        title: "Ошибка при удалении.",
        description: error.response?.data?.message || "Попробуйте снова позже.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      console.error("Ошибка при удалении филиала:", error);
    }
  };

  const handleEditBase = (base) => {
    setIsEditing(true);
    setEditingId(base.id);
    setFormData({
      palate: base.palate,
      clientId: base.clientId,
      palateType: base.palateType,
      floor: base.floor,
    });
    onOpen();
  };

  const handleClose = () => {
    onClose();
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      palate: "",
      clientId: "",
    });
  };

  return (
    <Box p={4} borderRadius="16px" w="100%" overflowX="auto" bg="#fff">
      <Flex justify="space-between" mb={4} flexWrap="wrap" gap={4}>
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
        <Button colorScheme="blue" onClick={onOpen}>
          Создать Палату
        </Button>
      </Flex>

      <TableContainer overflowX="auto" width="100%">
        <Table variant="striped" size="sm" width="100%">
          <Thead position="sticky" top={0} zIndex={1} bg="white">
            <Tr>
              <Th>id</Th>
              <Th>Номер палаты</Th>
              <Th>Этаж</Th>
              <Th>Айди клиента</Th>
              <Th>Ф.И.О. клиента</Th>
              <Th>Тип палаты</Th>
              <Th>Создан</Th>
              <Th>Действия</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredbases.map((base) => (
              <Tr key={base.id}>
                <Td>{base.id}</Td>
                <Td>{base.palate}</Td>
                <Td>{base.floor}</Td>
                <Td>{base.clientId || 0}</Td>
                <Td>
                  {(() => {
                    const client = clients.find((c) => c.id === base.clientId);
                    return client
                      ? `${client.surname} ${client.name} ${client.lastName}`
                      : "Не удалось загрузить";
                  })()}
                </Td>

                <Td>{base.palateType || 0}</Td>
                <Td>{new Date(base.createdAt).toISOString().split("T")[0]}</Td>
                <Td>
                  <Flex gap={2}>
                    <Button
                      size="xs"
                      colorScheme="yellow"
                      onClick={() => handleEditBase(base)}
                    >
                      Записать пациента
                    </Button>
                    <Button
                      size="xs"
                      colorScheme="red"
                      onClick={() => handleDeleteBase(base.id)}
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
          <ModalHeader>Запись пациента</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={3}>
              <FormLabel>Номер палаты</FormLabel>
              <Input
                value={formData.palate}
                onChange={(e) =>
                  setFormData({ ...formData, palate: e.target.value })
                }
                placeholder="Введите номер палаты"
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Этаж</FormLabel>
              <Input
                value={formData.floor}
                onChange={(e) =>
                  setFormData({ ...formData, floor: e.target.value })
                }
                placeholder="Введите этаж"
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Айди пациента</FormLabel>
              <Input
                value={formData.clientId}
                onChange={(e) =>
                  setFormData({ ...formData, clientId: e.target.value })
                }
                placeholder="Введите айди пациента"
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Тип палаты</FormLabel>
              <Input
                value={formData.palateType}
                onChange={(e) =>
                  setFormData({ ...formData, palateType: e.target.value })
                }
                placeholder="Введите тип палаты"
              />
            </FormControl>

            <Button colorScheme="blue" mr={3} onClick={handleCreatebase}>
              {isEditing ? "Сохранить" : "Создать"}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Palate;
