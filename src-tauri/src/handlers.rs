use sqlx::SqlitePool;
use serde::Deserialize;
use crate::models::{NewPerson, Person};
use tauri::State
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Deserialize)]
pub struct SearchQuery {
    query: String,
    field: String,
}

type DbPool = Arc<Mutex<SqlitePool>>;

#[tauri::command]
pub async fn get_people(pool: State<'_, DbPool>) -> Result<Vec<Person>, String> {
    let pool = pool.lock().await();
    
    let rows = sqlx::query_as::<_, Person>("SELECT * FROM people")
        .fetch_all(&*pool)
        .await;

    match rows {
        Ok(people) => Ok(people),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn search_people(
    pool: State<'_, DbPool>, 
    search_query: String,
    search_field: String
) -> Result<Vec<Person>, String> {
    let pool = pool.lock().await();
    
    // Build the SQL query based on the search field
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
        // For "all" fields search, bind the pattern to all placeholders
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
    } else {
        // For specific field search, bind the pattern once
        sqlx::query_as::<_, Person>(sql_query)
            .bind(&search_pattern)
            .fetch_all(&*pool)
            .await
    };

    match rows {
        Ok(people) => Ok(people),
        Err(e) => {
            eprintln!("Database error during search: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
pub async fn get_person(pool: State<'_, DbPool>, id: i64) -> Result<Person, String> {
    let pool = pool.lock().await();

    let row = sqlx::query_as::<_, Person>("SELECT * FROM people WHERE id = ?")
        .bind(id)
        .fetch_one(&*pool)
        .await;

    match row {
        Ok(person) => Ok(person),
        Err(sqlx::Error::RowNotFound) => Err("Person not found".to_string()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn create_person(
    pool: State<'_, DbPool>,
    person: NewPerson,
) -> Result<i64, String> {
    let pool = pool.lock().await();

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
    .await;

    match result {
        Ok(res) => Ok(res.last_insert_rowid()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn update_person(
    pool: State<'_, DbPool>,
    id: i64,
    person: NewPerson,
) -> Result<(), String> {
    let pool = pool.lock().await();

    let result = sqlx::query!(
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
    .await;

    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn delete_person(pool: State<'_, DbPool>, id: i64) -> Result<(), String> {
    let pool = pool.lock().await();

    let result = sqlx::query!("DELETE FROM people WHERE id = ?", id)
        .execute(&*pool)
        .await;

    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}