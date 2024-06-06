import './App.css';
import Guitar from './guitar';
import DropdownMenu from './dropdown.jsx'
import Titles from './utils/titles.js';
import logo from './images/guitarfretverselogo.png';
import { useState, useEffect, createContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NoteGenerator from './utils/noteGenerator.js';

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

  const [genKey, changeGenKey] = useState("A");
  const [genSelect, changeGenSelect] = useState("All Notes");
  const [genType, changeGenType] = useState("Dorian");

  const generator = new NoteGenerator(genKey, genSelect, genType);
  generator.generate();
  let pattern = generator.getPattern();

  useEffect(() => {
    changeSelectOption(selectOption);
    changeSelectKey(selectKey);
    changeArpeggioOption(selectArpeggioType);
    changeScaleOption(selectScaleType);
    console.log(selectOption, selectKey, selectArpeggioType, selectScaleType);
  })

  const [selectOption, changeSelectOption] = useState("All Notes");
  const [selectKey, changeSelectKey] = useState("Key");
  const [selectArpeggioType, changeArpeggioOption] = useState("Type");
  const [selectScaleType, changeScaleOption] = useState("Type");


  const notify = () => toast("Please pick a valid combination!");

  function handleUpdateClick(){
    if(checkUpdateValid()){
      console.log("do stuff");
      changeGenKey(selectKey);
      changeGenSelect(selectOption);
      switch(selectOption){
        case "Scale":
          changeGenType(selectScaleType);
          break;
        case "Arpeggio":
          changeGenType(selectArpeggioType);
          break;
        default:
          changeGenType(selectScaleType);
      }
    }
    else{
      notify();
    }
  }

  function checkUpdateValid(){
    if(Titles.selectMenu.content.includes(selectOption)){
      if(selectOption === "All Notes"){
        return true;
      }
      else if(Titles.keyMenu.content.includes(selectKey)){
        if(selectArpeggioType !== "Type" && selectOption === "Arpeggio"){
          return true;
        }
        else if(selectScaleType !== "Type" && selectOption === "Scale"){
          return true;
        }
      }
    }
    console.log("not a valid combo");
    return false;
    
  }

  return (
    <MenuContext.Provider value={{ selectOption, selectKey, selectArpeggioType, selectScaleType, changeSelectOption, changeSelectKey, changeArpeggioOption, changeScaleOption}}>
      <ToastContainer></ToastContainer>
      <div className="App">
        <div className='appContainer'>
          <div className='logoContainer'>
            <img src={logo} className='logo'></img>
          </div>
          <div className='menuContainer'>
            <DropdownMenu menu={Titles.selectMenu} menuType={"selectOption"}></DropdownMenu>
            {(selectOption !== "All Notes") ? <DropdownMenu menu={Titles.keyMenu} menuType={"Key"}></DropdownMenu> : <div/>}
            {(selectOption === "Arpeggio") ? <DropdownMenu menu={Titles.arpeggioMenu} menuType={"Arpeggio"}></DropdownMenu> : <div/>}
            {(selectOption === "Scale") ? <DropdownMenu menu={Titles.scaleMenu} menuType={"Scale"}></DropdownMenu> : <div/>}
            <button className='applyButton' onClick={handleUpdateClick}>Update Fretboard</button>
          </div>
          <Guitar pattern={pattern}></Guitar>
        </div>
      </div>
    </MenuContext.Provider>
  );
}

export default App;
