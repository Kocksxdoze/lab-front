"use client";
import React from "react";
import Header from "../../../components/med/header";
import Footer from "../../../components/med/footer";
import ParticlesComponent from "../../../components/med/particles";
import { Flex, Box } from "@chakra-ui/react";
import ReportCreatePage from "../../../components/med/rep";

function DiagnosticPage() {
  return (
    <>
      <Flex flexDir={"column"} pos={"absolute"} w={"100%"}>
        <Box zIndex="999" pos={"relative"} px={"50px"}>
          <Header />
        </Box>
        <Box
          position="relative"
          w="full"
          h="100%"
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
            <ReportCreatePage />
          </Box>
        </Box>
        <Box pos={"relative"} bottom={"0"} px={"50px"} mt={"50px"} w={"100%"}>
          <Footer />
        </Box>
      </Flex>
    </>
  );
}

export default DiagnosticPage;
