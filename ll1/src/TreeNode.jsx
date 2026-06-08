// TreeNode.jsx
import React from "react";
import "./LL1ParserFromSamples.css";

// TreeNode component – ek node aur uske children display karega
const TreeNode = ({ node }) => {
  if (!node) return null; // Agar node null ho to kuch render na karo

  return (
    <div className="tree-node">
      <div className="node-label">{node.name}</div> {/* Node ka label */}
      {node.children.length > 0 && (
        <div className="node-children">
          {node.children.map((child, i) => (
            <TreeNode key={i} node={child} /> // Recursive call for children
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
