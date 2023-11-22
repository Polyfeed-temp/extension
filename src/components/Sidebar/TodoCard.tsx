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

function TodoCard({
  saveFunc,
}: {
  saveFunc: (actionItems: AnnotationActionPoint[]) => void;
}) {
  const [actionItems, setActionItems] = useState<AnnotationActionPoint[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    ActionPointCategory | undefined
  >("Ask Classmate");
  const [todoText, setTodoText] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [addToDo, setAddToDo] = useState<boolean>(true);
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
  function renderToDoItems(actionItems: AnnotationActionPoint[]) {
    return (
      <>
        {actionItems.map((actionPointItem, index) => (
          <div key={index} className="flex items-center mb-4">
            <Checkbox crossOrigin="" label="" />
            <div className="flex flex-col ml-2 flex-grow">
              <Typography
                variant="small"
                color="gray"
                className="font-normal break-words"
              >
                {actionPointItem.action}
              </Typography>
              <div className="flex justify-between w-full">
                <Typography
                  variant="small"
                  color="gray"
                  className="font-normal break-words flex-grow mr-2 italic text-left"
                >
                  {actionPointItem.actionpoint}
                </Typography>
                <Typography
                  variant="small"
                  color="gray"
                  className="font-normal whitespace-nowrap text-left"
                >
                  {actionPointItem.deadline.toLocaleDateString()}
                </Typography>
              </div>
            </div>
          </div>
        ))}
        {actionItems.length > 0 ? (
          <Button fullWidth onClick={() => setAddToDo(!addToDo)}>
            Add new to-do list item
          </Button>
        ) : null}
      </>
    );
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      {renderToDoItems(actionItems)}
      {addToDo ? (
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
              setAddToDo(!addToDo);
            }}
            className="full-width bg-black"
          >
            Save To-do item
          </Button>
        </>
      ) : null}

      <Button
        onClick={() => {
          saveFunc(actionItems);
        }}
        className="full-width bg-black"
      >
        {" "}
        Save
      </Button>
    </div>
  );
}

export default TodoCard;
