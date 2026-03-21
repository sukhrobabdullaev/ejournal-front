import React, { useState, useEffect } from "react";
import "./JournalIssueList.css";

const JournalIssueList = () => {
  // State to manage journal issues and view mode
  const [viewMode, setViewMode] = useState("monthly"); // "weekly" or "monthly"
  const [journalIssues, setJournalIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data (can be replaced with backend API later)
  const mockIssues = [
    { id: 1, title: "Journal Issue 1", date: "2026-03-01" },
    { id: 2, title: "Journal Issue 2", date: "2026-03-08" },
    { id: 3, title: "Journal Issue 3", date: "2026-03-15" },
    { id: 4, title: "Journal Issue 4", date: "2026-03-22" },
  ];

  // Fetch journal issues (mock for now)
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate an API call
      setTimeout(() => {
        setJournalIssues(mockIssues);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError("Failed to load journal issues. Please try again.");
      setIsLoading(false);
    }
  }, []);

  // Filter journal issues based on view mode
  const filteredIssues =
    viewMode === "weekly"
      ? journalIssues
      : journalIssues.filter((issue) => issue.date.includes("-03"));

  return (
    <div className="journal-issues-container">
      <h2>Journal Issues</h2>

      {/* Filter Options */}
      <div className="filter-options">
        <button
          onClick={() => setViewMode("weekly")}
          disabled={viewMode === "weekly"}
        >
          Weekly
        </button>
        <button
          onClick={() => setViewMode("monthly")}
          disabled={viewMode === "monthly"}
        >
          Monthly
        </button>
      </div>

      {/* Conditional Rendering */}
      {isLoading ? (
        <p>Loading journal issues...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="journal-issues-list">
          {filteredIssues.map((issue) => (
            <div key={issue.id} className="journal-issue">
              <h3>{issue.title}</h3>
              <p>Date: {issue.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JournalIssueList;