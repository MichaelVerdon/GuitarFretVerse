import React, { useState } from 'react';
import './Dropdown.css';

function DropdownMenu({ menu }) {
  const [selectedOption, changeSelection] = useState(menu.title);

  const changeSelectedItem = (item) => {
    changeSelection(item);
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

