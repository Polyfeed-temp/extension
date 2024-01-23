import React, {useState, useRef, useEffect} from "react";

type OptionType = {
  [key: string]: any;
};

type SearchableSelectProps = {
  options: OptionType[];
  displayFunction: (option: OptionType) => string;
  filterFunction: (option: OptionType, searchTerm: string) => boolean;
  onSelectFunction: (selectedUnit: any) => void;
  
};

function SearchableSelect({
  options,
  displayFunction,
  filterFunction,
  onSelectFunction,
}: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showOptions, setShowOptions] = useState<boolean>(false);

  const filteredOptions = options.filter((option) =>
    filterFunction(option, searchTerm)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowOptions(true);
  };

  const handleOptionClick = (option: OptionType) => {
    setSearchTerm(displayFunction(option));
    setShowOptions(false);
    onSelectFunction(option);
  };
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event: {target: any}) {
      if (
        wrapperRef.current &&
        !!(wrapperRef.current as HTMLElement).contains(event.target)
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
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setShowOptions(true)}
        onBlur={() => setTimeout(() => setShowOptions(false), 100)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        placeholder="Search..."
      />
      {showOptions && (
        <ul className="absolute z-10 w-full py-1 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option, index) => (
            <li
              key={index}
              onClick={() => handleOptionClick(option)}
              className=" px-3 py-2 cursor-pointer hover:bg-gray-100"
            >
              {displayFunction(option)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchableSelect;
