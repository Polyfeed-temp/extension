import {useState} from "react";

const LabelDropdown = () => {
  const [selectedLabel, setSelectedLabel] = useState("");
  const [otherLabel, setOtherLabel] = useState("");

  const handleLabelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectedLabel(selectedValue);
    if (selectedValue === "other") {
      setOtherLabel("");
    }
  };

  const handleOtherLabelChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOtherLabel(event.target.value);
  };

  return (
    <div>
      <label htmlFor="label-dropdown">Select a label:</label>
      <select
        id="label-dropdown"
        value={selectedLabel}
        onChange={handleLabelChange}
      >
        <option value="">--Select--</option>
        <option value="label1">Strength</option>
        <option value="label2">Weakness</option>
        <option value="label3"> To-Do</option>
        <option value="other">Other</option>
      </select>
      {selectedLabel === "other" && (
        <div>
          <label htmlFor="other-label-input">Enter a label:</label>
          <input
            id="other-label-input"
            type="text"
            value={otherLabel}
            onChange={handleOtherLabelChange}
          />
        </div>
      )}
    </div>
  );
};

export default LabelDropdown;
