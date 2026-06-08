// GrammarInput.jsx
import React from "react";
import "./LL1ParserFromSamples.css";

// GrammarInput – User grammar aur input string type karega
export default function GrammarInput({ grammarInput, setGrammarInput, stringInput, setStringInput, onParse }) {
  return (
    <div className="grammar-input">
      <textarea
        rows="8"
        placeholder={`E -> T E'\nE' -> + T E' | ε\nT -> F T'\nT' -> * F T' | ε\nF -> G F'\nF' -> / F | ε\nG -> id | ( E )`}
        value={grammarInput}
        onChange={e => setGrammarInput(e.target.value)} // Grammar update
      />
      <input
        placeholder="id + id * id / id"
        value={stringInput}
        onChange={e => setStringInput(e.target.value)} // String update
      />
      <button onClick={onParse}>Parse</button> {/* Parse button */}
    </div>
  );
}
