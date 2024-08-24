// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn now_mod() -> i32 {
   1
}

#[tauri::command]
fn now_system() -> i32{
  if cfg!(target_os = "windows") {
    1
  }else{
    0
  }
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![now_mod,now_system])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
