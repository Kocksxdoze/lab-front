import { Box, useToast } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";
import { getApiBaseUrl } from "../../utils/api";
import { createCashboxRecord, calculateDiscount } from "../med/cashHelper";
function Reg({
  services,
  clientId,
  onSuccess,
  promo = null,
  benefit = null,
  paymentMethod = "cash",
  initialDebt = 0,
}) {
  const toast = useToast();
  const hasCreated = useRef(false);
  const api = getApiBaseUrl();

  useEffect(() => {
    const createRecords = async () => {
      if (!clientId || !services || services.length === 0) return;
      if (hasCreated.current) return;

      hasCreated.current = true;

      try {
        // Шаг 1: Создаем записи анализов
        const labPromises = services.map(async (service) => {
          const endpoint = `${api}/lab/new`;
          const body = {
            name: service.name,
            clientId: clientId,
            price: service.sum,
            labId: service.id,
            analise: service.name,
          };

          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            throw new Error(`Ошибка создания анализа: ${service.name}`);
          }

          return await response.json();
        });

        const labResults = await Promise.all(labPromises);

        // Шаг 2: Рассчитываем скидки
        const totalSum = services.reduce((sum, s) => sum + (s.sum || 0), 0);
        const { finalSum, discount } = calculateDiscount(
          totalSum,
          promo,
          benefit
        );

        // Шаг 3: Создаем запись в кассе с использованием хелпера
        const benefitName = benefit ? benefit.name : "";
        const cashboxRecord = await createCashboxRecord({
          clientId: clientId,
          services: services,
          discount: discount,
          payment: paymentMethod,
          benefits: benefitName,
          debt: initialDebt,
        });

        toast({
          title: "Успешно",
          description: `Создано анализов: ${
            labResults.length
          }. Итоговая сумма: ${finalSum.toLocaleString()} сум`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        onSuccess?.(cashboxRecord);
      } catch (error) {
        console.error("Ошибка при создании записей:", error);
        toast({
          title: "Ошибка",
          description: error.message || "Не удалось сохранить данные",
          status: "error",
          duration: 5000,
          isClosable: true,
        });

        // Сбрасываем флаг при ошибке, чтобы можно было попробовать снова
        hasCreated.current = false;
      }
    };

    createRecords();
  }, [
    clientId,
    services,
    promo,
    benefit,
    paymentMethod,
    initialDebt,
    onSuccess,
    toast,
    api,
  ]);

  return <Box display="none" />;
}

export default Reg;
