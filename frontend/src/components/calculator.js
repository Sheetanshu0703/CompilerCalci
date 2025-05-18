import React, { useState } from "react";
import { evaluateExpression } from "../services/api";
import "./calculator.css";
import BackgroundImage from "../assets/calciRobo.png"; // Adjust the path as needed

const Calculator = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await evaluateExpression(input);
    setResult(response.result || response.error);
  };

  return (
    <div className="calculator-container">
      <img src={BackgroundImage} alt="Calculator Bot" className="calculator-background" />
      
      <h1>Simple Calculator</h1>
      
      <form onSubmit={handleSubmit} className="calculator-form">
        <input
          type="text"
          placeholder="Enter expression"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="calculator-input"
        />
        <button type="submit" className="calc-button">
          Evaluate
        </button>
      </form>
      
      {result && (
        <div className="result">
          Result: <span>{result}</span>
        </div>
      )}
    </div>
  );
};

export default Calculator;
