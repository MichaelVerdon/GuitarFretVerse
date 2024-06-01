const GuitarData = {
    allGuitarNotes: [
        ["e", "b", "g", "d", "a", "e"],
        ["f", "c", "gsharp", "dsharp", "asharp", "f"],
        ["fsharp", "csharp", "a", "e", "b", "fsharp"],
        ["g", "d", "asharp", "f", "c", "g"],
        ["gsharp", "dsharp", "b", "fsharp", "csharp", "gsharp"],
        ["a", "e", "c", "g", "d", "a"],
        ["asharp", "f", "csharp", "gsharp", "dsharp", "asharp"],
        ["b", "fsharp", "d", "a", "e", "b"],
        ["c", "g", "dsharp", "asharp", "f", "c"],
        ["csharp", "gsharp", "e", "b", "fsharp", "csharp"],
        ["d", "a", "f", "c", "g", "d"],
        ["dsharp", "asharp", "fsharp", "csharp", "gsharp", "dsharp"],
        ["e", "b", "g", "d", "a", "e"]
      ],
  
    allNotesBinary: [
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1]
    ],

    pentatonicBinary: [
        [1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 0],
        [1, 1, 0, 0, 0, 1],
        [0, 0, 1, 0, 0, 0],
        [1, 1, 0, 1, 1, 1],
        [0, 0, 0, 0, 0, 0],
        [1, 0, 1, 1, 1, 1],
        [0, 1, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [1, 1, 0, 0, 1, 1],
        [0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1]
    ],    
    
  
    guitarKeys: ["e", "f", "fsharp", "g", "gsharp", "a", "asharp", "b", "c", "csharp", "d", "dsharp"]
  };

export default GuitarData;