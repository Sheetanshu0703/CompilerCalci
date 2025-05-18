import React, { useState } from "react";
import { evaluateExpression } from "../services/api";

const Calculator = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await evaluateExpression(input);
    setResult(response.result || response.error);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl mb-4">Simple Calculator</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter expression"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Evaluate
        </button>
      </form>
      {result && (
        <div className="mt-4 text-lg">
          Result: <span className="font-bold">{result}</span>
        </div>
      )}
    </div>
  );
};

export default Calculator;
