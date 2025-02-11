import React, { useState, useEffect } from "react";
import { Button, Select, Option } from "@material-tailwind/react";
import { v4 as uuidv4 } from "uuid";
import { getAllUnits } from "../../../services/unit.service";
import { Assessment, Unit } from "../../../types";
import SearchableSelect from "../SearchableSelect";
import { useFeedbackRequestStore } from "../../../store/feedbackRequestStore";
import { toast } from "react-toastify";

export interface RubricItem {
  id: string;
  item: string;
  comments: string;
}

export interface FeedbackRequest {
  assignmentId: number;
  rubricItems: RubricItem[];
  previousFeedbackUsage: string;
}

const styles = {
  container: {
    backgroundColor: "white",
    height: "100%",
  },
  header: {
    padding: "12px 16px",
    borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
  },
  headerTitle: {
    fontSize: "18px",
    fontWeight: 600,
  },
  content: {
    padding: "16px",
  },
  section: {
    marginBottom: "16px",
  },
  selectContainer: {
    marginBottom: "16px",
    position: "relative" as const,
  },
  selectWrapper: {
    border: "1px solid #9ca3af",
    borderRadius: "8px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    backgroundColor: "white",
    "& .select": {
      minWidth: "200px",
      border: "none",
      borderRadius: "8px",
      padding: "12px",
      fontSize: "16px",
      backgroundColor: "transparent",
    },
  },
  selectLabel: {
    color: "#374151",
    fontSize: "14px",
    fontWeight: 500,
    marginBottom: "6px",
  },
  table: {
    width: "100%",
    borderCollapse: "separate" as const,
    borderSpacing: 0,
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
  },
  tableHeader: {
    backgroundColor: "#f8fafc",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left" as const,
    fontSize: "13px",
    fontWeight: 600,
    color: "#4b5563",
    borderBottom: "1px solid #e5e7eb",
  },
  tableRow: {
    backgroundColor: "white",
    borderBottom: "1px solid #e5e7eb",
    transition: "background-color 0.2s",
  },
  tableCell: {
    padding: "12px 16px",
    verticalAlign: "top" as const,
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "#fff",
    transition: "all 0.2s",
    "&:focus": {
      borderColor: "#000",
      outline: "none",
      boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
    },
  },
  textarea: {
    width: "100%",
    minHeight: "100px",
    padding: "12px 16px",
    border: "1px solid #9ca3af",
    borderRadius: "8px",
    resize: "vertical" as const,
    fontSize: "15px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    transition: "border-color 0.2s",
  },
  footer: {
    padding: "12px 16px",
    backgroundColor: "#f9fafb",
    borderTop: "1px solid rgba(0, 0, 0, 0.1)",
  },
  submitButton: {
    width: "100%",
    padding: "8px 16px",
    backgroundColor: "black",
    color: "white",
    borderRadius: "6px",
    fontSize: "16px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    cursor: "pointer",
  },
  addButton: {
    padding: "8px 12px",
    border: "1px solid #9ca3af",
    borderRadius: "6px",
    color: "#374151",
    fontSize: "14px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    cursor: "pointer",
    backgroundColor: "white",
  },
  removeButton: {
    color: "#6b7280",
    fontSize: "18px",
    fontWeight: 500,
    cursor: "pointer",
    background: "none",
    border: "none",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: 500,
    marginBottom: "4px",
    color: "#374151",
  },
  "@global": {
    "input:focus, textarea:focus": {
      outline: "none",
      borderColor: "#000",
    },
    "input:hover, textarea:hover": {
      borderColor: "#6b7280",
    },
  },
  emptyMessage: {
    padding: "32px 16px",
    textAlign: "center" as const,
    color: "#6b7280",
    backgroundColor: "#f9fafb",
    fontSize: "14px",
  },
};

