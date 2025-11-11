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

function Categories() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    categoryName: "",
  });
  const api = getApiBaseUrl();

  async function loadcategories() {
    const data = await fetcher("categories");
    setCategories(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadcategories();
  }, []);

  const filteredcategories = categories.filter((category) =>
    [category?.id, category?.name, category?.createdAt].some((field) =>
      field?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleCreatecategory = async () => {
    try {
      if (isEditing) {
        await axios.put(`${api}/category/edit/${editingId}`, formData);
        toast({
          title: "Филиал обновлён.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      } else {
        await axios.post(`${api}/category/new`, formData);
        toast({
          title: "Филиал создан.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      }

      loadcategories();
      onClose();
      setFormData({
        categoryName: "",
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

  const handleDeletecategory = async (id) => {
    try {
      await axios.delete(`${api}/category/delete/${id}`);
      toast({
        title: "Филиал удалён.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });
      loadcategories();
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

  const handleEditcategory = (category) => {
    setIsEditing(true);
    setEditingId(category.id);
    setFormData({ name: category.categoryName });
    onOpen();
  };

  const handleClose = () => {
    onClose();
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: "" });
  };

  return (
    <Box p={4} borderRadius="16px" w="100%" overflowX="auto" bg="#fff">
      <Flex justify="space-between" mb={4} flexWrap="wrap" gap={4}>
        <InputGroup w={{ category: "100%", md: "50%" }}>
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
          Создать категорию
        </Button>
      </Flex>

      <TableContainer overflowX="auto" width="100%">
        <Table variant="striped" size="sm" width="100%">
          <Thead position="sticky" top={0} zIndex={1} bg="white">
            <Tr>
              <Th>id</Th>
              <Th>Имя категории</Th>
              <Th>Количество под-категорий</Th>
              <Th>Создан</Th>
              <Th>Действия</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredcategories.map((category) => (
              <Tr key={category.id}>
                <Td>{category.id}</Td>
                <Td>{category.categoryName}</Td>
                <Td>{category.subcategories?.length || 0}</Td>
                <Td>
                  {new Date(category.createdAt).toISOString().split("T")[0]}
                </Td>
                <Td>
                  <Flex gap={2}>
                    <Button
                      size="xs"
                      colorScheme="yellow"
                      onClick={() => handleEditcategory(category)}
                    >
                      Редактировать
                    </Button>
                    <Button
                      size="xs"
                      colorScheme="red"
                      onClick={() => handleDeletecategory(category.id)}
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
          <ModalHeader>Создание категории</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {[{ name: "categoryName", label: "Имя категории" }].map(
              ({ name, label }) => (
                <FormControl key={name} mb={3}>
                  <FormLabel>{label}</FormLabel>
                  <Input
                    value={formData[name]}
                    onChange={(e) =>
                      setFormData({ ...formData, [name]: e.target.value })
                    }
                    placeholder={`Введите ${label.toLowerCase()}`}
                  />
                </FormControl>
              )
            )}

            <Button colorScheme="blue" mr={3} onClick={handleCreatecategory}>
              {isEditing ? "Сохранить" : "Создать"}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Categories;
