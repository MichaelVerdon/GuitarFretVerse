import GuitarInfo from "./guitarInfo";

class InfoGenerator {
    constructor(key, option, kind) {
        this.key = key;
        this.option = option;
        this.kind = kind;

        this.title = null;
        this.intervals = null;
        this.info = null;

        this.final = [];
    }

    generate() {
        this.createTitle();
        this.createInfo();
        this.final = [this.title, this.intervals, this.info];
    }

    getInfo() {
        return this.final;
    }

    createTitle() {
        if (this.option !== "All Notes") {
            this.title = `${this.key} ${this.kind} ${this.option}`;
        }
        else {
            this.title = 'Standard Tuning';
        }

    }

    createInfo() {
        if (this.option === "Scale") {
            this.searchScale();
        }
        else if (this.option === "Arpeggio") {
            this.searchArpeggio();
        }
        else if (this.option === "Genre") {
            this.searchGenre();
        }
        else {
            this.intervals = GuitarInfo.strings;
            this.info = GuitarInfo.tuningInfo;
        }
    }

    searchScale() {
        switch (this.kind) {
            case "Major":
                this.intervals = GuitarInfo.majorIntervals;
                this.info = GuitarInfo.majorInfo;
                break;
            case "Dorian":
                this.intervals = GuitarInfo.dorianIntervals;
                this.info = GuitarInfo.dorianInfo;
                break;
            case "Phyrgian":
                this.intervals = GuitarInfo.phrygianIntervals;
                this.info = GuitarInfo.phrygianInfo;
                break;
            case "Lydian":
                this.intervals = GuitarInfo.lydianIntervals;
                this.info = GuitarInfo.lydianInfo;
                break;
            case "Mixolydian":
                this.intervals = GuitarInfo.mixolydianIntervals;
                this.info = GuitarInfo.mixolydianInfo;
                break;
            case "Minor":
                this.intervals = GuitarInfo.minorIntervals;
                this.info = GuitarInfo.minorInfo;
                break;
            case "Locrian":
                this.intervals = GuitarInfo.locrianIntervals;
                this.info = GuitarInfo.locrianInfo;
                break;
            case "Minor Pentatonic":
                this.intervals = GuitarInfo.pentatonicMinorIntervals;
                this.info = GuitarInfo.pentatonicMinorInfo;
                break;
            case "Major Pentatonic":
                this.intervals = GuitarInfo.pentatonicMajorIntervals;
                this.info = GuitarInfo.pentatonicMinorInfo;
                break;
            case "Blues Minor Pentatonic":
                this.intervals = GuitarInfo.bluesScaleIntervals;
                this.info = GuitarInfo.bluesScaleInfo;
                break;
            case "Harmonic Minor":
                this.intervals = GuitarInfo.harmonicMinorIntervals;
                this.info = GuitarInfo.harmonicMinorInfo;
                break;
            case "Melodic Minor":
                this.intervals = GuitarInfo.melodicMinorIntervals;
                this.info = GuitarInfo.melodicMinorInfo;
                break;
            default:
                this.intervals = GuitarInfo.strings;
                this.info = GuitarInfo.tuningInfo;
                break;
        }
    }

    searchArpeggio() {
        switch (this.kind) {
            case "Major":
                this.intervals = GuitarInfo.majorArpeggioIntervals;
                this.info = GuitarInfo.majorArpeggioInfo;
                break;
            case "Minor":
                this.intervals = GuitarInfo.minorArpeggioIntervals;
                this.info = GuitarInfo.minorArpeggioInfo;
                break;
            case "Maj7":
                this.intervals = GuitarInfo.maj7ArpeggioIntervals;
                this.info = GuitarInfo.maj7ArpeggioInfo;
                break;
            case "Min7":
                this.intervals = GuitarInfo.min7ArpeggioIntervals;
                this.info = GuitarInfo.min7ArpeggioInfo;
                break;
            case "Diminished":
                this.intervals = GuitarInfo.diminishedArpeggioIntervals;
                this.info = GuitarInfo.diminishedArpeggioInfo;
                break;
            default:
                this.intervals = GuitarInfo.strings;
                this.info = GuitarInfo.tuningInfo;
                break;
        }
    }

    searchGenre() {
        switch (this.kind) {
            case "Blues":
                this.intervals = GuitarInfo.bluesIntervals;
                this.info = GuitarInfo.bluesInfo;
                break;
        }
    }

    searchLick() {
        switch (this.kind) {
            case "B.B. King Box":
                this.intervals = GuitarInfo.bbKingBoxIntervals;
                this.info = GuitarInfo.bbKingBoxInfo;
                break;
        }

    }

}

export default InfoGenerator;