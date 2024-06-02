import './App.css';
import Guitar from './guitar';
import DropdownMenu from './dropdown.jsx'
import Titles from './utils/titles.js';
import logo from './images/guitarfretverselogo.png';
import { useState, useEffect } from 'react';

function App() {

  const keyMenu = true;
  const arpeggioMenu = true;
  const scaleMenu = true;

  const [selectOption, changeSelectOption] = useState("All Notes");
  

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
