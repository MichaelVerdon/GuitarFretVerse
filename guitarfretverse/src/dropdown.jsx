import React, { useState, useContext } from 'react';
import './Dropdown.css';
import { MenuContext } from './App';
import Titles from './utils/titles.js'

function DropdownMenu({ menu }) {

  const { options, selectArpeggioType, changeArpeggioOption, selectScaleType, changeScaleOption } = useContext(MenuContext);
  const [selectedOption, changeSelection] = useState(menu.title);

  const changeSelectedItem = (item) => {
    changeSelection(item);
    console.log(options);
    for(let item in options){
      for(let menu of Titles){
        if(menu.content.includes(item)){

        }
      }
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

