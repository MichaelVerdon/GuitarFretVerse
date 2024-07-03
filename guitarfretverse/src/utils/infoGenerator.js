import GuitarData from "./guitarData";

class InfoGenerator{
    constructor(key, option, kind){
        this.key = key;
        this.option = option;
        this.kind = kind;
        this.pattern = [];
        this.keyOptions = ["E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#"];
        this.modesList = ["Major", "Dorian", "Phyrgian", "Lydian", "Mixolydian", "Minor", "Locrian"]
    }
}

export default InfoGenerator;