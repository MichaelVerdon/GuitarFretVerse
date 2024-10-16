import React from 'react';
import './Note.css';

const Note = ({note, active}) => {

    const noteMap = [
        {arg: "e", display: "E"},
        {arg: "f", display: "F"},
        {arg: "fsharp", display: "F#"},
        {arg: "g", display: "G"},
        {arg: "gsharp", display: "G#"},
        {arg: "a", display: "A"},
        {arg: "asharp", display: "A#"},
        {arg: "b", display: "B"},
        {arg: "c", display: "C"},
        {arg: "csharp", display: "C#"},
        {arg: "d", display: "D"},
        {arg: "dsharp", display: "D#"},
        {arg: "null", display:''}
    ];

    function getDisplayFromArgument(){
        for(let _note of noteMap){
            if(_note["arg"] === note){
                return _note["display"];
            }
        }
    }
    

    return(
        active ? 
        <div className='noteDot' id={note}>
            <div className='noteText'>{getDisplayFromArgument()}</div>
        </div> 
        :
        <div className='noteDot'></div>
    )
}

export default Note;