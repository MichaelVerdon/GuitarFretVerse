import GuitarData from "./guitarData";

class NoteGenerator{
    constructor(key, option, kind){
        this.key = key,
        this.option = option,
        this.kind = kind,
        this.pattern = [];
    }

    generate(){
        this.selectPattern();
    }

    selectPattern(){
        switch(this.option){
            case "All Notes":
                this.pattern = GuitarData.allNotesBinary;
            case "Scale":
            case "Arpeggio":
            default:
                this.pattern = GuitarData.allNotesBinary;
        }
    }

    get pattern(){return this.pattern}


}

export default NoteGenerator;