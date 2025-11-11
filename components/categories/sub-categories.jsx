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

function SubCategories() {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]); // Состояние для категорий
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "", // categoryId будет хранить выбранную категорию
  });
  const api = getApiBaseUrl();
  // Загрузка подкатегорий
  async function loadSubCategories() {
    const data = await fetcher("sub");
    setSubCategories(Array.isArray(data) ? data : []);
  }

  // Загрузка категорий
  async function loadCategories() {
    const data = await fetcher("categories");
    setCategories(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadSubCategories();
    loadCategories();
  }, []);

  const filteredSubCategories = subCategories.filter((subCategory) =>
    [subCategory?.id, subCategory?.name, subCategory?.createdAt].some((field) =>
      field?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleCreateSubCategory = async () => {
    try {
      if (isEditing) {
        await axios.put(`${api}/sub/edit/${editingId}`, formData);
        toast({
          title: "Подкатегория обновлена.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      } else {
        await axios.post(`${api}/sub/new`, formData);
        toast({
          title: "Подкатегория создана.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      }

      loadSubCategories();
      onClose();
      setFormData({
        name: "",
        categoryId: "", // Сброс после создания
      });
    } catch (error) {
      toast({
        title: "Ошибка при создании подкатегории.",
        description: error.response?.data?.message || "Попробуйте снова позже.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      console.error("Ошибка при создании подкатегории:", error);
    }
  };

  const handleDeleteSubCategory = async (id) => {
    try {
      await axios.delete(`${api}/sub/delete/${id}`);
      toast({
        title: "Подкатегория удалена.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });
      loadSubCategories();
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

  const handleEditSubCategory = (subCategory) => {
    setIsEditing(true);
    setEditingId(subCategory.id);
    setFormData({
      name: subCategory.name,
      categoryId: subCategory.categoryId, // Присваиваем id категории
    });
    onOpen();
  };

  const handleClose = () => {
    onClose();
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: "",
      categoryId: "", // Сброс формы
    });
  };

  return (
    <Box p={4} borderRadius="16px" w="100%" overflowX="auto" bg="#fff">
      <Flex justify="space-between" mb={4} flexWrap="wrap" gap={4}>
        <InputGroup w={{ subCategory: "100%", md: "50%" }}>
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
          Создать подкатегорию
        </Button>
      </Flex>

      <TableContainer overflowX="auto" width="100%">
        <Table variant="striped" size="sm" width="100%">
          <Thead position="sticky" top={0} zIndex={1} bg="white">
            <Tr>
              <Th>id</Th>
              <Th>Имя подкатегории</Th>
              <Th>Категория</Th>
              <Th>Количество услуг</Th>
              <Th>Создан</Th>
              <Th>Действия</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredSubCategories.map((subCategory) => (
              <Tr key={subCategory.id}>
                <Td>{subCategory.id}</Td>
                <Td>{subCategory.name}</Td>
                <Td>{subCategory.category.categoryName}</Td>
                <Td>{subCategory.offers?.length || 0}</Td>
                <Td>
                  {new Date(subCategory.createdAt).toISOString().split("T")[0]}
                </Td>
                <Td>
                  <Flex gap={2}>
                    <Button
                      size="xs"
                      colorScheme="yellow"
                      onClick={() => handleEditSubCategory(subCategory)}
                    >
                      Редактировать
                    </Button>
                    <Button
                      size="xs"
                      colorScheme="red"
                      onClick={() => handleDeleteSubCategory(subCategory.id)}
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
          <ModalHeader>Создание подкатегории</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={3}>
              <FormLabel>Имя подкатегории</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Введите имя подкатегории"
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Категория</FormLabel>
              <Select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                placeholder="Выберите категорию"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.categoryName}
                  </option>
                ))}
              </Select>
            </FormControl>

            <Button colorScheme="blue" mr={3} onClick={handleCreateSubCategory}>
              {isEditing ? "Сохранить" : "Создать"}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default SubCategories;
