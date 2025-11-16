# Taskboard

A small, modern, and fully working Node.js + Express + SQLite website that allows users to manage tasks.

## Features

-   **Add Tasks**: Quickly add new tasks to your board.
-   **View All Tasks**: See a list of all your current tasks.
-   **Update Task Status**: Mark tasks as 'completed' or revert them to 'pending'.
-   **Delete Tasks**: Remove tasks you no longer need.
-   **Responsive UI**: A clean and simple interface built with Tailwind CSS that works on all screen sizes.

## Project Structure

```
/
├── server.js           # Main Express server file
├── package.json        # Project dependencies and scripts
├── database/
│   └── db.sqlite       # SQLite database file
├── routes/
│   └── tasks.js        # API routes for task management
└── public/
    ├── index.html      # Frontend HTML and JavaScript
    └── style.css       # Additional custom styles
```

## Database Schema

The project uses a single table named `tasks` in the `db.sqlite` database.

**`tasks` table:**
| Column  | Type    | Constraints                 | Description                               |
|---------|---------|-----------------------------|-------------------------------------------|
| `id`    | INTEGER | PRIMARY KEY AUTOINCREMENT   | Unique identifier for the task.           |
| `title` | TEXT    | NOT NULL                    | The description of the task.              |
| `status`| TEXT    | NOT NULL DEFAULT 'pending'  | The current status ('pending' or 'completed'). |


## How to Run the Project

### Prerequisites

-   [Node.js](https://nodejs.org/) installed on your machine (which includes npm).

### Steps

1.  **Clone or download the project files.**

2.  **Install Dependencies**:
    Open your terminal in the project root directory and run the following command to install the necessary packages (`express` and `sqlite3`):
    ```bash
    npm install
    ```

3.  **Start the Server**:
    After the installation is complete, start the server with this command:
    ```bash
    npm start
    ```

4.  **Access the Application**:
    You should see a message in your terminal: `Server running at http://localhost:3000`.
    Open your web browser and navigate to the following address:
    [http://localhost:3000](http://localhost:3000)

You can now use the Taskboard application!
