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
  Select,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import axios from "axios";
import { getApiBaseUrl } from "../../utils/api";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [bases, setBases] = useState([]);
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    surname: "",
    phoneNumber: "",
    email: "",
    dateBirth: "",
    job: "",
    profession: "",
    street: "",
    baseId: "",
    role: "",
  });
  const api = getApiBaseUrl();
  async function loaddoctors() {
    const data = await fetcher("doctors");
    setDoctors(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loaddoctors();
  }, []);

  useEffect(() => {
    loaddoctors();
    loadBases();
  }, []);

  const loadBases = async () => {
    const data = await fetcher("bases");
    setBases(Array.isArray(data) ? data : []);
  };

  const filtereddoctors = doctors.filter((doctor) =>
    [doctor?.id, doctor?.name, doctor?.createdAt].some((field) =>
      field?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleSaveDoctor = async () => {
    try {
      if (formData.id) {
        await axios.put(`${api}/doctor/edit/${formData.id}`, formData);
        toast({
          title: "Данные врача обновлены.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      } else {
        await axios.post(`${api}/register`, formData);
        toast({
          title: "Врач успешно создан.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      }
      loaddoctors();
      onClose();
      setFormData({
        username: "",
        password: "",
        name: "",
        surname: "",
        phoneNumber: "",
        email: "",
        dateBirth: "",
        job: "",
        profession: "",
        street: "",
        baseId: "",
        role: "",
        id: undefined,
      });
    } catch (error) {
      toast({
        title: "Ошибка.",
        description: error.response?.data?.message || "Попробуйте снова позже.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      console.error("Ошибка:", error);
    }
  };

  const handleDeleteDoctor = async (id) => {
    try {
      await axios.delete(`${api}/doctor/delete/${id}`);
      toast({
        title: "Врач удалён.",
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
      console.error("Ошибка при удалении врача:", error);
    }
  };

  const handleEditDoctor = (doctor) => {
    setFormData({ ...doctor, password: "" });
    onOpen();
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
          Создать врача
        </Button>
      </Flex>

      <TableContainer overflowX="auto" width="100%">
        <Table variant="striped" size="sm" width="100%">
          <Thead position="sticky" top={0} zIndex={1} bg="white">
            <Tr>
              <Th>ID</Th>
              <Th>ФИО</Th>
              <Th>Телефон</Th>
              <Th>Email</Th>
              <Th>Дата рождения</Th>
              <Th>Место работы</Th>
              <Th>Профессия</Th>
              <Th>Место проживания</Th>
              <Th>Роль</Th>
              <Th>Создан</Th>
              <Th>Действия</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtereddoctors.map((doctor) => (
              <Tr key={doctor.id}>
                <Td>{doctor.id}</Td>
                <Td>{`${doctor.surname} ${doctor.name}`}</Td>
                <Td>{doctor.phoneNumber}</Td>
                <Td>{doctor.email}</Td>
                <Td>{doctor.dateBirth}</Td>
                <Td>{doctor.job}</Td>
                <Td>{doctor.profession}</Td>
                <Td>{doctor.street}</Td>
                <Td>{doctor.role}</Td>
                <Td>{new Date(doctor.createdAt).toLocaleDateString()}</Td>
                <Td>
                  <Flex gap={2}>
                    <Button
                      size="xs"
                      colorScheme="yellow"
                      onClick={() => handleEditDoctor(doctor)}
                    >
                      Редактировать
                    </Button>
                    <Button
                      size="xs"
                      colorScheme="red"
                      onClick={() => handleDeleteDoctor(doctor.id)}
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
          <ModalHeader>Создание врача</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {[
              { name: "username", label: "username" },
              { name: "password", label: "password" },
              { name: "surname", label: "Фамилия" },
              { name: "name", label: "Имя" },
              { name: "phoneNumber", label: "Номер телефона" },
              { name: "email", label: "Email" },
              { name: "dateBirth", label: "Дата рождения" },
              { name: "job", label: "Место работы" },
              { name: "profession", label: "Профессия" },
              { name: "street", label: "Адрес проживания" },
            ].map(({ name, label }) => (
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
            ))}
            <FormControl mb={3}>
              <FormLabel>Роль</FormLabel>
              <Select
                placeholder="Выберите роль"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                {[
                  "nurse",
                  "doctors",
                  "laboratory",
                  "accountant",
                  "registration",
                  "admin",
                ].map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Филиал</FormLabel>
              <Select
                placeholder="Выберите филиал"
                value={formData.baseId}
                onChange={(e) =>
                  setFormData({ ...formData, baseId: e.target.value })
                }
              >
                {bases.map((base) => (
                  <option key={base.id} value={base.id}>
                    {base.name || base.address || `Филиал ${base.id}`}
                  </option>
                ))}
              </Select>
            </FormControl>

            <Button colorScheme="blue" mr={3} onClick={handleSaveDoctor}>
              {formData.id ? "Сохранить" : "Создать"}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Doctors;
