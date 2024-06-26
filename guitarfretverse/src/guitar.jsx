import React from 'react';
import './App.css';
import Note from './note.jsx';
import GuitarData from './utils/guitarData.js';

const Guitar = ({pattern}) => {

    const testPattern = GuitarData.pentatonicBinary;
    const allNotes = GuitarData.allGuitarNotes;

    const fretNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    return(
        <div className="guitar">
            <div className='stringContainer'>
                <div className='notesContainer'>
                    {pattern.map((item, index) => {
                        if (index === 0) {
                            return (
                                <div key={index} className='notesNutContainer'>
                                    {allNotes[index].map((note, i) => (
                                        <Note key={i} note={note} active={item[i]} />
                                    ))}
                                </div>
                            );
                        } else {
                            return (
                                <div key={index} className='notesFretContainer'>
                                    {allNotes[index].map((note, i) => (
                                        <Note key={i} note={note} active={item[i]} />
                                    ))}
                                </div>
                            );
                        }
                    })}
                </div>
                <div className='string' id='estring'></div>
                <div className='string' id='astring'></div>
                <div className='string' id='dstring'></div>
                <div className='string' id='gstring'></div>
                <div className='string' id='bstring'></div>
                <div className='string' id='Estring'></div>
            </div>
            <div className="fretboard">
                <div className='fret' id='fret0'>
                </div>
                <div className='fret' id='fret1'>
                </div>
                <div className='fret' id='fret2'>
                </div>
                <div className='fret' id='fret3'>
                    <div className='fretdot' id='fretdotsingle'></div>
                </div>
                <div className='fret' id='fret4'>
                </div>
                <div className='fret' id='fret5'>
                    <div className='fretdot' id='fretdotsingle'></div>
                </div>
                <div className='fret' id='fret6'>
                </div>
                <div className='fret' id='fret7'>
                    <div className='fretdot' id='fretdotsingle'></div>
                </div>
                <div className='fret' id='fret8'>
                </div>
                <div className='fret' id='fret9'>
                    <div className='fretdot' id='fretdotsingle'></div>
                </div>
                <div className='fret' id='fret10'>
                </div>
                <div className='fret' id='fret11'>
                </div>
                <div className='fret' id='fret12'>
                    <div className='fretdot' id='fretdotdbl'></div>
                    <div className='fretdot' id='fretdotdbl'></div>
                </div>
            </div>
            <div className='fretMarkersContainer'>
                <div className='nutMarker'>0</div>
                {fretNumbers.map((number, index) => (
                    <div key={index} className='fretMarker'>{number.toString()}</div>
                ))}
            </div>
        </div>
        
    )
}

export default Guitar;