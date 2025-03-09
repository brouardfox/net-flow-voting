import React, { useState, useEffect } from "react";

export default function NetFlowVotingApp() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [numVoters, setNumVoters] = useState(1);
  const [preferenceMatrices, setPreferenceMatrices] = useState([]);
  const [currentVoter, setCurrentVoter] = useState(0);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const version = "1.1.5";

  useEffect(() => {
    if (items.length > 1) {
      initializeMatrices();
    }
  }, [items, numVoters]);

  const addItem = () => {
    if (newItem.trim() !== "") {
      setItems([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const initializeMatrices = () => {
    const size = items.length;
    if (size < 2) return;
    let matrices = Array(numVoters).fill(null).map(() =>
      Array(size).fill(null).map(() => Array(size).fill(0))
    );
    setPreferenceMatrices(matrices);
    setCurrentVoter(0);
    setCurrentPairIndex(0);
    setShowResults(false);
  };

  const recordPreference = (i, j, value) => {
    setPreferenceMatrices((prevMatrices) => {
      const newMatrices = prevMatrices.map(matrix => matrix.map(row => [...row]));
      newMatrices[currentVoter][i][j] += value;
      newMatrices[currentVoter][j][i] -= value;
      return newMatrices;
    });

    if (currentPairIndex < (items.length * (items.length - 1)) / 2 - 1) {
      setCurrentPairIndex(currentPairIndex + 1);
    } else {
      if (currentVoter < numVoters - 1) {
        setCurrentVoter(currentVoter + 1);
        setCurrentPairIndex(0);
      } else {
        setShowResults(true);
      }
    }
  };

  const calculateNetFlowScores = (matrix) => {
    return matrix.map(row => row.reduce((acc, val) => acc + val, 0));
  };

  const aggregateMatrix = () => {
    const size = items.length;
    let aggregatedMatrix = Array(size).fill(null).map(() => Array(size).fill(0));
    
    preferenceMatrices.forEach(matrix => {
      matrix.forEach((row, i) => {
        row.forEach((value, j) => {
          aggregatedMatrix[i][j] += value;
        });
      });
    });
    return aggregatedMatrix;
  };

  const restartVoting = () => {
    setItems([]);
    setPreferenceMatrices([]);
    setCurrentVoter(0);
    setCurrentPairIndex(0);
    setShowResults(false);
  };

  const getPairFromIndex = (index) => {
    let count = 0;
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        if (count === index) return [i, j];
        count++;
      }
    }
    return null;
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
      <div className="mb-4">
        <label className="mr-2">Number of Voters:</label>
        <input
          type="number"
          value={numVoters}
          onChange={(e) => setNumVoters(parseInt(e.target.value) || 1)}
          className="border p-2 w-16"
        />
      </div>
      {!showResults && currentPairIndex < (items.length * (items.length - 1)) / 2 && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Voter {currentVoter + 1}, Choose Preference</h2>
          {(() => {
            const pair = getPairFromIndex(currentPairIndex);
            if (!pair) return null;
            return (
              <div>
                <p>{items[pair[0]]} vs. {items[pair[1]]}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => recordPreference(pair[0], pair[1], 1)} className="bg-green-500 text-white px-2 py-1 rounded">Prefer {items[pair[0]]}</button>
                  <button onClick={() => recordPreference(pair[0], pair[1], -1)} className="bg-red-500 text-white px-2 py-1 rounded">Prefer {items[pair[1]]}</button>
                  <button onClick={() => recordPreference(pair[0], pair[1], 0)} className="bg-gray-500 text-white px-2 py-1 rounded">No Preference</button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
      {showResults && (
        <div className="mt-6">
          <h2 className="text-lg font-bold">Aggregated Results</h2>
          <table className="border-collapse border border-gray-400">
            {aggregateMatrix().map((row, i) => (
              <tr key={i} className="border border-gray-400">
                {row.map((cell, j) => (
                  <td key={j} className="border border-gray-400 p-2">{cell}</td>
                ))}
              </tr>
            ))}
          </table>
          <button onClick={restartVoting} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">Restart</button>
        </div>
      )}
    </div>
  );
}
