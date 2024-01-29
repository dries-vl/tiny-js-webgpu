const PHI = (1 + 2.23606797749979) / 2 // 2.236 is sqrt(5)

export const cubeVertices = new Float32Array([
    // Front face
    -1, PHI, 0, // v0
    -1, PHI, 0,
    1, PHI, 0,
    -1, -PHI, 0,
    1, -PHI, 0,
    0, -1, PHI,
    0, 1, PHI,
    0, -1, -PHI,
    0, 1, -PHI,
    PHI, 0, -1,
    PHI, 0, 1,
    -PHI, 0, -1,
    -PHI, 0, 1
]);

export const cubeIndices = new Uint16Array([
        11, 5, 0,
        5, 1, 0,
        1, 7, 0,
        7, 10, 0,
        10, 11, 0,
        5, 9, 1,
        11, 4, 5,
        10, 2, 11,
        7, 6, 10,
        1, 8, 7,
        9, 4, 3,
        4, 2, 3,
        2, 6, 3,
        6, 8, 3,
        8, 9, 3,
        9, 5, 4,
        4, 11, 2,
        2, 10, 6,
        6, 7, 8,
        1, 9, 8
    ])
;
