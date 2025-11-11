"use client";
import React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";
import { getApiBaseUrl } from "../../utils/api";

function LoginForm() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const api = getApiBaseUrl();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${api}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        Cookies.set("token", data.token, { expires: 0.02 });

        // Decode the token to get user role
        const decoded = jwt.decode(data.token);
        const userRole = decoded?.role;

        toast({
          title: `Добро пожаловать ${formData.username}!`,
          status: "info",
          duration: 5000,
          position: "bottom-right",
          isClosable: true,
        });

        // Redirect based on role
        switch (userRole) {
          case "admin":
            router.push("/");
            break;
          case "registration":
            router.push("/register");
            break;
          case "accountant":
            router.push("/cashbox");
            break;
          case "doctors":
          case "laboratory":
            router.push("/cabinet");
            break;
          default:
            router.push("/");
        }
      } else {
        toast({
          title: "Ошибка входа",
          description: "Неверный логин или пароль.",
          status: "error",
          duration: 3000,
          position: "bottom-right",
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка сервера",
        description: "Попробуйте позже.",
        status: "error",
        duration: 3000,
        position: "bottom-right",
        isClosable: true,
      });
    }
    setLoading(false);
  };

  return (
    <>
      <Box
        zIndex="10"
        width={"400px"}
        pos={"absolute"}
        top={"50%"}
        left={"50%"}
        shadow={"2xl"}
        p={"40px"}
        borderRadius={"10px"}
        transform={"translate(-50%,-50%)"}
        backdropFilter="blur(5px)"
      >
        <Heading mb={"30px"} color="black">
          Вход в систему
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack>
            <Input
              bg={"transparent"}
              border={0}
              outline={"none"}
              fontSize={"16px"}
              p={"10px 0"}
              borderBottom={"1px solid #000"}
              borderRadius={0}
              mb={"30px"}
              color={"#000"}
              required
              name="username"
              placeholder="Login"
              value={formData.username}
              onChange={handleChange}
              _focus={{
                outline: "none",
                boxShadow: "none",
                borderBottom: "1px solid #000",
              }}
            />
            <Input
              bg={"transparent"}
              border={0}
              outline={"none"}
              fontSize={"16px"}
              p={"10px 0"}
              borderBottom={"1px solid #000"}
              borderRadius={0}
              mb={"30px"}
              color={"#000"}
              required
              _focus={{
                outline: "none",
                boxShadow: "none",
                borderBottom: "1px solid #000",
              }}
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              width={"100%"}
              color={"#000"}
              bg={"transparent"}
              border={"1px solid #000"}
              padding={"10px 20px"}
              borderRadius={"5px"}
              textTransform={"uppercase"}
              letterSpacing={"2px"}
              fontSize={"16px"}
              cursor={"pointer"}
              _hover={{ bg: "#000", color: "#fff" }}
              _focus={{
                outline: "none",
                boxShadow: "none",
              }}
              isLoading={loading}
              type="submit"
            >
              {loading ? <Spinner size="sm" color="black" /> : "Войти"}
            </Button>
          </VStack>
        </form>
      </Box>
    </>
  );
}

export default LoginForm;
