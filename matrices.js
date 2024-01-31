const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();
export const viewProjMatrix = mat4.create();

// Set up a perspective projection matrix
mat4.perspective(projectionMatrix,
    Math.PI / 4, // field of view in radians
    800 / 600, // aspect ratio
    0.1, // near plane
    100.0 // far plane
);

// Set up a view matrix
mat4.lookAt(viewMatrix,
    [0, 0, 5], // Camera is at (0, 0, 5), in World Space
    [0, 0, 0], // and looks at the origin
    [0, 1, 0]  // Head is up (set to 0,-1,0 to look upside-down)
);

// Combine them
mat4.multiply(viewProjMatrix, projectionMatrix, viewMatrix);

// Now, viewProjMatrix contains your combined view-projection matrix.
