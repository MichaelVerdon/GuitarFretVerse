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
  }, [MenuContext])

  let keyMenu = false;
  let arpeggioMenu = false;
  let scaleMenu = false;

  const [selectOption, changeSelectOption] = useState("All Notes");
  const [selectKey, changeSelectKey] = useState("Key");
  const [selectArpeggioType, changeArpeggioOption] = useState("Type");
  const [selectScaleType, changeScaleOption] = useState("Type");
  

  return (
    <div className="App">
      <div className='appContainer'>
        <div className='logoContainer'>
          <img src={logo} className='logo'></img>
        </div>
        <div className='menuContainer'>
          <DropdownMenu menu={Titles.selectMenu} menuType={"selectOption"}></DropdownMenu>
          {(selectOption !== "All Notes") ? <DropdownMenu menu={Titles.keyMenu} menuType={"keyOption"}></DropdownMenu> : <div/>}
          {arpeggioMenu ? <DropdownMenu menu={Titles.arpeggioMenu} menuType={"Arpeggio"}></DropdownMenu> : <div/>}
          {scaleMenu ? <DropdownMenu menu={Titles.scaleMenu} menuType={"Scale"}></DropdownMenu> : <div/>}
        </div>
        <Guitar></Guitar>
      </div>
    </div>
  );
}

export default App;
