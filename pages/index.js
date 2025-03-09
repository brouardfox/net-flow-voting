import React, { useState, useEffect } from "react";

export default function NetFlowVotingApp() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [pairwiseComparisons, setPairwiseComparisons] = useState([]);
  const [preferenceMatrix, setPreferenceMatrix] = useState({});
  const [currentPair, setCurrentPair] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const version = "1.0.1";

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
        comparisons.push({ pair: [items[i], items[j]], winner: null, strength: 0 });
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

    setPairwiseComparisons((prevComparisons) => {
      let updatedComparisons = prevComparisons.map((comp) =>
        comp.pair.includes(winner) && comp.pair.includes(loser)
          ? { ...comp, winner, strength }
          : comp
      );
      return updatedComparisons;
    });

    let remainingComparisons = pairwiseComparisons.slice(1);
    setPairwiseComparisons(remainingComparisons);
    setCurrentPair(remainingComparisons.length > 0 ? remainingComparisons[0] : null);
  };

  const displayResults = () => {
    setShowResults(true);
  };

  const restartVoting = () => {
    setItems([]);
    setPairwiseComparisons([]);
    setPreferenceMatrix({});
    setCurrentPair(null);
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
        <table className="w-full mt-4 border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 p-2">Matchup</th>
              <th className="border border-gray-400 p-2">Winner</th>
              <th className="border border-gray-400 p-2">Strength</th>
            </tr>
          </thead>
          <tbody>
            {pairwiseComparisons.map((comp, index) => (
              <tr key={index} className="border border-gray-400">
                <td className="border border-gray-400 p-2">{comp.pair[0]} vs. {comp.pair[1]}</td>
                <td className="border border-gray-400 p-2 font-bold text-green-600">{comp.winner ? comp.winner : "Pending"}</td>
                <td className="border border-gray-400 p-2">{comp.winner ? comp.strength : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {currentPair ? (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Choose Preference Strength</h2>
          <p>{currentPair.pair[0]} vs. {currentPair.pair[1]}</p>
          <div className="flex gap-2 mt-2">
            <button onClick={() => recordPreference(currentPair.pair[0], currentPair.pair[1], 1)} className="bg-green-500 text-white px-2 py-1 rounded">Slightly Prefer {currentPair.pair[0]}</button>
            <button onClick={() => recordPreference(currentPair.pair[0], currentPair.pair[1], 2)} className="bg-green-700 text-white px-2 py-1 rounded">Strongly Prefer {currentPair.pair[0]}</button>
            <button onClick={() => recordPreference(currentPair.pair[1], currentPair.pair[0], 1)} className="bg-red-500 text-white px-2 py-1 rounded">Slightly Prefer {currentPair.pair[1]}</button>
            <button onClick={() => recordPreference(currentPair.pair[1], currentPair.pair[0], 2)} className="bg-red-700 text-white px-2 py-1 rounded">Strongly Prefer {currentPair.pair[1]}</button>
          </div>
        </div>
      ) : (
        items.length > 1 && (
          <div>
            <p className="text-green-600">Voting complete! Check your preference rankings.</p>
            <button onClick={displayResults} className="mt-4 bg-purple-500 text-white px-4 py-2 rounded">Show Results</button>
            <button onClick={restartVoting} className="mt-4 bg-red-500 text-white px-4 py-2 rounded ml-2">Restart</button>
          </div>
        )
      )}
    </div>
  );
}