export const RequestFeedbackTab = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [feedbackRequest, setFeedbackRequest] = useState<FeedbackRequest>({
    assignmentId: 0,
    rubricItems: [],
    previousFeedbackUsage: "",
  });

  // Add store
  const { submitFeedbackRequest, loading } = useFeedbackRequestStore();

  // Fetch units on component mount
  useEffect(() => {
    getAllUnits().then((res) => {
      setUnits(res);
    });
  }, []);

  const addRubricItem = () => {
    setFeedbackRequest((prev) => ({
      ...prev,
      rubricItems: [
        ...prev.rubricItems,
        { id: uuidv4(), item: "", comments: "" },
      ],
    }));
  };

  const removeRubricItem = (id: string) => {
    setFeedbackRequest((prev) => ({
      ...prev,
      rubricItems: prev.rubricItems.filter((item) => item.id !== id),
    }));
  };

  const updateRubricItem = (
    id: string,
    field: keyof Omit<RubricItem, "id">,
    value: string
  ) => {
    setFeedbackRequest((prev) => ({
      ...prev,
      rubricItems: prev.rubricItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!feedbackRequest.assignmentId) {
        toast.error("Please select an assignment");
        return;
      }

      if (feedbackRequest.rubricItems.length === 0) {
        toast.error("Please add at least one rubric item");
        return;
      }

      await submitFeedbackRequest({
        assignmentId: feedbackRequest.assignmentId,
        rubricItems: feedbackRequest.rubricItems,
        previousFeedbackUsage: feedbackRequest.previousFeedbackUsage,
      });

      // Reset form after successful submission
      setFeedbackRequest({
        assignmentId: 0,
        rubricItems: [],
        previousFeedbackUsage: "",
      });

      setSelectedUnit(null);
    } catch (error) {
      console.error("Error submitting feedback request:", error);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Request Feedback</h2>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Unit and Assignment Selection */}
        <div style={styles.section}>
          <div style={styles.selectContainer}>
            <label style={styles.selectLabel}>Unit Code</label>
            <SearchableSelect
              options={units}
              displayFunction={(option) =>
                `${option.unitCode} - Year: ${option.year}, Semester: ${option.semester}`
              }
              filterFunction={(option, searchTerm) =>
                `${option.unitCode} ${option.year} S${option.semester}`
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              }
              onSelectFunction={(selectedUnit: Unit) => {
                setSelectedUnit(selectedUnit);
              }}
            />
          </div>

          {selectedUnit && (
            <div style={styles.selectContainer}>
              <label style={styles.selectLabel}>Assignment</label>
              <select
                style={styles.input}
                onChange={(e) => {
                  const assignmentId = parseInt(e.target.value);
                  setFeedbackRequest((prev) => ({
                    ...prev,
                    assignmentId: assignmentId,
                  }));
                }}
              >
                <option value="" disabled selected>
                  Select an assignment
                </option>
                {selectedUnit.assessments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.assessmentName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Rubric Items */}
        <div style={styles.section}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <h3 style={{ fontSize: "14px", fontWeight: 500 }}>Rubric Items</h3>
            <button style={styles.addButton} onClick={addRubricItem}>
              Add Item
            </button>
          </div>

          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Rubric Item</th>
                <th style={styles.th}>Comments</th>
                <th style={{ ...styles.th, width: "40px" }}></th>
              </tr>
            </thead>
            <tbody>
              {feedbackRequest.rubricItems.map((item) => (
                <tr key={item.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    <input
                      type="text"
                      placeholder="Enter rubric item"
                      value={item.item}
                      onChange={(e) =>
                        updateRubricItem(item.id, "item", e.target.value)
                      }
                      style={styles.input}
                    />
                  </td>
                  <td style={styles.tableCell}>
                    <input
                      type="text"
                      placeholder="Enter comments"
                      value={item.comments}
                      onChange={(e) =>
                        updateRubricItem(item.id, "comments", e.target.value)
                      }
                      style={styles.input}
                    />
                  </td>
                  <td style={{ ...styles.tableCell, textAlign: "right" }}>
                    <button
                      onClick={() => removeRubricItem(item.id)}
                      style={styles.removeButton}
                      title="Remove item"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
              {feedbackRequest.rubricItems.length === 0 && (
                <tr>
                  <td colSpan={3} style={styles.emptyMessage}>
                    Click "Add Item" to add a rubric item
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Previous Feedback */}
        <div style={styles.section}>
          <label style={styles.label}>Previous Feedback Usage</label>
          <textarea
            placeholder="Describe how you used your previous feedback..."
            value={feedbackRequest.previousFeedbackUsage}
            onChange={(e) =>
              setFeedbackRequest((prev) => ({
                ...prev,
                previousFeedbackUsage: e.target.value,
              }))
            }
            style={styles.textarea}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <button
          style={{
            ...styles.submitButton,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </div>
  );
};
