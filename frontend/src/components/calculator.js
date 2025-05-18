import React, { useState, useRef, useEffect } from "react";
import { evaluateExpression } from "../services/api";
import "./calculator.css";
import BackgroundImage from "../assets/calciRobo.png";

// Binary tree layout without arrows
export const TreeNode = ({ node }) => {
  if (!node) return null;
  return (
    <div className="tree-binary-node-wrapper">
      <div className="tree-binary-node">
        <div className="tree-content-binary">
          <span className="tree-value">{node.value}</span>
          {node.type && <span className="tree-type">{node.type}</span>}
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="tree-binary-children-wrapper">
          <div className="tree-binary-children">
            {node.children.map((child, idx) => (
              <div className="tree-binary-child" key={idx}>
                <TreeNode node={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const BUTTONS = [
  ["7", "8", "9", "/", "DEL"],
  ["4", "5", "6", "*", "("],
  ["1", "2", "3", "-", ")"],
  ["0", ".", "C", "+", "="]
];

const Calculator = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [parseTree, setParseTree] = useState(null);

  const handleButtonClick = (val) => {
    if (val === "C") {
      setInput("");
      setResult("");
      setParseTree(null);
      return;
    }
    if (val === "DEL") {
      setInput((prev) => prev.slice(0, -1));
      return;
    }
    if (val === "=") {
      handleSubmit();
      return;
    }
    setInput((prev) => prev + val);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      const response = await evaluateExpression(input);
      const newResult = response.result || response.error;
      setResult(newResult);
      setHistory(prev => [...prev, { expression: input, result: newResult }]);
      if (response.parseTree) {
        setParseTree(response.parseTree);
      }
    } catch (error) {
      setResult("Error: Could not evaluate expression");
      setParseTree(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace') {
      setInput((prev) => prev.slice(0, -1));
    } else if (e.key === 'Delete') {
      setInput("");
    } else if (e.key === 'Escape') {
      setInput("");
      setResult("");
      setParseTree(null);
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="page-background">
      <img src={BackgroundImage} alt="Calci Robo" className="background-bot-image" />
      <h1 className="main-heading">Compiler Calci</h1>
      <div className="split-layout">
        <div className="left-pane">
          <div className="calculator-container">
            <div className="calculator-content">
              <form onSubmit={handleSubmit} className="calculator-form" autoComplete="off">
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Enter expression (e.g., 2 + 2)"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onKeyDown={handleKeyDown}
                    className="calculator-input"
                  />
                  <button 
                    type="submit" 
                    className={`calc-button ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Calculating...' : 'Evaluate'}
                  </button>
                </div>
              </form>
              <div className="button-grid">
                {BUTTONS.map((row, i) => (
                  <div className="button-row" key={i}>
                    {row.map((btn) => (
                      <button
                        key={btn}
                        className={`calc-btn calc-btn-${btn}`}
                        onClick={() => handleButtonClick(btn)}
                        tabIndex={btn === '=' ? 0 : -1}
                        type="button"
                      >
                        {btn}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
              {result && (
                <div className="result-container">
                  <div className="result">
                    <span className="result-label">Result:</span>
                    <span className="result-value">{result}</span>
                  </div>
                </div>
              )}
              {history.length > 0 && (
                <div className="history-container">
                  <div className="history-header">
                    <h3>History</h3>
                    <button onClick={clearHistory} className="clear-history">Clear</button>
                  </div>
                  <div className="history-list">
                    {history.map((item, index) => (
                      <div key={index} className="history-item">
                        <span className="expression">{item.expression}</span>
                        <span className="equals">=</span>
                        <span className="history-result">{item.result}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="right-pane">
          <div className="parse-tree-vertical-container">
            <h2>Parse Tree</h2>
            <div className="parse-tree-binary tree-binary-scroll">
              {parseTree ? <TreeNode node={parseTree} /> : <div className="parse-tree-placeholder">No parse tree to display.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
