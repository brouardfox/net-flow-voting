import React, { useState, useEffect } from "react";

export default function NetFlowVotingApp() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [showResults, setShowResults] = useState(false);
  const version = "1.1.1";

  useEffect(() => {
    if (items.length > 1) {
      setShowResults(false);
    }
  }, [items]);

  const addItem = () => {
    if (newItem.trim() !== "") {
      setItems([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const restartVoting = () => {
    setItems([]);
    setShowResults(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Net Flow Voting</h1>
      <p className="text-sm text-gray-500">Version: {version}</p>
      <div className="mb-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="border p-2 mr-2"
          placeholder="Enter an item"
        />
        <button onClick={addItem} className="bg-blue-500 text-white px-4 py-2 rounded">Add Item</button>
      </div>
      {showResults && (
        <button onClick={restartVoting} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">Restart</button>
      )}
    </div>
  );
}
