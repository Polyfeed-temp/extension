import React, {useState} from "react";
import {AnnotationToDo} from "../../types";
import {ToDoActionCategory} from "../../types";

const ToDoActions: ToDoActionCategory[] = [
  "Further Practice",
  "Contact Tutor",
  "Ask Classmate",
  "Refer Learning Resources",
  "Explore Online",
  "Other",
];

const TodoCard = ({setTodo}: {setTodo: (input: AnnotationToDo) => void}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    ToDoActionCategory | undefined
  >("Ask Classmate");
  const [todoText, setTodoText] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCategory(event.target.value as ToDoActionCategory);
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        To Do item
      </label>
      <input
        type="text"
        placeholder="Enter to do item here"
        className="p-2 border rounded-md w-full"
        value={todoText}
        onChange={(e) => setTodoText(e.target.value)}
      />

      <label
        htmlFor="category"
        className="block text-sm font-medium text-gray-700 mt-4 mb-2"
      >
        Category:
      </label>
      <select
        id="category"
        value={selectedCategory}
        onChange={handleCategoryChange}
        className="p-2 border rounded-md w-full"
      >
        <option value={undefined}>Select a category</option>
        {ToDoActions.map((action) => (
          <option key={action} value={action}>
            {action}
          </option>
        ))}
      </select>

      <label
        htmlFor="dueDate"
        className="block text-sm font-medium text-gray-700 mt-4 mb-2"
      >
        Due Date:
      </label>
      <input
        type="date"
        id="dueDate"
        value={dueDate}
        className="p-2 border rounded-md w-full"
      />

      <button
        onClick={() =>
          setTodo({
            todo: todoText,
            category: selectedCategory! as ToDoActionCategory,
            dueDate: new Date(dueDate),
          })
        }
      >
        Save
      </button>
    </div>
  );
};

export default TodoCard;
