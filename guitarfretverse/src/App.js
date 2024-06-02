import './App.css';
import Guitar from './guitar';
import DropdownMenu from './dropdown.jsx'
import Titles from './utils/titles.js';
import logo from './images/guitarfretverselogo.png';
import { useState, useEffect, createContext } from 'react';

export const MenuContext = createContext({
  options: {
    selectOption: null,
    selectKey: null,
    selectArpeggioType: null,
    selectScaleType: null,
  },
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
  })

  let keyMenu = true;
  let arpeggioMenu = true;
  let scaleMenu = true;

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
          <DropdownMenu menu={Titles.selectMenu}></DropdownMenu>
          {keyMenu ? <DropdownMenu menu={Titles.keyMenu}></DropdownMenu> : <div/>}
          {arpeggioMenu ? <DropdownMenu menu={Titles.arpeggioMenu}></DropdownMenu> : <div/>}
          {scaleMenu ? <DropdownMenu menu={Titles.scaleMenu}></DropdownMenu> : <div/>}
        </div>
        <Guitar></Guitar>
      </div>
    </div>
  );
}

export default App;
