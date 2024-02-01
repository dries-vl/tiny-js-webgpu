use glam::{Mat4, Vec3};

pub static mut PROJECTION: [f32; 16] = [0.0; 16];

pub fn create_view_proj_array() {
    // Set up a perspective projection matrix
    let projection_matrix = Mat4::perspective_rh_gl(
        core::f32::consts::PI / 4.0, // field of view in radians
        800.0 / 600.0,               // aspect ratio
        0.1,                         // near plane
        100.0                        // far plane
    );

    // Set up a view matrix
    let view_matrix = Mat4::look_at_rh(
        Vec3::new(0.0, 0.0, 5.0), // Camera is at (0, 0, 5), in World Space
        Vec3::new(0.0, 0.0, 0.0), // and looks at the origin
        Vec3::new(0.0, 1.0, 0.0)  // Head is up (set to 0,-1,0 to look upside-down)
    );

    // Combine them
    let view_proj_matrix = projection_matrix * view_matrix;

    // Convert viewProjMatrix into a flat array
    let mut view_proj_array: [f32; 16] = view_proj_matrix.to_cols_array();

    // Now, view_proj_array contains your combined view-projection matrix in the form of a flat array.
    // pointer to the array to be able to pass it to JS
    unsafe { PROJECTION = view_proj_array; }
}
