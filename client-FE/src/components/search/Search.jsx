import search from "../../assets/icons/search.svg";
import React, { useEffect, useState } from "react";
import "./search.css";

function Search(props) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [options, setOptions] = useState([]);
  const [searchOptions, setSearchOptions] = useState([]);

  const handleChange = (e) => {
    setSearchOptions(
      options.filter((option) => {
        return (
          option.name?.includes(e.target.value) ||
          option.email?.includes(e.target.value) ||
          option.phoneNumber?.includes(e.target.value)
        );
      })
    );
  };

  useEffect(() => {
    if (props.options) {
      setOptions([...props.options]);
      setSearchOptions([...props.options]);
    }
  }, [props.options]);

  const ref = React.createRef();

  function hideMenu(e) {
    if (showDropdown) {
      let rectBound = ref.current
        ? ref.current.getBoundingClientRect()
        : null;

      if (rectBound) {
        const { x, y, width, height } = rectBound;
        const mouseY = e.clientY;
        const mouseX = e.clientX;
        if (
          mouseY < y ||
          mouseY > y + height ||
          mouseX < x ||
          mouseX > x + width
        )
          setShowDropdown(false);
      }
    }
  }
  const handleKeyDown = (evt) => {
    evt = evt || window.event;
    var isEscape = false;
    if ("key" in evt) {
      isEscape = evt.key === "Escape" || evt.key === "Esc";
    } else {
      isEscape = evt.keyCode === 27;
    }
    if (isEscape) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.body.addEventListener("click", hideMenu);
    document.body.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.removeEventListener("click", hideMenu);
      document.body.removeEventListener("keydown", handleKeyDown);
    };
  }, [showDropdown]);

  const setSelectedItem = (option) => {
    console.log(option);
    props.addConversation && props.addConversation(option);
    if (props.options) setOptions([...props.options]);
    setShowDropdown(false);
  };
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      className="dropdownContainer"
    >
      <img src={search} alt="search" />
      <input
        placeholder="Search for friends"
        className="chatMenuInput"
        onChange={handleChange}
        onFocus={() => setShowDropdown(true)}
      />
      <div
        ref={ref}
        className={`dropdown ${showDropdown && "dropdownOpen"}`}
      >
        {searchOptions.map((option) => {
          return (
            option.email !== props.user.email && (
              <div
                key={option.email}
                className="dropdownOption"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedItem(option);
                }}
              >
                {option.name}
              </div>
            )
          );
        })}
      </div>
    </div>
  );
}

export default Search;
