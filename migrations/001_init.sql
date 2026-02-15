-- Migration: Create initial tables
-- Run with: wrangler d1 execute warehouse-tasks --local --file=migrations/001_init.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TEXT DEFAULT (datetime('now'))
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    deadline TEXT,
    requester TEXT DEFAULT '',
    destination TEXT DEFAULT '',
    type TEXT DEFAULT 'その他',
    priority TEXT DEFAULT '中',
    status TEXT DEFAULT '未着手',
    assignee TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    is_important INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Subtasks table
CREATE TABLE IF NOT EXISTS subtasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT '未着手',
    sort_order INTEGER DEFAULT 0
);

-- Info notes table
CREATE TABLE IF NOT EXISTS info_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_important INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
);

-- Task history table
CREATE TABLE IF NOT EXISTS task_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by INTEGER REFERENCES users(id),
    changed_at TEXT DEFAULT (datetime('now'))
);

-- Requirement updates table
CREATE TABLE IF NOT EXISTS requirement_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
);

-- Inventory schedules table
CREATE TABLE IF NOT EXISTS inventory_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no TEXT NOT NULL,
    product TEXT NOT NULL,
    brand TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'Online',
    shipment_date TEXT,
    eta TEXT,
    arrival_date TEXT,
    notes TEXT DEFAULT '',
    created_by INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- SKU records table
CREATE TABLE IF NOT EXISTS sku_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no TEXT NOT NULL,
    sku_code TEXT NOT NULL,
    product TEXT NOT NULL,
    brand TEXT NOT NULL,
    color TEXT DEFAULT '',
    quantity INTEGER DEFAULT 1,
    channel TEXT NOT NULL DEFAULT 'Online',
    status TEXT DEFAULT 'pending',
    notes TEXT DEFAULT '',
    created_by INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, display_name, password_hash, role)
VALUES ('admin', 'Administrator', '$2a$10$rQEY9zXKQ8F7Y3N0W0K0U.5Y8Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O', 'admin');

INSERT INTO users (username, display_name, password_hash, role)
VALUES ('demo', 'Demo User', '$2a$10$rQEY9zXKQ8F7Y3N0W0K0U.5Y8Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O', 'member');
