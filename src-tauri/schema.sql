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
