import React, { useState, useEffect } from "react";

export default function NetFlowVotingApp() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [pairwiseComparisons, setPairwiseComparisons] = useState([]);
  const [preferenceMatrix, setPreferenceMatrix] = useState({});
  const [currentPair, setCurrentPair] = useState(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (items.length > 1) {
      generatePairwiseComparisons();
    }
  }, [items]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').then(() => {
        console.log("Service Worker Registered");
      });
    }
  }, []);

  const addItem = () => {
    if (newItem.trim() !== "") {
      setItems([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const generatePairwiseComparisons = () => {
    let comparisons = [];
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        comparisons.push([items[i], items[j]]);
      }
    }
    setPairwiseComparisons(comparisons);
    setCurrentPair(comparisons.length > 0 ? comparisons[0] : null);
  };

  const recordPreference = (winner, loser, strength) => {
    setPreferenceMatrix((prevMatrix) => {
      let newMatrix = { ...prevMatrix };
      if (!newMatrix[winner]) newMatrix[winner] = {};
      if (!newMatrix[loser]) newMatrix[loser] = {};
      newMatrix[winner][loser] = (newMatrix[winner][loser] || 0) + strength;
      newMatrix[loser][winner] = (newMatrix[loser][winner] || 0) - strength;
      return newMatrix;
    });

    let remainingComparisons = pairwiseComparisons.slice(1);
    setPairwiseComparisons(remainingComparisons);
    setCurrentPair(remainingComparisons.length > 0 ? remainingComparisons[0] : null);
  };

  const displayResults = () => {
    setShowResults(true);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Net Flow Voting</h1>
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
      <ul className="mb-4">
        {items.map((item, index) => (
          <li key={index} className="p-1 border-b">{item}</li>
        ))}
      </ul>
      {currentPair ? (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Choose Preference Strength</h2>
          <p>{currentPair[0]} vs. {currentPair[1]}</p>
          <div className="flex gap-2 mt-2">
            <button onClick={() => recordPreference(currentPair[0], currentPair[1], 1)} className="bg-green-500 text-white px-2 py-1 rounded">Slightly Prefer {currentPair[0]}</button>
            <button onClick={() => recordPreference(currentPair[0], currentPair[1], 2)} className="bg-green-700 text-white px-2 py-1 rounded">Strongly Prefer {currentPair[0]}</button>
            <button onClick={() => recordPreference(currentPair[1], currentPair[0], 1)} className="bg-red-500 text-white px-2 py-1 rounded">Slightly Prefer {currentPair[1]}</button>
            <button onClick={() => recordPreference(currentPair[1], currentPair[0], 2)} className="bg-red-700 text-white px-2 py-1 rounded">Strongly Prefer {currentPair[1]}</button>
          </div>
        </div>
      ) : (
        items.length > 1 && (
          <div>
            <p className="text-green-600">Voting complete! Check your preference rankings.</p>
            <button onClick={displayResults} className="mt-4 bg-purple-500 text-white px-4 py-2 rounded">Show Results</button>
          </div>
        )
      )}
      {showResults && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <h2 className="text-lg font-bold">Results</h2>
          <pre className="text-sm text-gray-700">{JSON.stringify(preferenceMatrix, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

"Updated index.js with result button"
