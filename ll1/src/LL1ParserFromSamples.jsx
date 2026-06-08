import React, { useState } from "react"; // React aur useState hook import kar rahe hain
import "./LL1ParserFromSamples.css"; // CSS file import kar rahe hain

/* ---------------- Tree Node ---------------- */
const TreeNode = ({ node }) => { // TreeNode component jo parse tree ka ek node show karega
  if (!node) return null; // Agar node null ho to kuch render mat karo

  return (
    <div className="tree-node"> {/* Node ka container */}
      <div className="node-label">{node.name}</div> {/* Node ka label dikhaye */}
      {node.children.length > 0 && ( // Agar children hain to unko render karo
        <div className="node-children">
          {node.children.map((child, i) => ( // Har child ke liye recursive TreeNode
            <TreeNode key={i} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------------- Main Component ---------------- */
export default function LL1Parser() { // Main LL1 Parser Component
  const [grammarInput, setGrammarInput] = useState(""); // Grammar ka input
  const [stringInput, setStringInput] = useState(""); // String jo parse karni hai
  const [firstSets, setFirstSets] = useState({}); // FIRST sets store karne ke liye
  const [followSets, setFollowSets] = useState({}); // FOLLOW sets store karne ke liye
  const [parseTable, setParseTable] = useState({}); // Parse table store karne ke liye
  const [parseTree, setParseTree] = useState(null); // Parse tree store karne ke liye
  const [matched, setMatched] = useState(""); // Matched string display karne ke liye
  const [error, setError] = useState(""); // Errors show karne ke liye

  const parseGrammar = () => { // Jab user Parse button press kare
    setError(""); // Pehle error clear karo
    setParseTree(null); // Tree clear karo
    setMatched(""); // Matched string clear karo

    // ---------- Parse Grammar ----------
    const rules = {}; // Grammar rules store karne ke liye
    grammarInput.split("\n").forEach(line => { // Har line ke liye
      if (!line.trim()) return; // Agar line empty ho to skip karo
      const [lhs, rhs] = line.split("->").map(s => s.trim()); // Split LHS aur RHS
      if (!lhs || !rhs) return; // Agar LHS ya RHS missing ho to skip
      rules[lhs] = rhs.split("|").map(p => p.trim().split(/\s+/)); // RHS ko split karke array bana lo
    });

    // ---------- Left Recursion Check ----------
    for (let nt in rules) { // Har non-terminal ke liye
      for (let prod of rules[nt]) { // Har production ke liye
        if (prod[0] === nt) { // Agar left recursion ho to error
          setError(`❌ Grammar has LEFT RECURSION at ${nt}. LL(1) not possible.`);
          return;
        }
      }
    }

    // ---------- Left Factoring Check ----------
    const lfError = hasLeftFactoring(rules); // Check left factoring
    if (lfError) { // Agar left factoring hai to error
      setError("❌ " + lfError + ". LL(1) not possible.");
      return;
    }

    // ---------- FIRST / FOLLOW / Parse Table ----------
    const first = computeFirst(rules); // FIRST set calculate karo
    const follow = computeFollow(rules, first); // FOLLOW set calculate karo
    const table = buildParseTable(rules, first, follow); // Parse table build karo

    const result = parseString(stringInput, rules, table); // String parse karo

    if (result.error) { // Agar parse error ho
      setError(result.error); 
      setParseTree(result.tree); // Partial tree show karo
    } else { // Agar parse successful ho
      setFirstSets(first); // FIRST sets save karo
      setFollowSets(follow); // FOLLOW sets save karo
      setParseTable(table); // Parse table save karo
      setParseTree(result.tree); // Complete tree save karo
      setMatched(result.matched); // Matched string save karo
    }
  };

  // Terminals for table display
  const terminals = Array.from(
    new Set(Object.values(parseTable).flatMap(r => Object.keys(r))) // Sab unique terminals
  );

  return (
    <div className="parser-container"> {/* Parser container */}
      <h1>LL(1) Parser</h1>

      <textarea
        rows="8"
        placeholder={`E -> T E'\nE' -> + T E' | ε\nT -> F T'\nT' -> * F T' | ε\nF -> G F'\nF' -> / F | ε\nG -> id | ( E )`} // Example grammar
        value={grammarInput}
        onChange={e => setGrammarInput(e.target.value)} // Grammar update karne ke liye
      />

      <input
        placeholder="id + id * id / id" // Example input string
        value={stringInput}
        onChange={e => setStringInput(e.target.value)} // Input string update karne ke liye
      />

      <button onClick={parseGrammar}>Parse</button> {/* Parse button */}

      {error && <div className="error">{error}</div>} {/* Agar error hai to show karo */}

      {!error && parseTree && ( // Agar tree hai to show karo
        <>
          <h2>FIRST Sets</h2>
          {Object.entries(firstSets).map(([k, v]) => (
            <div key={k}><b>{k}:</b> {[...v].join(", ")}</div> // FIRST sets show karo
          ))}

          <h2>FOLLOW Sets</h2>
          {Object.entries(followSets).map(([k, v]) => (
            <div key={k}><b>{k}:</b> {[...v].join(", ")}</div> // FOLLOW sets show karo
          ))}

          <h2>Parse Table</h2>
          <table className="parse-table">
            <thead>
              <tr>
                <th>NT</th>
                {terminals.map(t => <th key={t}>{t}</th>)} {/* Table ke columns */}
              </tr>
            </thead>
            <tbody>
              {Object.keys(parseTable).map(nt => ( // Table ke rows
                <tr key={nt}>
                  <td><b>{nt}</b></td>
                  {terminals.map(t => ( // Table ke cells
                    <td key={t}>{parseTable[nt][t] ? parseTable[nt][t].join(" ") : ""}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Parse Tree</h2>
          <div className="tree-container">
            <TreeNode node={parseTree} /> {/* Parse tree show kar rahe */}
          </div>

          {matched && ( // Matched string show kar rahe
            <div className="matched-output">
              ✔ Matched String: <b>{matched}</b>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------- Helper Functions ---------------- */

// Left Factoring Check
function hasLeftFactoring(rules) { 
  for (let nt in rules) { // Har non-terminal ke liye
    const prefixes = {}; 
    for (let prod of rules[nt]) { // Har production ke liye
      const firstSym = prod[0]; 
      if (prefixes[firstSym]) return `Grammar has LEFT FACTORING in ${nt}`; // Agar same prefix ho to error
      prefixes[firstSym] = true;
    }
  }
  return null; // Agar left factoring nahi hai to null return karo
}

// Compute FIRST sets (as Set)
function computeFirst(rules) {
  const first = {}; 
  for (let nt in rules) first[nt] = new Set(); // Initialize FIRST set

  let changed = true; 
  while (changed) { 
    changed = false;
    for (let nt in rules) {
      for (let prod of rules[nt]) { 
        let nullable = true; 
        for (let sym of prod) { 
          const size = first[nt].size;

          if (rules[sym]) { // Agar non-terminal hai
            first[sym].forEach(f => { if (f !== "ε") first[nt].add(f); }); 
            if (!first[sym].has("ε")) nullable = false;
          } else { // Agar terminal hai
            first[nt].add(sym); 
            nullable = false;
          }

          if (first[nt].size > size) changed = true;
          if (!nullable) break;
        }
        if (nullable) first[nt].add("ε"); // Agar nullable ho to epsilon add karo
      }
    }
  }

  return first;
}

// Compute FOLLOW sets (as Set)
function computeFollow(rules, first) {
  const follow = {}; 
  for (let nt in rules) follow[nt] = new Set(); // Initialize FOLLOW set
  const start = Object.keys(rules)[0]; // Start symbol
  follow[start].add("$"); // EOF symbol

  let changed = true;
  while (changed) { 
    changed = false;
    for (let nt in rules) {
      for (let prod of rules[nt]) { 
        for (let i = 0; i < prod.length; i++) {
          const sym = prod[i]; 
          if (!rules[sym]) continue; 

          const rest = prod.slice(i + 1); 
          const size = follow[sym].size;

          if (rest.length === 0) { 
            follow[nt].forEach(f => follow[sym].add(f)); 
          } else { 
            let nullable = true;
            for (let r of rest) { 
              if (rules[r]) { 
                first[r].forEach(f => f !== "ε" && follow[sym].add(f)); 
                if (!first[r].has("ε")) { nullable = false; break; }
              } else { 
                follow[sym].add(r); 
                nullable = false;
                break;
              }
            }
            if (nullable) follow[nt].forEach(f => follow[sym].add(f));
          }
          if (follow[sym].size > size) changed = true;
        }
      }
    }
  }

  return follow;
}

// Build Parse Table
function buildParseTable(rules, first, follow) {
  const table = {};
  for (let nt in rules) table[nt] = {}; // Initialize table

  for (let nt in rules) { 
    for (let prod of rules[nt]) { 
      let prodFirst = new Set(); 
      let nullable = true;

      for (let sym of prod) { 
        if (rules[sym]) { 
          first[sym].forEach(f => { if (f !== "ε") prodFirst.add(f); }); 
          if (!first[sym].has("ε")) { nullable = false; break; }
        } else { 
          prodFirst.add(sym); 
          nullable = false; 
          break; 
        }
      }

      prodFirst.forEach(t => table[nt][t] = prod); // FIRST terminals add karo

      if (nullable || prod.includes("ε")) { 
        follow[nt].forEach(t => { if (!table[nt][t]) table[nt][t] = prod; }); // FOLLOW terminals add karo agar epsilon
      }
    }
  }

  return table;
}

// Parse string using table
function parseString(input, rules, table) { 
  const tokens = (input.match(/id|\+|\-|\*|\/|\(|\)/g) || []).concat("$"); // Tokens split karo aur $ add karo
  const stack = ["$", Object.keys(rules)[0]]; // Stack initialize karo
  const root = { name: stack[1], children: [] }; // Root node
  const nodeStack = [root]; // Node stack

  let ptr = 0, idCount = 0; 
  const matched = [];

  while (stack.length) { 
    const top = stack.pop(); 
    const node = nodeStack.pop(); 
    const curr = tokens[ptr]; 

    if (!rules[top]) { // Agar terminal hai
      if (top !== curr) { // Agar match nahi ho to error
        return { 
          error: `❌ Parsing error at token ${ptr + 1} ('${curr}'): expected '${top}'`, 
          tree: root 
        };
      }
      if (top === "id") { 
        idCount++; 
        node.name = `id${idCount}`; 
        matched.push(`id${idCount}`); 
      } else matched.push(top); 
      ptr++; 
    } else { // Agar non-terminal hai
      const prod = table[top][curr]; 
      if (!prod) { // Agar table me entry nahi hai
        const expected = Object.keys(table[top] || {}).join(", "); 
        return { 
          error: `❌ No rule for '${top}' with token '${curr}'. Expected one of: ${expected}`, 
          tree: root 
        };
      }
      [...prod].reverse().forEach(s => { // Production ko stack me push karo
        if (s !== "ε") { 
          stack.push(s); 
          const child = { name: s, children: [] }; 
          node.children.push(child); 
          nodeStack.push(child); 
        }
      });
    }
  }

  return { tree: root, matched: matched.join(" ") }; // Final tree aur matched string return karo
}
