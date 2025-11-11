"use client";
import React from "react";
import { Box, Text, Flex } from "@chakra-ui/react";

function Footer() {
  return (
    <>
      <Flex
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
        w={"100%"}
        h={"90px"}
        bg={"#fff"}
        borderTopRadius={"16px"}
        shadow={"2xl"}
        zIndex={"999"}
      >
        <Box>
          <Text>Все права защищены.</Text>
        </Box>
      </Flex>
    </>
  );
}

export default Footer;
