"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  Collapse,
  HStack,
  Select,
  Heading,
} from "@chakra-ui/react";
import fetcher from "../../utils/fetcher";

const Registration = ({ onSelectOffer, type = "service" }) => {
  const [categories, setCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Определяем конечные точки API в зависимости от типа
  const getApiEndpoints = () => {
    switch (type) {
      case "lab":
        return {
          categories: "lab-categories",
          items: "labs",
        };
      case "dia":
        return {
          categories: "dia-categories",
          items: "dias",
        };
      case "service":
      default:
        return {
          categories: "categories",
          subcategories: "sub",
          items: "offers",
        };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoints = getApiEndpoints();

        if (type === "service") {
          // Для услуг: категории -> подкатегории -> предложения
          const mainCategories = await fetcher(endpoints.categories);

          const categoriesWithData = await Promise.all(
            mainCategories.map(async (category) => {
              const subcategories = await fetcher(
                `${endpoints.categories}/${category.id}/${endpoints.subcategories}`
              );

              const subcategoriesWithOffers = await Promise.all(
                subcategories.map(async (sub) => {
                  const offers = await fetcher(
                    `${endpoints.categories}/${category.id}/${endpoints.subcategories}/${sub.id}/${endpoints.items}`
                  );
                  return { ...sub, offers };
                })
              );

              return { ...category, subcategories: subcategoriesWithOffers };
            })
          );

          setCategories(categoriesWithData);
        } else {
          // Для лабораторий и диагностики: категории -> анализы/исследования
          const mainCategories = await fetcher(endpoints.categories);

          const categoriesWithItems = await Promise.all(
            mainCategories.map(async (category) => {
              const items = await fetcher(
                `${endpoints.categories}/${category.id}/${endpoints.items}`
              );
              return { ...category, items };
            })
          );

          setCategories(categoriesWithItems);
        }
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  const toggleCategory = (id) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  const handleSelectItem = (item) => {
    // Формируем объект предложения в зависимости от типа
    const offer = {
      ...item,
      type, // Добавляем тип (service/lab/dia)
      doctorId: item.doctorId,
      doctorName: item.doctorName,
    };

    if (type === "lab") {
      offer.name = item.name || "Лабораторный анализ";
      offer.price = item.price || item.sum;
      offer.about = item.about || "Лабораторное исследование";
      offer.analise = item.about || "Лабораторное исследование";
    } else if (type === "dia") {
      offer.name = item.name || "Диагностическая процедура";
      offer.price = item.price || item.sum;
      offer.about = item.about || "Диагностическое исследование";
      offer.analise = item.about || "Диагностическое исследование";
    }

    onSelectOffer(offer);
  };

  if (loading) return <Text>Загрузка...</Text>;
  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <Box my={6} w="100%">
      <Heading size="md" mb={4} textAlign="center">
        {type === "lab" && "Лабораторные анализы"}
        {type === "dia" && "Диагностические исследования"}
        {type === "service" && "Медицинские услуги"}
      </Heading>

      <VStack spacing={4} align="stretch">
        {categories.length === 0 && (
          <Text textAlign="center" color="gray.500">
            Нет доступных категорий
          </Text>
        )}

        {categories.map((category) => (
          <Box key={category.id} w="100%">
            <Button
              w="100%"
              onClick={() => toggleCategory(category.id)}
              color="#000"
              border="1px solid #000"
              fontWeight="400"
              fontSize="20px"
              variant="ghost"
              _hover={{
                color: "#fff",
                background: "#0052b4",
                border: "1px solid transparent",
              }}
            >
              {category.name || category.categoryName}
            </Button>

            <Collapse in={expandedCategory === category.id} animateOpacity>
              <VStack align="start" pl={5} mt={2} spacing={3}>
                {type === "service"
                  ? // Рендеринг для услуг (с подкатегориями)
                    category.subcategories?.map((sub) => (
                      <Box key={sub.id} w="100%">
                        <Text fontWeight="500" mb={2}>
                          {sub.name}
                        </Text>

                        <VStack align="start" pl={3} spacing={2}>
                          {sub.offers?.map((offer) => (
                            <OfferItem
                              key={offer.id}
                              item={offer}
                              onSelect={handleSelectItem}
                            />
                          ))}
                        </VStack>
                      </Box>
                    ))
                  : // Рендеринг для лабораторий и диагностики (без подкатегорий)
                    category.items?.map((item) => (
                      <OfferItem
                        key={item.id}
                        item={item}
                        onSelect={handleSelectItem}
                      />
                    ))}
              </VStack>
            </Collapse>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

// Компонент для отображения элемента предложения
const OfferItem = ({ item, onSelect }) => {
  return (
    <HStack
      spacing={4}
      w="100%"
      justify="space-between"
      p={2}
      _hover={{ bg: "gray.50" }}
    >
      <Box flex={1}>
        <Text fontSize="17px" fontWeight="500">
          {item.name}
        </Text>
        {item.about && (
          <Text fontSize="14px" color="gray.600">
            {item.about}
          </Text>
        )}
        <Text fontSize="16px" fontWeight="600">
          {item.price || item.sum} сум
        </Text>
        {item.doctorName && (
          <Text fontSize="14px">Врач: {item.doctorName}</Text>
        )}
      </Box>
      <Button size="sm" colorScheme="blue" onClick={() => onSelect(item)}>
        Выбрать
      </Button>
    </HStack>
  );
};

export default Registration;
