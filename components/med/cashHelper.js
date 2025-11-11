// utils/cashHelper.js

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Явно экспортируемые функции
export const fetchCashRecords = async () => {
  try {
    console.log("Fetching cash records from:", `${API_BASE}/cashbox`);
    const response = await fetch(`${API_BASE}/cashbox`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched cash records:", data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error in fetchCashRecords:", error);
    return [];
  }
};

export const createCashboxRecord = async ({
  clientId,
  services = [],
  discount = 0,
  payment = "cash",
  benefits = "",
  debt = 0,
  doctorId = null,
}) => {
  try {
    const totalSum = services.reduce(
      (sum, s) => sum + (s.sum || s.price || 0),
      0
    );

    const cashboxData = {
      clientId: clientId.toString(),
      doctorId: doctorId || "1",
      sum: totalSum,
      discount: discount,
      payment: payment,
      analise: services.map((s) => s.name).join(", "),
      appeal: "Лабораторные анализы",
      benefits: benefits || "",
      debt: debt,
      status: debt > 0 ? 0 : 1,
      date: new Date().toISOString(),
    };

    console.log("Creating cashbox record:", cashboxData);

    const response = await fetch(`${API_BASE}/cashbox/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cashboxData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Ошибка создания записи в кассе");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in createCashboxRecord:", error);
    throw error;
  }
};

export const updateCashboxRecord = async (cashboxId, updates) => {
  try {
    const response = await fetch(`${API_BASE}/cashbox/${cashboxId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Ошибка обновления записи в кассе");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in updateCashboxRecord:", error);
    throw error;
  }
};

export const calculateDiscount = (sum, promo, benefit) => {
  let discount = 0;

  if (promo && promo.presentage) {
    discount += (sum * promo.presentage) / 100;
  }

  if (benefit && benefit.discount) {
    if (typeof benefit.discount === "number") {
      discount += benefit.discount;
    }
    if (benefit.percentage) {
      discount += (sum * benefit.percentage) / 100;
    }
  }

  return {
    finalSum: Math.max(0, sum - discount),
    discount: discount,
  };
};

// Альтернативный экспорт для обратной совместимости
const cashHelper = {
  fetchCashRecords,
  createCashboxRecord,
  updateCashboxRecord,
  calculateDiscount,
};

export default cashHelper;
