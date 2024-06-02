import React, { useState, useContext } from 'react';
import './Dropdown.css';
import { MenuContext } from './App';

function DropdownMenu({ menu, menuType }) {
  const { changeSelectOption, changeSelectKey, changeArpeggioOption, changeScaleOption } = useContext(MenuContext);
  const [selectedOption, changeSelection] = useState(menu.title);

  const changeSelectedItem = (item) => {
    changeSelection(item);
    console.log(selectedOption)
    switch (menuType) {
      case "selectOption":
        changeSelectOption(item);
        break;
      case "keyOption":
        changeSelectKey(item);
        break;
      case "Arpeggio":
        changeArpeggioOption(item);
        break;
      case "Scale":
        changeScaleOption(item);
        break;
      default:
        break;
    }
  };

  function dropdownItem(itemName) {
    return (
      <div className='dropdownItem' onClick={() => changeSelectedItem(itemName)}>
        {itemName}
      </div>
    );
  }

  return (
    <div className="dropdown">
      <button className="dropbtn">{selectedOption}</button>
      <div className="dropdown-content">
        {menu.content.map((item, index) => (
          <div key={index}>{dropdownItem(item)}</div>
        ))}
      </div>
    </div>
  );
}

export default DropdownMenu;
