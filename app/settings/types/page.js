"use client";
import React from "react";
import Header from "../../../components/med/header";
import Footer from "../../../components/med/footer";
import { Flex, Box } from "@chakra-ui/react";
import AppTypes from "../../../components/med/types";
import dynamic from "next/dynamic";
const ParticlesComponent = dynamic(
  () => import("../../../components/med/particles"),
  { ssr: false }
);

function AppTypesPage() {
  return (
    <>
      <Flex flexDir={"column"} pos={"absolute"} w={"100%"}>
        <Box zIndex="999" pos={"relative"} px={"50px"}>
          <Header />
        </Box>
        <Box
          position="relative"
          w="full"
          h="100vh"
          display="flex"
          bgGradient="linear(to-b, black, white)"
          mt={10}
        >
          <ParticlesComponent />
          <Box
            zIndex={"990"}
            w={"100%"}
            px={"50px"}
            display={"flex"}
            justifyContent={"center"}
          >
            <AppTypes />
          </Box>
        </Box>
        <Box pos={"relative"} bottom={"0"} px={"50px"} mt={"50px"} w={"100%"}>
          <Footer />
        </Box>
      </Flex>
    </>
  );
}

export default AppTypesPage;
