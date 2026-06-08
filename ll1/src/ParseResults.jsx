// ParseResults.jsx
import React from "react";
import TreeNode from "./TreeNode";
import "./LL1ParserFromSamples.css";

// ParseResults – FIRST/FOLLOW sets, parse table aur tree display karega
export default function ParseResults({ firstSets, followSets, parseTable, parseTree, matched, error }) {

  // Terminals extract kar rahe table display ke liye
  const terminals = Array.from(
    new Set(Object.values(parseTable).flatMap(r => Object.keys(r)))
  );

  if (error) return <div className="error">{error}</div>; // Agar error ho to show karo

  return (
    <div className="results">
      <h2>FIRST Sets</h2>
      {Object.entries(firstSets).map(([k, v]) => (
        <div key={k}><b>{k}:</b> {[...v].join(", ")}</div>
      ))}

      <h2>FOLLOW Sets</h2>
      {Object.entries(followSets).map(([k, v]) => (
        <div key={k}><b>{k}:</b> {[...v].join(", ")}</div>
      ))}

      <h2>Parse Table</h2>
      <table className="parse-table">
        <thead>
          <tr>
            <th>NT</th>
            {terminals.map(t => <th key={t}>{t}</th>)}
          </tr>
        </thead>
        <tbody>
          {Object.keys(parseTable).map(nt => (
            <tr key={nt}>
              <td><b>{nt}</b></td>
              {terminals.map(t => (
                <td key={t}>{parseTable[nt][t] ? parseTable[nt][t].join(" ") : ""}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Parse Tree</h2>
      <div className="tree-container">
        <TreeNode node={parseTree} />
      </div>

      {matched && (
        <div className="matched-output">
          ✔ Matched String: <b>{matched}</b>
        </div>
      )}
    </div>
  );
}
