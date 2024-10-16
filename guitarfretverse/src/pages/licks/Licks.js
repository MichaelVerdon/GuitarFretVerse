import './licks.css';
import Guitar from './guitar';
import DropdownMenu from './components/dropdown/dropdown.jsx';
import Titles from './utils/titles.js';
import logo from './images/guitarfretverselogo.png';
import { useState, useEffect, createContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NoteGenerator from './utils/noteGenerator.js';
import InfoGenerator from './utils/infoGenerator.js';
import InfoPanel from './components/info/info.jsx';
import NavBar from './nav/nav.jsx';

export const MenuContext = createContext({
    selectOption: null,
    selectKey: null,
    selectArpeggioType: null,
    selectScaleType: null,
    changeSelectOption: () => { },
    changeSelectKey: () => { },
    changeArpeggioOption: () => { },
    changeScaleOption: () => { }
});


function Licks() {

    const [genKey, changeGenKey] = useState(null);
    const [genSelect, changeGenSelect] = useState("All Notes");
    const [genType, changeGenType] = useState(null);

    // Make pattern to populate interactive fretboard
    const generator = new NoteGenerator(genKey, genSelect, genType);
    generator.generate();
    let pattern = generator.getPattern();

    // Generate Info about selected option
    const infoGenerator = new InfoGenerator(genKey, genSelect, genType);
    infoGenerator.generate();
    let info = infoGenerator.getInfo();

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

    function handleUpdateClick() {
        if (checkUpdateValid()) {
            console.log(selectKey, selectOption, selectScaleType, selectArpeggioType);
            changeGenKey(selectKey);
            changeGenSelect(selectOption);
            switch (selectOption) {
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
        else {
            notify();
        }
    }

    function checkUpdateValid() {
        if (Titles.selectMenu.content.includes(selectOption)) {
            if (selectOption === "All Notes") {
                return true;
            }
            else if (Titles.keyMenu.content.includes(selectKey)) {
                if (selectArpeggioType !== "Type" && selectOption === "Arpeggio") {
                    return true;
                }
                else if (selectScaleType !== "Type" && selectOption === "Scale") {
                    return true;
                }
            }
        }
        console.log("not a valid combo");
        return false;

    }

    return (
        <MenuContext.Provider value={{ selectOption, selectKey, selectArpeggioType, selectScaleType, changeSelectOption, changeSelectKey, changeArpeggioOption, changeScaleOption }}>
            <ToastContainer></ToastContainer>
            <div className="Licks">
                <div className='licksContainer'>
                    <div className='logoContainer'>
                        <img src={logo} className='logo'></img>
                    </div>
                    <div className='menuContainer'>
                        <DropdownMenu menu={Titles.selectMenu} menuType={"selectOption"}></DropdownMenu>
                        {(selectOption !== "All Notes") ? <DropdownMenu menu={Titles.keyMenu} menuType={"Key"}></DropdownMenu> : <div />}
                        {(selectOption === "Arpeggio") ? <DropdownMenu menu={Titles.arpeggioMenu} menuType={"Arpeggio"}></DropdownMenu> : <div />}
                        {(selectOption === "Scale") ? <DropdownMenu menu={Titles.scaleMenu} menuType={"Scale"}></DropdownMenu> : <div />}
                        <button className='applyButton' onClick={handleUpdateClick}>Update Fretboard</button>
                    </div>
                    <NavBar />
                    <Guitar pattern={pattern}></Guitar>
                </div>
                <InfoPanel infoArray={info}></InfoPanel>
            </div>
        </MenuContext.Provider>
    );
}

export default App;
