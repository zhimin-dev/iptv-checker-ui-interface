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

#[tauri::command]
fn get_video_info(url: String) -> Result<serde_json::Value, String> {
    let output = Command::new("ffprobe")
        .args(&[
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            &url
        ])
        .output()
        .map_err(|e| format!("Error executing FFprobe command: {}", e))?;

    if output.status.success() {
        let json_str = String::from_utf8(output.stdout)
            .map_err(|e| format!("Invalid UTF-8 sequence: {}", e))?;
            
        serde_json::from_str(&json_str)
            .map_err(|e| format!("Error parsing JSON: {}", e))
    } else {
        let error = String::from_utf8_lossy(&output.stderr);
        Err(format!("FFprobe error: {}", error))
    }
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![now_mod, check_ffmpeg, get_video_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
