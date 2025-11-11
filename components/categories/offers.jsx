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
import Select from "react-select";
import { getApiBaseUrl } from "../../utils/api";

function Offers() {
  const [offers, setoffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    sum: "",
    subCategoryId: "",
    doctorId: "",
    createdAt: "",
  });
  const api = getApiBaseUrl();

  // Загрузка подкатегорий
  async function loadoffers() {
    const data = await fetcher("offers");
    setoffers(Array.isArray(data) ? data : []);
  }

  // Загрузка категорий
  async function loadCategories() {
    try {
      const data = await fetcher("doctors");
      console.log("Doctors response:", data); // ← добавь это
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Ошибка загрузки докторов:", error); // ← и это
    }
  }

  useEffect(() => {
    loadoffers();
    loadCategories();
  }, []);

  const filteredoffers = offers.filter((offer) =>
    [offer?.id, offer?.name, offer?.createdAt].some((field) =>
      field?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleCreateoffer = async () => {
    if (!formData.name || formData.name.trim() === "") {
      toast({
        title: "Имя услуги обязательно.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    // Далее отправляем запрос
    try {
      if (isEditing) {
        // Обновление
        await axios.put(`${api}/offer/update/${editingId}`, formData);
        toast({
          title: "Услуга обновлена.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      } else {
        // Создание
        await axios.post(`${api}/offer/new`, formData);
        toast({
          title: "Услуга создана.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      }
      loadoffers();
      onClose();
      setFormData({
        name: "",
        sum: "",
        subCategoryId: "",
        doctorId: "",
        createdAt: "",
      });
    } catch (error) {
      toast({
        title: "Ошибка при сохранении услуги.",
        description: error.response?.data?.message || "Попробуйте снова позже.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      console.error("Ошибка при сохранении услуги:", error);
    }
  };

  const handleDeleteoffer = async (id) => {
    try {
      await axios.delete(`${api}/offer/delete/${id}`);
      toast({
        title: "Подкатегория удалена.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });
      loadoffers();
    } catch (error) {
      toast({
        title: "Ошибка при удалении.",
        description: error.response?.data?.message || "Попробуйте снова позже.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      console.error("Ошибка при удалении услуги:", error);
    }
  };

  const handleEditoffer = (offer) => {
    setIsEditing(true);
    setEditingId(offer.id);
    setFormData({
      name: offer.name,
      sum: offer.sum,
      subCategoryId: offer.subCategoryId || "",
      doctorId: Array.isArray(offer.doctorId) ? offer.doctorId : [],
      createdAt: offer.createdAt || "",
    });
    onOpen();
  };
  const handleClose = () => {
    onClose();
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: "",
      sum: "",
      subCategoryId: "",
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
        <Button
          w={"auto"}
          colorScheme="blue"
          onClick={() => {
            setIsEditing(false);
            setEditingId(null);
            setFormData({
              name: "",
              sum: "",
              subCategoryId: "",
              doctorId: "",
              createdAt: "",
            });
            onOpen();
          }}
        >
          Создать
        </Button>
      </Flex>

      <TableContainer overflowX="auto" width="100%">
        <Table variant="striped" size="sm" width="100%">
          <Thead position="sticky" top={0} zIndex={1} bg="white">
            <Tr>
              <Th>id</Th>
              <Th>Название услуги</Th>
              <Th>Стоимость услуги</Th>
              <Th>Под-категория</Th>
              <Th>Доктор</Th>
              <Th>Создан</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredoffers.map((offer) => (
              <Tr key={offer.id}>
                <Td>{offer.id}</Td>
                <Td>{offer.name}</Td>
                <Td>{offer.sum}</Td>
                <Td>{offer.subCategory.name}</Td>
                <Td>
                  {offer.doctors && offer.doctors.surname && offer.doctors.name
                    ? `${offer.doctors.surname} ${offer.doctors.name}`
                    : "-"}
                </Td>

                <Td>{new Date(offer.createdAt).toISOString().split("T")[0]}</Td>
                <Td>
                  <Flex gap={2}>
                    <Button
                      size="xs"
                      colorScheme="yellow"
                      onClick={() => handleEditoffer(offer)}
                    >
                      Редактировать
                    </Button>
                    <Button
                      size="xs"
                      colorScheme="red"
                      onClick={() => handleDeleteoffer(offer.id)}
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
          <ModalHeader>Создание услуги</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={3}>
              <FormLabel>Название услуги</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Введите название услуги"
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Стоимость услуги</FormLabel>
              <Input
                value={formData.sum}
                onChange={(e) =>
                  setFormData({ ...formData, sum: e.target.value })
                }
                placeholder="Стоимость услуги"
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Принадлежность подкатегории</FormLabel>
              <Input
                value={formData.subCategoryId}
                onChange={(e) =>
                  setFormData({ ...formData, subCategoryId: e.target.value })
                }
                placeholder="Принадлежность подкатегории"
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Доктора</FormLabel>
              <Select
                isMulti
                name="doctorId"
                options={categories.map((doc) => ({
                  label: `${doc.name} ${doc.surname}`,
                  value: doc.id,
                }))}
                placeholder="Выберите докторов"
                value={categories
                  .filter((doc) => formData.doctorId?.includes(doc.id))
                  .map((doc) => ({
                    label: `${doc.name} ${doc.surname}`,
                    value: doc.id,
                  }))}
                onChange={(selected) =>
                  setFormData({
                    ...formData,
                    doctorId: selected.map((item) => item.value),
                  })
                }
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: "#CBD5E0", // Цвет бордера
                    borderRadius: "6px",
                    minHeight: "38px",
                  }),
                }}
              />
            </FormControl>

            <Button colorScheme="blue" mr={3} onClick={handleCreateoffer}>
              {isEditing ? "Сохранить" : "Создать"}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Offers;
