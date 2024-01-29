struct Uniforms {color: vec4<f32>};
@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@fragment
fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
    // Use UV coordinates as color
    // uv.x is always 0, why?
    return vec4<f32>(uv.x, uv.y, 0.0, 1.0); // R and G from UV, full B and alpha
}
