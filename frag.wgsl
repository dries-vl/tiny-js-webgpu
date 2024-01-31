struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) tex_coords: vec2<f32>,
};

@fragment
fn main(VERTEX: VertexOutput) -> @location(0) vec4<f32> {
    return vec4<f32>(VERTEX.tex_coords, 0.0, 1.0);
}
