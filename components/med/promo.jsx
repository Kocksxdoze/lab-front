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

function Promo() {
  const [bases, setBases] = useState([]);
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    presentage: "",
  });
  const api = getApiBaseUrl();

  async function loadbases() {
    const data = await fetcher("promocodes");
    setBases(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadbases();
  }, []);

  const filteredbases = bases.filter((base) =>
    [base?.id, base?.name, base?.createdAt].some((field) =>
      field?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleCreatebase = async () => {
    try {
      if (isEditing) {
        await axios.put(`${api}/promo/edit/${editingId}`, formData);
        toast({
          title: "Филиал обновлён.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      } else {
        await axios.post(`${api}/promo/create`, formData);
        toast({
          title: "Промокод создан.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      }

      loadbases();
      onClose();
      setFormData({
        name: "",
        presentage: "",
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
      await axios.delete(`${api}/promo/delete/${id}`);
      toast({
        title: "Филиал удалён.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });
      loaddoctors();
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
    setFormData({ name: base.name, presentage: base.presentage });
    onOpen();
  };

  const handleClose = () => {
    onClose();
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: "", presentage: "" });
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
          Создать промокод
        </Button>
      </Flex>

      <TableContainer overflowX="auto" width="100%">
        <Table variant="striped" size="sm" width="100%">
          <Thead position="sticky" top={0} zIndex={1} bg="white">
            <Tr>
              <Th>id</Th>
              <Th>Название промокода</Th>
              <Th>Процентная скидка</Th>
              <Th>Создан</Th>
              <Th>Действия</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredbases.map((base) => (
              <Tr key={base.id}>
                <Td>{base.id}</Td>
                <Td>{base.name}</Td>
                <Td>{base.presentage || 0}</Td>
                <Td>{new Date(base.createdAt).toISOString().split("T")[0]}</Td>
                <Td>
                  <Flex gap={2}>
                    <Button
                      size="xs"
                      colorScheme="yellow"
                      onClick={() => handleEditBase(base)}
                    >
                      Редактировать
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
          <ModalHeader>Создание Промокода</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={3}>
              <FormLabel>Имя промокода</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Введите имя промокода"
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Процентная скидка</FormLabel>
              <Input
                type="number"
                value={formData.presentage}
                onChange={(e) =>
                  setFormData({ ...formData, presentage: e.target.value })
                }
                placeholder="Введите процент"
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

export default Promo;
