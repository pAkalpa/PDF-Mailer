// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn pdf_saver(pdf_data: HashMap<String, u8>) {
    print!("{:?}", pdf_data);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, pdf_saver])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
