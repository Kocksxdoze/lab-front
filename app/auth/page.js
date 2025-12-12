"use client";
import { useEffect } from "react";
import { Box, useToast } from "@chakra-ui/react";
import Cookies from "js-cookie";
import ParticlesComponent from "../../components/med/particles";
import LoginForm from "../../components/med/loginForm";



const Auth = () => {
  const toast = useToast();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = Cookies.get("token");
      if (token) {
        Cookies.remove("token");
        toast({
          title: "Вы успешно вышли из системы.",
          status: "warning",
          isClosable: true,
          position: "bottom-right",
        });
      }
    }
  }, []);

  return (
    <Box
      position="relative"
      w="full"
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-b, black, white)"
    >
      <ParticlesComponent />
      <LoginForm />
    </Box>
  );
};

export default Auth;
