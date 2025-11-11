"use client";
import React, { useState, useEffect } from "react";
import ParticlesComponent from "../../components/med/particles";
import Header from "../../components/med/header";
import Footer from "../../components/med/footer";
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
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  Badge,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import axios from "axios";
import { getApiBaseUrl } from "../../utils/api";
function OffersReports() {
  const [labCategory, setLabCategory] = useState(null);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();
  const api = getApiBaseUrl();
  const fetchLabReports = async () => {
    try {
      setLoading(true);

      const categoriesResponse = await axios.get(`${api}/reports`);
      const allCategories = categoriesResponse.data;

      const labCategory = allCategories.find((cat) =>
        cat.name.toLowerCase().includes("услугам")
      );

      if (!labCategory) {
        toast({
          title: "Категория услуг не найдена",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setLabCategory(labCategory);

      const reportsResponse = await axios.get(
        `${api}/report/${labCategory.id}`
      );
      const labReports = reportsResponse.data?.reportsTo || [];

      setReports(labReports);
      setFilteredReports(labReports);
    } catch (error) {
      toast({
        title: "Ошибка загрузки данных",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Error fetching lab reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabReports();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredReports(reports);
      return;
    }

    const filtered = reports.filter(
      (report) =>
        (report.name &&
          report.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.desc &&
          report.desc.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredReports(filtered);
  }, [searchTerm, reports]);

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const renderHtmlContent = (html) => {
    if (!html) return null;

    // Удаляем лишние теги и атрибуты для безопасного отображения
    const sanitizedHtml = html
      .replace(/<table/g, '<div class="table-container"><table')
      .replace(/<\/table>/g, "</table></div>")
      .replace(/style="[^"]*"/g, "")
      .replace(/<colgroup>.*?<\/colgroup>/gs, "");

    return (
      <Box
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        sx={{
          ".table-container": {
            overflowX: "auto",
            margin: "1rem 0",
          },
          table: {
            borderCollapse: "collapse",
            width: "100%",
            margin: "0.5rem 0",
          },
          "th, td": {
            border: "1px solid #e2e8f0",
            padding: "0.75rem",
            textAlign: "left",
          },
          th: {
            backgroundColor: "#f7fafc",
            fontWeight: "bold",
          },
          "tr:nth-of-type(even)": {
            backgroundColor: "#f8f9fa",
          },
        }}
      />
    );
  };

  const renderTablePreview = (content) => {
    if (!content) return <Text color="gray.500">Нет данных</Text>;

    if (content.includes("<table") || content.includes("<p")) {
      return (
        <Box maxW="100%" overflow="hidden">
          <Text color="blue.500" fontWeight="medium">
            [Таблица данных - нажмите для просмотра]
          </Text>
        </Box>
      );
    }

    return (
      <Text noOfLines={2} whiteSpace="pre-wrap">
        {content.length > 100 ? `${content.substring(0, 100)}...` : content}
      </Text>
    );
  };

  return (
    <>
      <Flex flexDir={"column"} pos={"absolute"} w={"100%"}>
        <Box zIndex="999" pos={"relative"} px={"50px"}>
          <Header />
        </Box>
        <Box
          position="relative"
          w="full"
          minH="100vh"
          display="flex"
          bgGradient="linear(to-b, black, white)"
          mt={10}
        >
          <ParticlesComponent />
          <Box
            zIndex={"900"}
            w={"100%"}
            px={"50px"}
            display={"flex"}
            justifyContent={"flex-start"}
            py={8}
          >
            <Box
              p={6}
              borderRadius="16px"
              w="100%"
              maxW="auto"
              bg="#fff"
              boxShadow="md"
            >
              {loading ? (
                <Text>Загрузка Отчетов...</Text>
              ) : labCategory ? (
                <>
                  <Flex align="center" mb={6}>
                    <Text fontSize="2xl" fontWeight="bold" mr={4}>
                      {labCategory.name}
                    </Text>
                    <Badge colorScheme="blue" fontSize="lg">
                      {reports.length} отчётов
                    </Badge>
                  </Flex>

                  <InputGroup mb={6}>
                    <Input
                      placeholder="Поиск по названию или описанию"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      pr="4.5rem"
                      size="lg"
                      focusBorderColor="blue.500"
                    />
                    <InputRightElement>
                      <SearchIcon color="gray.500" />
                    </InputRightElement>
                  </InputGroup>

                  <TableContainer
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    overflowX="auto"
                  >
                    <Table variant="striped" size="md">
                      <Thead bg="blue.500">
                        <Tr>
                          <Th color="white">ID</Th>
                          <Th color="white">Название</Th>
                          <Th color="white">Содержимое</Th>
                          <Th color="white">Действия</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredReports.length > 0 ? (
                          filteredReports.map((report) => (
                            <Tr key={report.id} _hover={{ bg: "gray.50" }}>
                              <Td fontWeight="bold">{report.id}</Td>
                              <Td fontWeight="medium">
                                {report.name || "Без названия"}
                              </Td>
                              <Td maxW="300px" overflow="hidden">
                                {renderTablePreview(
                                  report.desc || report.content
                                )}
                              </Td>
                              <Td>
                                <Button
                                  size="sm"
                                  colorScheme="blue"
                                  onClick={() => handleReportClick(report)}
                                >
                                  Подробнее
                                </Button>
                              </Td>
                            </Tr>
                          ))
                        ) : (
                          <Tr>
                            <Td colSpan={4} textAlign="center" py={8}>
                              <Alert status="info" borderRadius="md">
                                <AlertIcon />
                                {searchTerm
                                  ? "Ничего не найдено по вашему запросу"
                                  : "Нет доступных отчетов"}
                              </Alert>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  Категория не найдена
                </Alert>
              )}
            </Box>
          </Box>
        </Box>
        <Box pos={"relative"} bottom={"0"} px={"50px"} mt={"50px"} w={"100%"}>
          <Footer />
        </Box>
      </Flex>

      {/* Модальное окно для просмотра отчёта */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="6xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent maxW="90vw" maxH="90vh">
          <ModalHeader fontSize="xl" bg="blue.500" color="white">
            {selectedReport?.name || "Отчёт"}
            <ModalCloseButton color="white" />
          </ModalHeader>
          <ModalBody p={6} overflow="auto">
            {selectedReport && (
              <Box>
                {selectedReport.desc && (
                  <Text mb={4} fontSize="lg" fontWeight="medium">
                    Название: {selectedReport.name}
                  </Text>
                )}
                <Box
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  p={4}
                  overflow="auto"
                >
                  {renderHtmlContent(
                    selectedReport.content || selectedReport.desc
                  )}
                </Box>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default OffersReports;
