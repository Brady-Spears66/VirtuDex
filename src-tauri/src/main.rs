// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use sqlx::{SqlitePool};
use tauri::{command, State, Manager};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use tokio::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Person {
    pub id: i64,
    pub name: String,
    pub title: Option<String>,
    pub company: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub tags: Option<String>,
    pub notes: Option<String>,
    pub date_met: Option<String>,
    pub location_met: Option<String>,
    pub linkedin: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewPerson {
    pub name: String,
    pub title: Option<String>,
    pub company: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub tags: Option<String>,
    pub notes: Option<String>,
    pub date_met: Option<String>,
    pub location_met: Option<String>,
    pub linkedin: Option<String>,
}

type DbPool = Mutex<SqlitePool>;

#[command]
async fn get_people(pool: State<'_, DbPool>) -> Result<Vec<Person>, String> {
    let pool = pool.lock().await;
    
    let rows = sqlx::query_as::<_, Person>("SELECT * FROM people")
        .fetch_all(&*pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(rows)
}

#[command]
async fn search_people(pool: State<'_, DbPool>, search_query: String, search_field: String) -> Result<Vec<Person>, String> {
    let pool = pool.lock().await;
    
    let (sql_query, search_pattern) = match search_field.as_str() {
        "name" => ("SELECT * FROM people WHERE name LIKE ?", format!("%{}%", search_query)),
        "email" => ("SELECT * FROM people WHERE email LIKE ?", format!("%{}%", search_query)),
        "company" => ("SELECT * FROM people WHERE company LIKE ?", format!("%{}%", search_query)),
        "title" => ("SELECT * FROM people WHERE title LIKE ?", format!("%{}%", search_query)),
        "location" => ("SELECT * FROM people WHERE location_met LIKE ?", format!("%{}%", search_query)),
        "notes" => ("SELECT * FROM people WHERE notes LIKE ?", format!("%{}%", search_query)),
        "all" | _ => (
            "SELECT * FROM people WHERE 
                name LIKE ? OR 
                email LIKE ? OR 
                company LIKE ? OR 
                title LIKE ? OR 
                location_met LIKE ? OR 
                notes LIKE ? OR
                phone LIKE ? OR
                tags LIKE ? OR
                linkedin LIKE ?",
            format!("%{}%", search_query)
        ),
    };

    let rows = if search_field == "all" {
        sqlx::query_as::<_, Person>(sql_query)
            .bind(&search_pattern)
            .bind(&search_pattern)
            .bind(&search_pattern)
            .bind(&search_pattern)
            .bind(&search_pattern)
            .bind(&search_pattern)
            .bind(&search_pattern)
            .bind(&search_pattern)
            .bind(&search_pattern)
            .fetch_all(&*pool)
            .await
            .map_err(|e| e.to_string())?
    } else {
        sqlx::query_as::<_, Person>(sql_query)
            .bind(&search_pattern)
            .fetch_all(&*pool)
            .await
            .map_err(|e| e.to_string())?
    };

    Ok(rows)
}

#[command]
async fn get_person(pool: State<'_, DbPool>, id: i64) -> Result<Person, String> {
    let pool = pool.lock().await;

    let row = sqlx::query_as::<_, Person>("SELECT * FROM people WHERE id = ?")
        .bind(id)
        .fetch_one(&*pool)
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => "Person not found".to_string(),
            _ => e.to_string(),
        })?;

    Ok(row)
}

#[command]
async fn create_person(pool: State<'_, DbPool>, person: NewPerson) -> Result<i64, String> {
    let pool = pool.lock().await;

    let result = sqlx::query!(
        "INSERT INTO people (name, title, company, email, phone, tags, notes, date_met, location_met, linkedin)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        person.name,
        person.title,
        person.company,
        person.email,
        person.phone,
        person.tags,
        person.notes,
        person.date_met,
        person.location_met,
        person.linkedin
    )
    .execute(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(result.last_insert_rowid())
}

#[command]
async fn update_person(pool: State<'_, DbPool>, id: i64, person: NewPerson) -> Result<(), String> {
    let pool = pool.lock().await;

    sqlx::query!(
        "UPDATE people SET name = ?, title = ?, company = ?, email = ?, phone = ?, tags = ?, notes = ?, date_met = ?, location_met = ?, linkedin = ? WHERE id = ?",
        person.name,
        person.title,
        person.company,
        person.email,
        person.phone,
        person.tags,
        person.notes,
        person.date_met,
        person.location_met,
        person.linkedin,
        id
    )
    .execute(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
async fn delete_person(pool: State<'_, DbPool>, id: i64) -> Result<(), String> {
    let pool = pool.lock().await;

    sqlx::query!("DELETE FROM people WHERE id = ?", id)
        .execute(&*pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

async fn init_db(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS people (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            title TEXT,
            company TEXT,
            email TEXT,
            phone TEXT,
            tags TEXT,
            notes TEXT,
            date_met TEXT,
            location_met TEXT,
            linkedin TEXT
        );
        "#
    )
    .execute(pool)
    .await?;

    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle().clone();
            
            tauri::async_runtime::spawn(async move {
                // Get app data directory and ensure it exists
                let app_dir = app_handle.path().app_data_dir().unwrap();
                if let Err(e) = std::fs::create_dir_all(&app_dir) {
                    eprintln!("Failed to create app directory: {}", e);
                    return;
                }
                
                let db_path = app_dir.join("people.db");
                
                // Create database connection with proper file URI
                let database_url = format!("sqlite://{}?mode=rwc", db_path.display());
                let pool = match SqlitePool::connect(&database_url).await {
                    Ok(pool) => pool,
                    Err(e) => {
                        eprintln!("Failed to connect to database: {}", e);
                        return;
                    }
                };
                
                // Initialize database
                if let Err(e) = init_db(&pool).await {
                    eprintln!("Failed to initialize database: {}", e);
                    return;
                }

                app_handle.manage(DbPool::new(pool));
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_people,
            search_people,
            get_person,
            create_person,
            update_person,
            delete_person
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}