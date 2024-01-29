game.wasm: src/lib.rs
	rustc +nightly \
	-C opt-level=s \
	-C strip=symbols \
	-C panic=abort \
	-C codegen-units=1 \
	-C debuginfo=0 \
	-C lto=true \
	-Z location-detail=none \
	--target wasm32-unknown-unknown \
	-o lib.wasm \
	src/lib.rs
	wasm-opt -Os lib.wasm -o lib.wasm # 5kb -> 4kb
