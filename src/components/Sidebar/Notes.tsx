import { useState } from "react";
import { Button } from "@material-tailwind/react";

export function Notes({
  ref,
  setNote,
  notes,
  cancelFunc,
}: {
  setNote: (input: string) => void;
  notes: string;
  cancelFunc: () => void;
  ref?: any;
}) {
  const [value, setValue] = useState(notes);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditToggle = () => {
    if (isEditing) {
      setNote(value); // Save the edited note
    }
    setIsEditing(!isEditing); // Toggle editing state
  };

  const handleCancel = () => {
    setValue(notes); // Reset to original notes
    setIsEditing(false); // Exit edit mode
    cancelFunc(); // Call cancel function if needed
  };

  return (
    <div className="flex flex-col space-y-4">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter your notes here"
        style={{
          marginTop: 10,
          borderColor: "black",
          borderRadius: 5,
          padding: 10,
          borderWidth: 1,
        }}
        disabled={!isEditing} // Disable textarea if not editing
      />
      <div className="flex justify-between">
        <Button className="bg-black my-4" onClick={handleEditToggle}>
          {isEditing ? "Save" : "Edit"}
        </Button>

        {isEditing && (
          <Button className="bg-black my-4" onClick={handleCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
