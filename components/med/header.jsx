import React, { useState, useEffect } from "react";
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
  InputRightElement,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, SearchIcon } from "@chakra-ui/icons";
import fetcher from "../../utils/fetcher";
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";
import { getApiBaseUrl } from "../../utils/api";

function Header() {
  const [year, setYear] = useState("");
  const [time, setTime] = useState("");
  const [weekday, setWeekday] = useState("");
  const router = useRouter();
  const [clientsCount, setClientsCount] = useState(0);
  const toast = useToast();
  const [remainingTime, setRemainingTime] = useState(3600);
  const [reports, setReports] = useState([]);
  const api = getApiBaseUrl();
  const token = Cookies.get("token");
  const decoded = jwt.decode(token);
  const role = decoded?.role;
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/patients?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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

          <InputGroup w={"35%"}>
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
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              _focus={{
                outline: "none",
                boxShadow: "none",
                borderBottom: "1px solid #000",
              }}
            />
            <InputRightElement>
              <Button
                size="sm"
                onClick={() => {
                  if (searchQuery.trim()) {
                    router.push(
                      `/patients?search=${encodeURIComponent(
                        searchQuery.trim()
                      )}`
                    );
                  }
                }}
              >
                <SearchIcon />
              </Button>
            </InputRightElement>
          </InputGroup>
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
              onClick={() => router.push("/register")}
            >
              Регистрация
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
