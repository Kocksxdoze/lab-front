"use client";
import React from "react";
import { Box, Flex, Button } from "@chakra-ui/react";
import ParticlesComponent from "../components/med/particles";
import Header from "../components/med/header";
import Footer from "../components/med/footer";

import { useRouter } from "next/navigation";
import GraphOne from "../components/med/graphOne";
import GraphTwo from "../components/med/graphTwo";

function Main() {
  const router = useRouter();

  return (
    <Flex flexDir={"column"} pos={"absolute"} w={"100%"}>
      <Box zIndex="999" pos={"relative"} px={"50px"}>
        <Header />
      </Box>
      <Box
        position="relative"
        w="full"
        bgColor={"white.500"}
        h="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgGradient="linear(to-b, black, white)"
      >
        <ParticlesComponent />

        <Flex
          mt={"30px"}
          gap={5}
          w={"100%"}
          alignItems={"center"}
          px={"50px"}
          justifyContent={"space-between"}
        >
          <Button
            fontWeight={"500"}
            w={"auto"}
            h={"auto"}
            py={"10px"}
            bg={"white"}
            shadow={"xl"}
            borderRadius={"8px"}
            onClick={() => router.push("/patients")}
          >
            Пациенты
          </Button>

          <Button
            fontWeight={"500"}
            w={"auto"}
            h={"auto"}
            py={"10px"}
            bg={"white"}
            shadow={"xl"}
            borderRadius={"8px"}
            onClick={() => router.push("/lab-reports")}
          >
            Отчеты по лаборатории
          </Button>

          <Button
            fontWeight={"500"}
            w={"auto"}
            h={"auto"}
            py={"10px"}
            bg={"white"}
            shadow={"xl"}
            borderRadius={"8px"}
            onClick={() => router.push("/promocodes")}
          >
            Промокоды
          </Button>
          <Button
            fontWeight={"500"}
            w={"auto"}
            h={"auto"}
            py={"10px"}
            bg={"white"}
            shadow={"xl"}
            borderRadius={"8px"}
            onClick={() => router.push("/settings/doctors")}
          >
            Врачи
          </Button>
          <Button
            fontWeight={"500"}
            w={"auto"}
            h={"auto"}
            py={"10px"}
            bg={"white"}
            shadow={"xl"}
            borderRadius={"8px"}
            onClick={() => router.push("/settings/bases")}
          >
            Филлиалы
          </Button>
          <Button
            fontWeight={"500"}
            w={"auto"}
            h={"auto"}
            py={"10px"}
            bg={"white"}
            shadow={"xl"}
            borderRadius={"8px"}
            onClick={() => router.push("/settings/benefits")}
          >
            Категории льгот
          </Button>
        </Flex>
      </Box>
      <Box
        zIndex={"500"}
        mt={"30px"}
        px={"50px"}
        display={"flex"}
        flexDir={"column"}
        gap={5}
      >
        <GraphTwo />
        <GraphOne />
      </Box>
      <Box pos={"relative"} bottom={"0"} px={"50px"} mt={"50px"} w={"100%"}>
        <Footer />
      </Box>
    </Flex>
  );
}

export default Main;
