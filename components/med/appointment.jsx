"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
} from "@chakra-ui/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import dynamic from "next/dynamic";
import { SimpleGrid } from "@chakra-ui/react";
const CalendarClient = dynamic(() => import("./calendar"), {
  ssr: false,
});
import { getApiBaseUrl } from "../../utils/api";

function Appointment() {
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    date: "",
    surname: "",
    name: "",
    lastName: "",
    birthDate: "",
    phoneNumber: "",
    sex: "",
    benefit: "",
    status: "",
    type: "",
    timeStart: "",
    duration: "",
    timeEnd: "",
    doctor: "",
    offer: "",
    desc: "",
  });
  const [types, setTypes] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [offers, setOffers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const api = getApiBaseUrl();

  const safeGet = async (url) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (err) {
      console.warn(
        `Не удалось загрузить: ${url}`,
        err.response?.data || err.message
      );
      return [];
    }
  };

  const loadData = async () => {
    try {
      const [types, benefits, offers, doctors, apps] = await Promise.all([
        safeGet(`${api}/types`),
        safeGet(`${api}/benefits`),
        safeGet(`${api}/offers`),
        safeGet(`${api}/doctors`),
        safeGet(`${api}/apps`),
      ]);

      setTypes(types);
      setBenefits(benefits);
      setOffers(offers);
      setDoctors(doctors);

      const now = new Date();

      setAppointments(
        apps
          .filter((item) => new Date(item.timeStart) >= now)
          .map((item) => ({
            title: `${item.surname} ${item.name}`,
            start: item.timeStart,
            end: item.timeEnd,
          }))
      );
    } catch (err) {
      console.error("Ошибка загрузки данных:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDateClick = (arg) => {
    setFormData((prev) => ({
      ...prev,
      date: arg.dateStr,
      timeStart: arg.dateStr + "T09:00:00",
    }));
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${api}/app/new`, formData);
      toast({
        title: "Встреча назначена",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      loadData();
      onClose();
    } catch (error) {
      toast({
        title: "Ошибка при создании встречи",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4} w={"100%"} h={"100%"} bg={"white"} borderRadius={"16px"}>
      <CalendarClient events={appointments} onDateClick={handleDateClick} />

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Назначить встречу</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {[
              { label: "Фамилия", name: "surname" },
              { label: "Имя", name: "name" },
              { label: "Отчество", name: "lastName" },
              { label: "Дата рождения", name: "birthDate", type: "date" },
              { label: "Номер телефона", name: "phoneNumber" },
              { label: "Описание", name: "desc" },
            ].map(({ label, name, type }) => (
              <FormControl key={name} mb={3}>
                <FormLabel>{label}</FormLabel>
                <Input
                  type={type || "text"}
                  value={formData[name] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [name]: e.target.value })
                  }
                />
              </FormControl>
            ))}

            <FormControl mb={3}>
              <FormLabel>Пол</FormLabel>
              <Select
                onChange={(e) =>
                  setFormData({ ...formData, sex: e.target.value })
                }
              >
                <option value="1">Мужской</option>
                <option value="0">Женский</option>
              </Select>
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Тип</FormLabel>
              <Select
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                {types.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Льгота</FormLabel>
              <Select
                onChange={(e) =>
                  setFormData({ ...formData, benefit: e.target.value })
                }
              >
                {benefits.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Предложение</FormLabel>
              <Select
                onChange={(e) =>
                  setFormData({ ...formData, offer: e.target.value })
                }
              >
                {offers.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Врач</FormLabel>
              <Select
                value={formData.doctor}
                onChange={(e) =>
                  setFormData({ ...formData, doctor: parseInt(e.target.value) })
                }
              >
                <option value={0}>Выберите врача</option>
                {doctors.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.surname} {item.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <Button colorScheme="blue" onClick={handleSubmit} mt={4}>
              Создать
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Appointment;
