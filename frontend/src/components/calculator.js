import React, { useState, useRef, useEffect } from "react";
import { evaluateExpression } from "../services/api";
import "./calculator.css";
import BackgroundImage from "../assets/calciRobo.png";

// Binary tree layout with arrows and calculation order
export const TreeNode = ({ node, stepNumber = 1, totalSteps = 1 }) => {
  if (!node) return null;

  const getOperationDescription = (operator) => {
    switch (operator) {
      case '+': return 'Addition';
      case '-': return 'Subtraction';
      case '*': return 'Multiplication';
      case '/': return 'Division';
      default: return '';
    }
  };

  const isOperator = node.type === 'operator';
  const operationDesc = isOperator ? getOperationDescription(node.value) : '';

  return (
    <div className="tree-binary-node-wrapper">
      <div className="tree-binary-node">
        <div className="tree-content-binary">
          <span className="tree-value">{node.value}</span>
          {node.type && <span className="tree-type">{node.type}</span>}
          {isOperator && (
            <div className="calculation-step">
              <span className="step-number">Step {stepNumber}</span>
              <span className="step-description">{operationDesc}</span>
            </div>
          )}
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="tree-binary-children-wrapper">
          <div className="tree-binary-children">
            {node.children.map((child, idx) => (
              <div className="tree-binary-child" key={idx}>
                <div className="calculation-arrow">
                  <div className="arrow-line"></div>
                  <div className="arrow-head"></div>
                </div>
                <TreeNode 
                  node={child} 
                  stepNumber={isOperator ? stepNumber + 1 : stepNumber}
                  totalSteps={totalSteps}
                />
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
  const [tokens, setTokens] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleButtonClick = (val) => {
    if (val === "C") {
      setInput("");
      setResult("");
      setParseTree(null);
      setTokens([]);
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
      if (response.error) {
        setResult(`Error: ${response.error}`);
        setParseTree(null);
        setTokens([]);
      } else {
        const newResult = response.result;
        setResult(newResult);
        setHistory(prev => [...prev, { expression: input, result: newResult }]);
        if (response.parseTree) {
          setParseTree(response.parseTree);
        } else {
          setParseTree(null);
        }
        if (response.tokens) {
          setTokens(response.tokens);
        } else {
          setTokens([]);
        }
      }
    } catch (error) {
      setResult("Error: Could not evaluate expression");
      setParseTree(null);
      setTokens([]);
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
      <div className="heading-row">
        <img src={BackgroundImage} alt="Calci Robo" className="bot-heading-image" />
        <div className="heading-text-block">
          <h1 className="main-heading">Compiler Calci</h1>
          <div className="main-description">Your personal compiler calculator.</div>
        </div>
      </div>
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
            <h2>Parse Tree & Calculation Steps</h2>
            <div className="parse-tree-info">
              <p>This visualization shows how the compiler:</p>
              <ol>
                <li>Parses your expression into a tree structure</li>
                <li>Determines the order of operations</li>
                <li>Evaluates the expression step by step</li>
              </ol>
            </div>
            <div className="parse-tree-binary tree-binary-scroll">
              {parseTree ? (
                <div className="parse-tree-visualization">
                  <TreeNode node={parseTree} />
                  <div className="compiler-steps">
                    <h3>Compiler Design Concepts Demonstrated:</h3>
                    <ul>
                      <li>Lexical Analysis (Token Generation)</li>
                      <li>Syntax Analysis (Parse Tree Construction)</li>
                      <li>Semantic Analysis (Type Checking)</li>
                      <li>Intermediate Code Generation</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="parse-tree-placeholder">
                  <p>Enter an expression to see the parse tree and calculation steps.</p>
                  <p>Example: (2 + 3) * 4</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {tokens.length > 0 && (
        <div className="token-table-container-bottom">
          <h3>Token Table</h3>
          <div className="token-table">
            <table>
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token, index) => (
                  <tr key={index}>
                    <td>{token.value}</td>
                    <td>{token.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showScrollTop && (
        <button 
          className="scroll-to-top"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default Calculator;
