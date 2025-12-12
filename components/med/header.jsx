import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Button,
  Text,
  Input,
  Heading,
  chakra,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  InputGroup,
  List,
  ListItem,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { ChevronDownIcon } from "@chakra-ui/icons";
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";
import { getApiBaseUrl } from "../../utils/api";

function Header() {
  const [year, setYear] = useState("");
  const [time, setTime] = useState("");
  const [weekday, setWeekday] = useState("");
  const router = useRouter();
  const [clientsCount, setClientsCount] = useState(0);
  const [allClients, setAllClients] = useState([]);
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const api = getApiBaseUrl();
  const token = Cookies.get("token");
  const decoded = jwt.decode(token);
  const role = decoded?.role;
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/patients?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowDropdown(false);
    }
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredClients([]);
      setShowDropdown(false);
      return;
    }

    // Фильтруем клиентов по ID или ФИО
    const filtered = allClients.filter((client) => {
      const searchLower = query.toLowerCase();

      // Поиск по ID
      const idMatch = client.id?.toString().includes(query);

      // Поиск по ФИО (surname - фамилия, name - имя, lastName - отчество)
      const nameMatch =
        client.surname?.toLowerCase().includes(searchLower) ||
        client.name?.toLowerCase().includes(searchLower) ||
        client.lastName?.toLowerCase().includes(searchLower) ||
        `${client.surname || ""} ${client.name || ""} ${client.lastName || ""}`
          .toLowerCase()
          .includes(searchLower);

      return idMatch || nameMatch;
    });

    setFilteredClients(filtered.slice(0, 10)); // Ограничиваем до 10 результатов
    setShowDropdown(filtered.length > 0);
  };

  const handleClientSelect = (clientId) => {
    router.push(`/patient/${clientId}`);
    setSearchQuery("");
    setShowDropdown(false);
  };

  // Закрытие выпадающего списка при клике вне области поиска
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setYear(now.toLocaleDateString("ru-RU"));
      setTime(now.toLocaleTimeString("ru-RU"));
      const weekday = now.toLocaleDateString("ru-RU", { weekday: "long" });
      setWeekday(weekday);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      const response = await fetch(`${api}/reports`);
      const data = await response.json();
      if (response.ok) {
        setReports(data);
      }
    };
    fetchReports();
  }, []);

  const clients = async () => {
    try {
      const response = await fetch(`${api}/clients`);
      const data = await response.json();
      console.log(data);

      if (response.ok) {
        setAllClients(data); // Сохраняем всех клиентов для поиска
        setClientsCount(data.length);
        console.log("Data: ", data);
        toast({
          title: "Количество клиентов обновлено!",
          status: "success",
          duration: "5000",
          position: "bottom-right",
        });
      } else {
        toast({
          title: "Ошибка в получении клиентов.",
          status: "error",
          duration: "5000",
          position: "bottom-right",
        });
      }
    } catch (error) {
      console.log("error:", error);
    }
  };

  useEffect(() => {
    clients();
  }, []);

  const logout = () => {
    router.push("/auth");
  };

  // Check if user has access to a specific role
  const hasAccess = (allowedRoles) => {
    return allowedRoles.includes(role);
  };

  // Функция для отображения имени клиента
  const getClientDisplayName = (client) => {
    const fullName = `${client.surname || ""} ${client.name || ""} ${
      client.lastName || ""
    }`.trim();

    return fullName || `Пациент ID: ${client.id}`;
  };

  return (
    <>
      <Flex
        zIndex="999"
        px={"25px"}
        py={"10px"}
        w={"100%"}
        bg={"#fff"}
        shadow={"2xl"}
        borderBottomRadius={"16px"}
        flexDir={"column"}
      >
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          gap={5}
        >
          <Heading
            w="fit-content"
            lineHeight="21px"
            fontSize="35px"
            color="#0052b4"
            mt="5px"
          >
            VIRUSOLOGIYA
            <Box
              fontSize="12px"
              color="black"
              w="full"
              display="flex"
              justifyContent="space-between"
              letterSpacing="widest"
              gap={1}
            >
              <chakra.span>Лаборатория</chakra.span>
              <chakra.span>Научных</chakra.span>
              <chakra.span>Исследований</chakra.span>
            </Box>
          </Heading>

          <Box w={"35%"} position={"relative"} ref={searchRef}>
            <InputGroup>
              <Input
                placeholder="Пац ID или Ф.И.О."
                bg={"transparent"}
                border={0}
                outline={"none"}
                fontSize={"16px"}
                p={"10px 0"}
                borderBottom={"1px solid #000"}
                borderRadius={0}
                color={"#000"}
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleSearch}
                onFocus={() => {
                  if (filteredClients.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                _focus={{
                  outline: "none",
                  boxShadow: "none",
                  borderBottom: "1px solid #000",
                }}
              />
            </InputGroup>

            {/* Выпадающий список результатов */}
            {showDropdown && filteredClients.length > 0 && (
              <List
                position={"absolute"}
                top={"100%"}
                left={0}
                right={0}
                bg={"white"}
                boxShadow={"lg"}
                borderRadius={"8px"}
                mt={2}
                maxH={"300px"}
                overflowY={"auto"}
                zIndex={1000}
                border={"1px solid #e2e8f0"}
              >
                {filteredClients.map((client) => (
                  <ListItem
                    key={client.id}
                    p={"12px 16px"}
                    cursor={"pointer"}
                    _hover={{
                      bg: "#f7fafc",
                      color: "#0052b4",
                    }}
                    borderBottom={"1px solid #e2e8f0"}
                    onClick={() => handleClientSelect(client.id)}
                  >
                    <Text fontWeight={"600"} fontSize={"14px"}>
                      ID: {client.id}
                    </Text>
                    <Text fontSize={"13px"} color={"gray.600"}>
                      {getClientDisplayName(client)}
                    </Text>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          <Text>число пациентов: {clientsCount}</Text>
          <Text>
            {time} {weekday.charAt(0).toUpperCase() + weekday.slice(1)}, {year}
          </Text>
          <Button
            bg={"transparent"}
            borderRadius={"8px"}
            border={"1px solid #000"}
            color={"#000"}
            fontWeight={"600"}
            onClick={logout}
            _hover={{
              backgroundColor: "#0052b4",
              border: "1px solid #0052b4",
              color: "#fff",
            }}
          >
            Выход
          </Button>
        </Box>

        <Box
          display={"flex"}
          alignItems={"flex-start"}
          justifyContent={"flex-start"}
          gap={"10px"}
          mt={5}
        >
          {hasAccess(["admin"]) && (
            <Button
              bg={"#fff"}
              color={"#000"}
              border={"1px solid transparent"}
              borderRadius={"8px"}
              fontWeight={"600"}
              _hover={{
                color: "#fff",
                background: "#0052b4",
                border: "1px solid transparent",
              }}
              onClick={() => router.push("/")}
            >
              Главная
            </Button>
          )}

          {hasAccess(["registration", "accountant", "admin"]) && (
            <Button
              bg={"#fff"}
              color={"#000"}
              border={"1px solid transparent"}
              borderRadius={"8px"}
              fontWeight={"600"}
              _hover={{
                color: "#fff",
                background: "#0052b4",
                border: "1px solid transparent",
              }}
              onClick={() => router.push("/register")}
            >
              Регистрация
            </Button>
          )}

          {hasAccess(["registration", "accountant", "admin"]) && (
            <Button
              bg={"#fff"}
              color={"#000"}
              border={"1px solid transparent"}
              borderRadius={"8px"}
              fontWeight={"600"}
              _hover={{
                color: "#fff",
                background: "#0052b4",
                border: "1px solid transparent",
              }}
              onClick={() => router.push("/patients")}
            >
              Пациенты
            </Button>
          )}

          {hasAccess(["registration", "accountant", "admin"]) && (
            <Button
              bg={"#fff"}
              color={"#000"}
              border={"1px solid transparent"}
              borderRadius={"8px"}
              fontWeight={"600"}
              _hover={{
                color: "#fff",
                background: "#0052b4",
                border: "1px solid transparent",
              }}
              onClick={() => router.push("/cashbox")}
            >
              Касса
            </Button>
          )}

          {hasAccess([
            "registration",
            "accountant",
            "doctors",
            "laboratory",
            "admin",
          ]) && (
            <Button
              bg={"#fff"}
              color={"#000"}
              border={"1px solid transparent"}
              borderRadius={"8px"}
              fontWeight={"600"}
              _hover={{
                color: "#fff",
                background: "#0052b4",
                border: "1px solid transparent",
              }}
              onClick={() => router.push("/cabinet")}
            >
              Кабинет доктора
            </Button>
          )}

          {hasAccess([
            "registration",
            "accountant",
            "doctors",
            "laboratory",
            "admin",
          ]) && (
            <Button
              bg={"#fff"}
              color={"#000"}
              border={"1px solid transparent"}
              borderRadius={"8px"}
              fontWeight={"600"}
              _hover={{
                color: "#fff",
                background: "#0052b4",
                border: "1px solid transparent",
              }}
              onClick={() => router.push("/lab")}
            >
              Лаборатория
            </Button>
          )}
          {hasAccess(["registration", "admin"]) && (
            <Button
              bg={"#fff"}
              color={"#000"}
              border={"1px solid transparent"}
              borderRadius={"8px"}
              fontWeight={"600"}
              _hover={{
                color: "#fff",
                background: "#0052b4",
                border: "1px solid transparent",
              }}
              onClick={() => router.push("/blanks")}
            >
              Бланки
            </Button>
          )}

          {hasAccess(["admin"]) && (
            <Menu>
              <MenuButton
                as={Button}
                bg={"#fff"}
                color={"#000"}
                border={"1px solid transparent"}
                borderRadius={"8px"}
                fontWeight={"600"}
                _hover={{
                  color: "#fff",
                  background: "#0052b4",
                  border: "1px solid transparent",
                }}
                rightIcon={<ChevronDownIcon />}
              >
                Настройки
              </MenuButton>
              <MenuList zIndex={"999"}>
                <MenuItem onClick={() => router.push("/settings/doctors")}>
                  Таблица врачей
                </MenuItem>
                <MenuItem onClick={() => router.push("/settings/bases")}>
                  Филлиалы
                </MenuItem>
                <MenuItem onClick={() => router.push("/settings/benefits")}>
                  Категории льгот
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Box>
      </Flex>
    </>
  );
}

export default Header;
