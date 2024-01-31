const PHI = (1 + 2.23606) / 2 // 2.236 is sqrt(5)

export const cubeVertices = new Float32Array([
    // Vertex positions (x, y, z) followed by UV coordinates (u, v)
    // Calculate u, v based on spherical coordinates
    ...calculateUV(-1, PHI, 0),
    ...calculateUV(1, PHI, 0),
    ...calculateUV(-1, -PHI, 0),
    ...calculateUV(1, -PHI, 0),
    ...calculateUV(0, -1, PHI),
    ...calculateUV(0, 1, PHI),
    ...calculateUV(0, -1, -PHI),
    ...calculateUV(0, 1, -PHI),
    ...calculateUV(PHI, 0, -1),
    ...calculateUV(PHI, 0, 1),
    ...calculateUV(-PHI, 0, -1),
    ...calculateUV(-PHI, 0, 1)
]);

function calculateUV(x, y, z) {
    const length = Math.sqrt(x * x + y * y + z * z);
    const u = 0.5 + (Math.atan2(z, x) / (2 * Math.PI));
    const v = 0.5 - (Math.asin(y / length) / Math.PI);
    return [x, y, z, u, v];
}

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
export const cubeIndicesLines = convertTrianglesToLines(cubeIndices);

function convertTrianglesToLines(triangleIndices) {
    const lineIndices = new Set();  // Using a Set to avoid duplicates

    for (let i = 0; i < triangleIndices.length; i += 3) {
        const a = triangleIndices[i];
        const b = triangleIndices[i + 1];
        const c = triangleIndices[i + 2];

        // Add each edge to the set
        lineIndices.add(Math.min(a, b) + "_" + Math.max(a, b));
        lineIndices.add(Math.min(b, c) + "_" + Math.max(b, c));
        lineIndices.add(Math.min(c, a) + "_" + Math.max(c, a));
    }

    // Convert set back to array
    const lineArray = Array.from(lineIndices).map(item => item.split("_").map(Number));
    return new Uint16Array(lineArray.flat());
}
