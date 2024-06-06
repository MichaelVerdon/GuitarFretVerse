import GuitarData from "./guitarData";

class NoteGenerator{
    constructor(key, option, kind){
        this.key = key;
        this.option = option;
        this.kind = kind;
        this.pattern = [];
        this.keyOptions = ["E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#"];
        this.modesList = ["Major", "Dorian", "Phyrgian", "Lydian", "Mixolydian", "Minor", "Locrian"]
        this.modeOffsets = [12, 10, 8, 7, 5, 3, 1]
    }

    generate(){
        //try{
            if(this.option === "All Notes"){
                this.pattern = GuitarData.allNotesBinary
            }
            else if(this.key !== null && this.kind !== null){
                this.selectPattern();
                let keyShiftIndex = this.keyOptions.indexOf(this.key)
                this.shiftKey(keyShiftIndex);
            }
            else{
                this.pattern = GuitarData.allNotesBinary;
            }
        //}
        //catch{
        //    console.log("Something went wrong");
        //}
    }

    selectPattern(){
        switch(this.option){
            case "Scale":
                this.getScale();
                break;
            case "Arpeggio":
                this.getArpeggio();
                break;
            default:
                this.pattern = GuitarData.allNotesBinary;
                break;
        }
    }

    getScale(){
        if(this.modesList.includes(this.kind)){
            let getShiftKey = this.modeOffsets[this.modesList.indexOf(this.kind)]; // Obtain from static list based on major scale.
            this.pattern = GuitarData.majorBinary;
            this.shiftKey(getShiftKey); //Shift to right mode of major scale.
        }
        switch(this.kind){
            case "Minor Pentatonic":
                this.pattern = GuitarData.minorPentatonicBinary;
                break;
            case "Major Pentatonic":
                this.pattern = GuitarData.minorPentatonicBinary;
                this.shiftKey(7);
                break;
            case "Blues Minor Pentatonic":
                this.pattern = GuitarData.bluesMinorBinary;
                break;
            case "Harmonic Minor":
                this.pattern = GuitarData.harmonicMinorBinary;
                break;
            case "Melodic Minor":
                this.pattern = GuitarData.melodicMinorBinary;
                break;
            default:
                this.pattern = GuitarData.allNotesBinary;
                break;
        }
    }

    getArpeggio(){
        switch(this.kind){
            case "Major":
                this.pattern = GuitarData.majorArpBinary;
                break;
            case "Minor":
                this.pattern = GuitarData.minorArpBinary;
                break;
            default:
                this.pattern = GuitarData.allNotesBinary;
                break;
        }
    }

    shiftKey(keyIndex) {
        console.log("Key Index = " + keyIndex);
        let tempPattern = this.deepCloneArray(this.pattern);
        tempPattern.pop();
        // Shift values up by key offset with wrap-around
        for (let i = 0; i < tempPattern.length; i++) {
            for (let j = 0; j < tempPattern[i].length; j++) {
                // Modulo arithmetic for wrapping around
                let shiftedIndex = (i - keyIndex + this.pattern.length) % this.pattern.length;
                // Special Cases where shiftedIndex alone produce a wrong result.
                if(i === 0){
                    tempPattern[i][j] = this.pattern[tempPattern.length - keyIndex][j]
                }
                else if(i < keyIndex){
                    let targetIndex = i + this.pattern.length - keyIndex - 1;
                    tempPattern[i][j] = this.pattern[targetIndex][j];
                }
                else{
                    tempPattern[i][j] = this.pattern[shiftedIndex][j];
                }
                
            }
        }
        tempPattern.push(tempPattern[0]);
        this.pattern = tempPattern;
    }

    deepCloneArray(arr) {
        return arr.map(item => Array.isArray(item) ? this.deepCloneArray(item) : item);
    }

    getPattern(){return this.pattern}


}

export default NoteGenerator;