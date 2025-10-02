import React, { useState, useRef, useEffect } from "react";

type OptionType = {
  [key: string]: any;
};

type SearchableSelectProps = {
  options: OptionType[];
  displayFunction: (option: OptionType) => string;
  filterFunction: (option: OptionType, searchTerm: string) => boolean;
  onSelectFunction: (selectedUnit: any) => void;
  selectedValue?: OptionType | null;
  placeholder?: string;
};

function SearchableSelect({
  options,
  displayFunction,
  filterFunction,
  onSelectFunction,
  selectedValue = null,
  placeholder = "Search...",
}: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showOptions, setShowOptions] = useState<boolean>(false);

  // Update search term when selectedValue changes
  React.useEffect(() => {
    if (selectedValue) {
      setSearchTerm(displayFunction(selectedValue));
    } else {
      setSearchTerm("");
    }
  }, [selectedValue, displayFunction]);

  const filteredOptions = options.filter((option) =>
    filterFunction(option, searchTerm)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowOptions(true);
    // If user clears the input, reset the selection
    if (e.target.value === "") {
      onSelectFunction(null);
    }
  };

  const handleOptionClick = (option: OptionType) => {
    const displayText = displayFunction(option);
    setSearchTerm(displayText);
    setShowOptions(false);
    onSelectFunction(option);
  };
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event: { target: any }) {
      if (
        wrapperRef.current &&
        !(wrapperRef.current as HTMLElement).contains(event.target)
      ) {
        setShowOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div className="relative" ref={wrapperRef} style={{ zIndex: 1000 }}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setShowOptions(true)}
        onBlur={() => setTimeout(() => setShowOptions(false), 300)}
        className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-600 text-black bg-white"
        placeholder={placeholder}
      />
      {showOptions && (
        <ul
          className="absolute w-full mt-1 bg-white border border-gray-400 rounded-md shadow-xl z-[9999] overflow-auto"
          style={{
            maxHeight: '200px',
            top: '100%',
            left: 0
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <li
                key={index}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOptionClick(option);
                }}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm text-gray-800 border-b border-gray-200 last:border-b-0"
              >
                {displayFunction(option)}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-gray-500 text-sm">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default SearchableSelect;
