import React, {useState} from "react";

type ToDoActionCategory =
  | "Further Practice"
  | "Contact Tutor"
  | "Ask Classmate"
  | "Refer Learning Resources"
  | "Explore Online"
  | "Other";

const ToDoActions: ToDoActionCategory[] = [
  "Further Practice",
  "Contact Tutor",
  "Ask Classmate",
  "Refer Learning Resources",
  "Explore Online",
  "Other",
];

const TodoCard = () => {
  const [selectedCategory, setSelectedCategory] = useState<
    ToDoActionCategory | undefined
  >("Further Practice");

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCategory(event.target.value as ToDoActionCategory);
  };

  const handleDueDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // handle due date change here
  };

  return (
    <div>
      <label htmlFor="category">Category:</label>
      <select
        id="category"
        value={selectedCategory}
        onChange={handleCategoryChange}
      >
        <option value={undefined}>Select a category</option>
        {ToDoActions.map((action) => (
          <option key={action} value={action}>
            {action}
          </option>
        ))}
      </select>
      <br />
      <label htmlFor="dueDate">Due Date:</label>
      <input
        type="date"
        id="dueDate"
        onChange={handleDueDateChange}
        value={"Enter due date here"}
      />
    </div>
  );
};

export default TodoCard;
