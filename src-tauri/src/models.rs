use serde::{Deserialize, Serialize};
use sqlx::FromRow;

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
