import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

export const evaluateExpression = async (expression) => {
  try {
    const response = await api.post("/evaluate", { expression });
    return response.data;
  } catch (error) {
    console.error("Error evaluating expression:", error);
    return { error: "Unable to evaluate expression." };
  }
};
