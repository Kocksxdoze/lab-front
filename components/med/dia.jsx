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
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import axios from "axios";
import { getApiBaseUrl } from "../../utils/api";

function Lab() {
  const [dias, setDias] = useState([]);
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    sum: "",
    about: "",
    table: "",
    analise: "",
    ready: "",
  });
  const api = getApiBaseUrl();
  const loadDias = async () => {
    try {
      const res = await axios.get(`${api}/dia-categories`);
      setDias(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Ошибка при загрузке Диагностики:", error);
    }
  };

  useEffect(() => {
    loadDias();
  }, []);

  const filteredDias = dias.filter((dia) =>
    [
      dia?.id,
      dia?.name,
      dia?.sum,
      dia?.about,
      dia?.table,
      dia?.analise,
      dia?.ready,
    ].some((field) =>
      field?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleCreateOrUpdate = async () => {
    try {
      if (isEditing) {
        await axios.put(`${api}/dia-category/update/${editingId}`, formData);
        toast({
          title: "Диагностика обновлёна.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await axios.post(`${api}/dia-category/new`, formData);
        toast({
          title: "Диагностика создана.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      loadDias();
      handleClose();
    } catch (error) {
      toast({
        title: "Ошибка при сохранении.",
        description: error.response?.data?.message || "Попробуйте снова позже.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${api}/dia-category/delete/${id}`);
      toast({
        title: "Диагностика удалёна.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      loadDias();
    } catch (error) {
      toast({
        title: "Ошибка при удалении.",
        description: error.response?.data?.message || "Попробуйте снова позже.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (dia) => {
    setIsEditing(true);
    setEditingId(dia.id);
    setFormData({
      name: dia.name,
      about: dia.about,
      sum: dia.sum,
      analise: dia.analise,
      ready: dia.ready,
    });
    onOpen();
  };

  const handleClose = () => {
    onClose();
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: "", description: "" });
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
          Создать Категорию диагностики
        </Button>
      </Flex>

      <TableContainer overflowX="auto" width="100%">
        <Table variant="striped" size="sm" width="100%">
          <Thead position="sticky" top={0} zIndex={1} bg="white">
            <Tr>
              <Th>ID</Th>
              <Th>Название</Th>
              <Th>Цена</Th>
              <Th>Анализ</Th>
              <Th>Создан</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredDias.map((dia) => (
              <Tr key={dia.id}>
                <Td>{dia.id}</Td>
                <Td>{dia.name}</Td>
                <Td>{dia.sum}</Td>
                <Td>{dia.about}</Td>
                <Td>{new Date(dia.createdAt).toLocaleString()}</Td>

                <Td>
                  <Flex gap={2}>
                    <Button
                      size="xs"
                      colorScheme="yellow"
                      onClick={() => handleEdit(dia)}
                    >
                      Редактировать
                    </Button>
                    <Button
                      size="xs"
                      colorScheme="red"
                      onClick={() => handleDelete(dia.id)}
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
            {isEditing ? "Редактировать Диагностику" : "Создать Диагностику"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={3}>
              <FormLabel>Название</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Введите название категории"
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Название анализа</FormLabel>
              <Input
                value={formData.about}
                onChange={(e) =>
                  setFormData({ ...formData, about: e.target.value })
                }
                placeholder="Введите название анализа"
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Цена</FormLabel>
              <Input
                value={formData.sum}
                onChange={(e) =>
                  setFormData({ ...formData, sum: e.target.value })
                }
                placeholder="Введите цену"
              />
            </FormControl>
            <Button colorScheme="blue" mr={3} onClick={handleCreateOrUpdate}>
              {isEditing ? "Сохранить" : "Создать"}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Lab;
