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

function Benefit() {
  const [bases, setBases] = useState([]);
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    desc: "",
  });
  const api = getApiBaseUrl();
  async function loadbases() {
    const data = await fetcher("benefits");
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
        await axios.put(`${api}/benefit/update/${editingId}`, formData);
        toast({
          title: "Льгота обновлён.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      } else {
        await axios.post(`${api}/benefit/new`, formData);
        toast({
          title: "Льгота создан.",
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
        desc: "",
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
      await axios.delete(`${api}/benefit/delete/${id}`);
      toast({
        title: "Льгота удалён.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });
      loadbases();
    } catch (error) {
      toast({
        title: "Ошибка при удалении.",
        description: error.response?.data?.message || "Попробуйте снова позже.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      console.error("Ошибка при удалении Льготаа:", error);
    }
  };

  const handleEditBase = (base) => {
    setIsEditing(true);
    setEditingId(base.id);
    setFormData({ name: base.name, desc: base.desc });
    onOpen();
  };

  const handleClose = () => {
    onClose();
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: "", desc: "" });
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
          Создать Льготу
        </Button>
      </Flex>

      <TableContainer overflowX="auto" width="100%">
        <Table variant="striped" size="sm" width="100%">
          <Thead position="sticky" top={0} zIndex={1} bg="white">
            <Tr>
              <Th>id</Th>
              <Th>Название Льготы</Th>
              <Th>Описание</Th>
              <Th>Создан</Th>
              <Th>Действия</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredbases.map((base) => (
              <Tr key={base.id}>
                <Td>{base.id}</Td>
                <Td>{base.name}</Td>
                <Td>{base.desc || "Описания нет"}</Td>
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
          <ModalHeader>Создание Льготы</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={3}>
              <FormLabel>Имя льготы</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Введите имя льготы"
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Описание льготы</FormLabel>
              <Input
                value={formData.desc}
                onChange={(e) =>
                  setFormData({ ...formData, desc: e.target.value })
                }
                placeholder="Введите описание"
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

export default Benefit;
