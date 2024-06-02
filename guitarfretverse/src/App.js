import './App.css';
import Guitar from './guitar';
import DropdownMenu from './dropdown.jsx'
import Titles from './utils/titles.js';
import logo from './images/guitarfretverselogo.png';
import { useState, useEffect, createContext } from 'react';

export const MenuContext = createContext({
  selectOption: null,
  selectKey: null,
  selectArpeggioType: null,
  selectScaleType: null,
  changeSelectOption: () => {},
  changeSelectKey: () => {},
  changeArpeggioOption: () => {},
  changeScaleOption: () => {}
});


function App() {

  useEffect(() => {
    console.log("useEffect Working")
    console.log("Current Selection: " + selectOption)
    switch(selectOption){
      case "All Notes":
        keyMenu = false;
        arpeggioMenu = false;
        scaleMenu = false;
      case "Arpeggio":
        keyMenu = true;
        arpeggioMenu = true;
        scaleMenu = false;
      case "Scale":
        keyMenu = true;
        arpeggioMenu = false;
        scaleMenu = true;
    }
  })

  let keyMenu = false;
  let arpeggioMenu = false;
  let scaleMenu = false;

  const [selectOption, changeSelectOption] = useState("All Notes");
  const [selectKey, changeSelectKey] = useState("Key");
  const [selectArpeggioType, changeArpeggioOption] = useState("Type");
  const [selectScaleType, changeScaleOption] = useState("Type");
  

  return (
    <MenuContext.Provider value={{ selectOption, selectKey, selectArpeggioType, selectScaleType, changeSelectOption, changeSelectKey, changeArpeggioOption, changeScaleOption}}>
      <div className="App">
        <div className='appContainer'>
          <div className='logoContainer'>
            <img src={logo} className='logo'></img>
          </div>
          <div className='menuContainer'>
            <DropdownMenu menu={Titles.selectMenu} menuType={"selectOption"}></DropdownMenu>
            {(selectOption !== "All Notes") ? <DropdownMenu menu={Titles.keyMenu} menuType={"Key"}></DropdownMenu> : <div/>}
            {(selectOption === "Arpeggios") ? <DropdownMenu menu={Titles.arpeggioMenu} menuType={"Arpeggio"}></DropdownMenu> : <div/>}
            {(selectOption === "Scales") ? <DropdownMenu menu={Titles.scaleMenu} menuType={"Scale"}></DropdownMenu> : <div/>}
            <button className='applyButton'>Update Fretboard</button>
          </div>
          <Guitar></Guitar>
        </div>
      </div>
    </MenuContext.Provider>
  );
}

export default App;
