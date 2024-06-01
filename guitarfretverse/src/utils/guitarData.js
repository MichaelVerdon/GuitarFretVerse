const GuitarData = {
    allGuitarNotes: [
        ["e", "a", "d", "g", "b", "e"],
        ["f", "asharp", "dsharp", "gsharp", "c", "f"],
        ["fsharp", "b", "e", "asharp", "csharp", "fsharp"],
        ["g", "c", "f", "a", "d", "g"],
        ["gsharp", "csharp", "fsharp", "asharp", "dsharp", "gsharp"],
        ["a", "d", "g", "b", "e", "a"],
        ["asharp", "dsharp", "gsharp", "c", "f", "asharp"],
        ["b", "e", "a", "csharp", "fsharp", "b"],
        ["c", "f", "asharp", "d", "g", "c"],
        ["csharp", "fsharp", "b", "dsharp", "gsharp", "csharp"],
        ["d", "g", "c", "e", "a", "d"],
        ["dsharp", "gsharp", "csharp", "f", "asharp", "dsharp"],
        ["e", "a", "d", "g", "b", "e"]
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
        [0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 0],
        [1, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1]
    ],    
    
  
    guitarKeys: ["e", "f", "fsharp", "g", "gsharp", "a", "asharp", "b", "c", "csharp", "d", "dsharp"]
  };

export default GuitarData;