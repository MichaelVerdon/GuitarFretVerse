import React from 'react';
import './App.css';
import Note from './note.jsx';
import GuitarData from './utils/guitarData.js';

const Guitar = () => {

    const testPattern = GuitarData.allNotesBinary;
    const allNotes = GuitarData.allGuitarNotes;

    const preparePattern = () => {

    }

    return(
        <div className="guitar">
            <div className='notesContainer'>
                {testPattern.map((item, index) => {
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
            <div className='stringContainer'>
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
        </div>
    )
}

export default Guitar;