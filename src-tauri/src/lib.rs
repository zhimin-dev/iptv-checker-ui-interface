// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::process::Command;
use std::sync::Mutex;
use std::{env, fs};
use tauri::State;
use tauri::AppHandle;

struct AppState {
    ffmpeg_path: Mutex<String>,
    ffprobe_path: Mutex<String>,
}

#[tauri::command]
fn now_mod() -> i32 {
    1
}

#[tauri::command]
fn api_base(app: AppHandle) -> Result<String, String> {
    Ok(read_api_base_from_runtime_file(&app).unwrap_or_else(|| "http://127.0.0.1:8089".to_string()))
}

fn read_api_base_from_runtime_file(app: &AppHandle) -> Option<String> {
    let mut runtime_files = vec![];

    if let Ok(current_dir) = env::current_dir() {
        runtime_files.push(current_dir.join("config").join("runtime").join("server-info.json"));
    }

    if let Ok(app_local_data_dir) = app.path().app_local_data_dir() {
        runtime_files.push(
            app_local_data_dir
                .join("config")
                .join("runtime")
                .join("server-info.json"),
        );
    }

    if let Ok(app_data_dir) = app.path().app_data_dir() {
        runtime_files.push(
            app_data_dir
                .join("config")
                .join("runtime")
                .join("server-info.json"),
        );
    }

    for runtime_file in runtime_files {
        let raw = match fs::read_to_string(&runtime_file) {
            Ok(raw) => raw,
            Err(_) => continue,
        };
        let value = match serde_json::from_str::<serde_json::Value>(&raw) {
            Ok(value) => value,
            Err(_) => continue,
        };

        if let Some(api_base) = value.get("api_base").and_then(|item| item.as_str()) {
            return Some(api_base.trim_end_matches('/').to_string());
        }

        if let Some(host) = value.get("host").and_then(|item| item.as_str()) {
            if !host.is_empty() {
                return Some(host.trim_end_matches('/').to_string());
            }
        }

        if let Some(port) = value.get("port").and_then(|item| item.as_u64()) {
            return Some(format!("http://127.0.0.1:{}", port));
        }
    }

    None
}

fn find_ffmpeg_path() -> Result<(String, String), String> {
    // Try to find ffmpeg and ffprobe in PATH
    let ffmpeg_output = Command::new("which")
        .arg("ffmpeg")
        .output()
        .map_err(|e| format!("Error finding ffmpeg: {}", e))?;

    let ffprobe_output = Command::new("which")
        .arg("ffprobe")
        .output()
        .map_err(|e| format!("Error finding ffprobe: {}", e))?;

    if !ffmpeg_output.status.success() || !ffprobe_output.status.success() {
        return Err("FFmpeg or FFprobe not found in PATH".to_string());
    }

    let ffmpeg_path = String::from_utf8_lossy(&ffmpeg_output.stdout)
        .trim()
        .to_string();
    let ffprobe_path = String::from_utf8_lossy(&ffprobe_output.stdout)
        .trim()
        .to_string();

    Ok((ffmpeg_path, ffprobe_path))
}

#[tauri::command]
fn check_ffmpeg(state: State<AppState>) -> Result<bool, String> {
    let ffmpeg_path = state.ffmpeg_path.lock().unwrap();
    let output = Command::new(&*ffmpeg_path)
        .arg("-version")
        .output()
        .map_err(|e| format!("Error executing FFmpeg command: {}", e))?;

    Ok(output.status.success())
}

#[tauri::command]
fn get_video_info(url: String, state: State<AppState>) -> Result<serde_json::Value, String> {
    let ffprobe_path = state.ffprobe_path.lock().unwrap();
    let output = Command::new(&*ffprobe_path)
        .args(&[
            "-v",
            "quiet",
            "-print_format",
            "json",
            "-show_format",
            "-show_streams",
            &url,
        ])
        .output()
        .map_err(|e| format!("Error executing FFprobe command: {}", e))?;

    if output.status.success() {
        let json_str = String::from_utf8(output.stdout)
            .map_err(|e| format!("Invalid UTF-8 sequence: {}", e))?;

        serde_json::from_str(&json_str).map_err(|e| format!("Error parsing JSON: {}", e))
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
        .invoke_handler(tauri::generate_handler![now_mod, api_base])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
