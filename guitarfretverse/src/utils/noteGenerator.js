import GuitarData from "./guitarData";

class NoteGenerator{
    constructor(key, option, kind){
        this.key = key,
        this.option = option,
        this.kind = kind,
        this.pattern = [];
    }

    selectPattern(){
        switch(this.option){
            case "all_notes":
                this.pattern = GuitarData.allNotesBinary;
            case "scale":
            case "arpeggio":
            default:
                this.pattern = GuitarData.allNotesBinary;
        }
    }

    get pattern(){return this.pattern}


}

export default NoteGenerator;