import React, { useState, useEffect } from "react";

export default function NetFlowVotingApp() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [numVoters, setNumVoters] = useState(1);
  const [preferenceMatrix, setPreferenceMatrix] = useState([]);
  const [currentVoter, setCurrentVoter] = useState(0);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const version = "1.1.2";

  useEffect(() => {
    if (items.length > 1) {
      initializeMatrix();
    }
  }, [items]);

  const addItem = () => {
    if (newItem.trim() !== "") {
      setItems([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const initializeMatrix = () => {
    const size = items.length;
    let matrix = Array(size).fill(null).map(() => Array(size).fill(0));
    setPreferenceMatrix(matrix);
    setCurrentVoter(0);
    setCurrentPairIndex(0);
  };

  const recordPreference = (i, j, value) => {
    setPreferenceMatrix((prevMatrix) => {
      const newMatrix = prevMatrix.map(row => [...row]);
      newMatrix[i][j] += value;
      newMatrix[j][i] -= value;
      return newMatrix;
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

  const calculateNetFlowScores = () => {
    return preferenceMatrix.map(row => row.reduce((acc, val) => acc + val, 0));
  };

  const restartVoting = () => {
    setItems([]);
    setPreferenceMatrix([]);
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

  const netFlowScores = calculateNetFlowScores();

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
      {showResults ? (
        <div>
          <table className="w-full mt-4 border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-2">Candidates</th>
                {items.map((item, index) => (
                  <th key={index} className="border border-gray-400 p-2">{item}</th>
                ))}
                <th className="border border-gray-400 p-2">Net Flow Score</th>
              </tr>
            </thead>
            <tbody>
              {preferenceMatrix.map((row, i) => (
                <tr key={i} className="border border-gray-400">
                  <td className="border border-gray-400 p-2 font-bold">{items[i]}</td>
                  {row.map((cell, j) => (
                    <td key={j} className="border border-gray-400 p-2 text-center">{cell}</td>
                  ))}
                  <td className="border border-gray-400 p-2 font-bold text-blue-600">{netFlowScores[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        items.length > 1 && currentPairIndex < (items.length * (items.length - 1)) / 2 && (
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
        )
      )}
      {showResults && (
        <button onClick={restartVoting} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">Restart</button>
      )}
    </div>
  );
}
