-- SQLite
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    googleId TEXT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT,
    created_at DATETIME DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS workspaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workspaceData TEXT NOT NULL,
    userId INTEGER NOT NULL,
    workspaceName TEXT NOT NULL,
    created_at DATETIME DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS guestsWorkspaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workspaceData TEXT NOT NULL,
    created_at DATETIME DEFAULT (datetime('now', 'localtime'))
);

--DELETE FROM users;
--DELETE FROM workspaces;
-- delete table guestsWorkspaces not only its data
--DROP TABLE IF EXISTS guestsWorkspaces;
--DELETE FROM guestsWorkspaces;

-- delete the data of guestsWorkspaces table
--DELETE FROM sqlite_sequence WHERE name='guestsWorkspaces';