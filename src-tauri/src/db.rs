use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use sqlx::SqlitePool;

#[derive(Debug, Serialize, Deserialize, FromRow)]
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

pub async fn init_db(pool: &SqlitePool) -> Result<(), sqlx::Error> {
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
