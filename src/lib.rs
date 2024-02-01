#![no_main]

use crate::matrices::PROJECTION;

pub mod matrices;

#[allow(dead_code)]
extern "C" {
    fn myJavaScriptFunction(thing: &'static mut MyStruct);
}

static mut THING: MyStruct = MyStruct { field1: 14, field2: 13.2 };

#[no_mangle]
pub unsafe extern "C" fn myExportedWasmFunction() {
    myJavaScriptFunction(&mut THING);
}

#[no_mangle]
pub unsafe extern "C" fn get_view_proj_array() -> &'static mut [f32; 16] {
    matrices::create_view_proj_array();
    &mut PROJECTION
}

#[repr(C)]
pub struct MyStruct {
    field1: u32,
    field2: f32,
}
