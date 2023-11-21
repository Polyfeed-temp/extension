import React, {useState} from "react";
import {AnnotationActionPoint} from "../../types";
import {ActionPointCategory} from "../../types";
import {Button, Checkbox, Typography} from "@material-tailwind/react";

const ToDoActions: ActionPointCategory[] = [
  "Further Practice",
  "Contact Tutor",
  "Ask Classmate",
  "Refer Learning Resources",
  "Explore Online",
  "Other",
];

function renderToDoItems(actionItems: AnnotationActionPoint[]) {
  return (
    <>
      {actionItems.map((actionPointItem) => (
        <div key={actionPointItem.action} className="mb-4">
          <Checkbox
            crossOrigin=""
            label={
              <div className="flex flex-col items-start">
                <Typography
                  variant="small"
                  color="gray"
                  className="font-normal overflow-hidden overflow-ellipsis whitespace-nowrap"
                >
                  {actionPointItem.action}
                </Typography>
                <div className="flex justify-between w-full">
                  <Typography
                    variant="small"
                    color="gray"
                    className="font-normal overflow-hidden overflow-ellipsis whitespace-nowrap"
                  >
                    {actionPointItem.actionpoint}
                  </Typography>
                  <Typography
                    variant="small"
                    color="gray"
                    className="font-normal"
                  >
                    {actionPointItem.deadline.toLocaleDateString()}
                  </Typography>
                </div>
              </div>
            }
            containerProps={{
              className: "-mt-5",
            }}
          />
        </div>
      ))}
      <button> Add new to-do list item</button>
    </>
  );
}

const TodoCard = ({
  actionItems,
  setActionItems,
}: {
  actionItems: AnnotationActionPoint[];
  setActionItems: React.Dispatch<React.SetStateAction<AnnotationActionPoint[]>>;
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    ActionPointCategory | undefined
  >("Ask Classmate");
  const [todoText, setTodoText] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCategory(event.target.value as ActionPointCategory);
  };
  const resetForm = () => {
    setTodoText("");
    setDueDate("");
    setSelectedCategory(undefined);
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      {actionItems.length > 0 ? (
        renderToDoItems(actionItems)
      ) : (
        <>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Do item
          </label>
          <textarea
            placeholder="Enter to do item here"
            className="p-2 border rounded-md w-full resize-none"
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
            min={new Date().toISOString().split("T")[0]}
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="p-2 border rounded-md w-full"
          />

          <Button
            onClick={() => {
              setActionItems(
                actionItems.concat({
                  action: todoText,
                  actionpoint: selectedCategory,
                  deadline: new Date(dueDate),
                } as AnnotationActionPoint)
              );
              resetForm();
            }}
            className="full-width bg-black"
          >
            Save To-do item
          </Button>
        </>
      )}
    </div>
  );
};

export default TodoCard;
