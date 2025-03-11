import React, { useState, useEffect } from "react";

export default function NetFlowVotingApp() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [numVoters, setNumVoters] = useState(1);
  const [preferenceMatrices, setPreferenceMatrices] = useState([]);
  const [currentVoter, setCurrentVoter] = useState(0);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [votingStarted, setVotingStarted] = useState(false);
  const version = "1.2.6";

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

  const startVoting = () => {
    if (items.length > 1 && numVoters > 0) {
      setVotingStarted(true);
      initializeMatrices(numVoters); // Ensure voter count is stored correctly
    }
  };

  const initializeMatrices = (voters) => {
    const size = items.length;
    if (size < 2) return;
    let matrices = Array(voters).fill(null).map(() =>
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

  const restartVoting = () => {
    setItems([]);
    setPreferenceMatrices([]);
    setCurrentVoter(0);
    setCurrentPairIndex(0);
    setShowResults(false);
    setVotingStarted(false);
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

  const computeNetPreferenceMatrix = () => {
    const size = items.length;
    let netMatrix = Array(size).fill(null).map(() => Array(size).fill(0));

    preferenceMatrices.forEach(matrix => {
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          netMatrix[i][j] += matrix[i][j];
        }
      }
    });

    return netMatrix;
  };

  const computeNetFlowScores = (matrix) => {
    return matrix.map(row => row.reduce((sum, val) => sum + val, 0));
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Net Flow Voting</h1>
      <p className="text-sm text-gray-500">Version: {version}</p>

      {/* ✅ Candidate Input Section */}
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

      {/* ✅ Display Added Candidates */}
      {items.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold">Candidates:</h2>
          <ul>
            {items.map((item, index) => (
              <li key={index} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ✅ Number of Voters Selection - Ensure voter count persists */}
      {!votingStarted && items.length > 1 && (
        <div className="mb-4">
          <label className="mr-2">Number of Voters:</label>
          <input
            type="number"
            value={numVoters}
            onChange={(e) => setNumVoters(parseInt(e.target.value) || 1)}
            className="border p-2 w-16"
          />
        </div>
      )}

      {/* ✅ Start Voting Button */}
      {!votingStarted && items.length > 1 && (
        <button onClick={startVoting} className="bg-green-500 text-white px-4 py-2 rounded">Start Voting</button>
      )}

      {/* ✅ Results Section */}
      {showResults && (
        <div className="mt-6">
          <h2 className="text-lg font-bold">Results</h2>

          {/* ✅ Display Individual Voter Matrices & Net Flow Scores */}
          {preferenceMatrices.map((matrix, voterIndex) => (
            <div key={voterIndex} className="mt-4">
              <h3 className="text-md font-bold">Voter {voterIndex + 1} Preference Matrix</h3>
              <table className="border-collapse border border-gray-400">
                {matrix.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => <td key={j} className="border p-2">{cell}</td>)}
                  </tr>
                ))}
              </table>

              {/* ✅ Display Net Flow Scores in Table */}
              <h4 className="font-bold mt-2">Net Flow Scores</h4>
              <table className="border-collapse border border-gray-400">
                <tr>
                  <th className="border p-2">Candidate</th>
                  <th className="border p-2">Score</th>
                </tr>
                {computeNetFlowScores(matrix).map((score, i) => (
                  <tr key={i}>
                    <td className="border p-2">{items[i]}</td>
                    <td className="border p-2">{score}</td>
                  </tr>
                ))}
              </table>
            </div>
          ))}

          {/* ✅ Display Total Preference Matrix & Net Flow Scores */}
          <div className="mt-6">
            <h3 className="text-md font-bold">Total Preference Matrix</h3>
            <table className="border-collapse border border-gray-400">
              {computeNetPreferenceMatrix().map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => <td key={j} className="border p-2">{cell}</td>)}
                </tr>
              ))}
            </table>

            {/* ✅ Display Total Net Flow Scores in Table */}
            <h4 className="font-bold mt-2">Total Net Flow Scores</h4>
            <table className="border-collapse border border-gray-400">
              <tr>
                <th className="border p-2">Candidate</th>
                <th className="border p-2">Score</th>
              </tr>
              {computeNetFlowScores(computeNetPreferenceMatrix()).map((score, i) => (
                <tr key={i}>
                  <td className="border p-2">{items[i]}</td>
                  <td className="border p-2">{score}</td>
                </tr>
              ))}
            </table>
          </div>

          <button onClick={restartVoting} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">Restart</button>
        </div>
      )}
    </div>
  );
}
