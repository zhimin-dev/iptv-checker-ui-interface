// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::process::Command;

#[tauri::command]
fn now_mod() -> i32 {
    1
}
#[tauri::command]
fn check_ffmpeg() -> Result<bool, String> {
    let output = Command::new("ffmpeg")
        .arg("-version")
        .output()
        .map_err(|e| format!("Error executing FFmpeg command: {}", e))?;

    if output.status.success() {
        Ok(true)
    } else {
        Ok(false)
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![now_mod, check_ffmpeg])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
