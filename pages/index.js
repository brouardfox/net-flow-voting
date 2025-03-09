import React, { useState, useEffect } from "react";

export default function NetFlowVotingApp() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [numVoters, setNumVoters] = useState(1);
  const [preferenceMatrices, setPreferenceMatrices] = useState([]);
  const [currentVoter, setCurrentVoter] = useState(0);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const version = "1.1.3";

  useEffect(() => {
    if (items.length > 1) {
      initializeMatrices();
    }
  }, [items]);

  const addItem = () => {
    if (newItem.trim() !== "") {
      setItems([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const initializeMatrices = () => {
    const size = items.length;
    let matrices = Array(numVoters).fill(null).map(() =>
      Array(size).fill(null).map(() => Array(size).fill(0))
    );
    setPreferenceMatrices(matrices);
    setCurrentVoter(0);
    setCurrentPairIndex(0);
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

  const aggregatedMatrix = preferenceMatrices.reduce((aggMatrix, voterMatrix) => {
    return aggMatrix.map((row, i) => row.map((cell, j) => cell + voterMatrix[i][j]));
  }, Array(items.length).fill(null).map(() => Array(items.length).fill(0)));

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
          <h2 className="text-lg font-bold mt-4">Aggregated Results</h2>
          <table className="w-full mt-2 border-collapse border border-gray-400">
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
              {aggregatedMatrix.map((row, i) => (
                <tr key={i} className="border border-gray-400">
                  <td className="border border-gray-400 p-2 font-bold">{items[i]}</td>
                  {row.map((cell, j) => (
                    <td key={j} className="border border-gray-400 p-2 text-center">{cell}</td>
                  ))}
                  <td className="border border-gray-400 p-2 font-bold text-blue-600">{calculateNetFlowScores(aggregatedMatrix)[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {preferenceMatrices.map((matrix, v) => (
            <div key={v} className="mt-6">
              <h3 className="text-md font-bold">Voter {v + 1} Preferences</h3>
              <table className="w-full mt-2 border-collapse border border-gray-400">
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
                  {matrix.map((row, i) => (
                    <tr key={i} className="border border-gray-400">
                      <td className="border border-gray-400 p-2 font-bold">{items[i]}</td>
                      {row.map((cell, j) => (
                        <td key={j} className="border border-gray-400 p-2 text-center">{cell}</td>
                      ))}
                      <td className="border border-gray-400 p-2 font-bold text-blue-600">{calculateNetFlowScores(matrix)[i]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (null)}
      {showResults && (
        <button onClick={restartVoting} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">Restart</button>
      )}
    </div>
  );
}
