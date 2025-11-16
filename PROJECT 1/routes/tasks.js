const express = require('express');
const router = express.Router();
const db = require('../database/db');
// make sure this path is correct

// GET all tasks
router.get('/', (req, res) => {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// ADD new task
router.post('/', (req, res) => {
  const { title } = req.body;

  db.run('INSERT INTO tasks (title) VALUES (?)', [title], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ id: this.lastID, title, status: 'pending' });
  });
});

// UPDATE task status
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(
    'UPDATE tasks SET status = ? WHERE id = ?',
    [status, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ id, status });
    }
  );
});

// DELETE task
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ success: true });
  });
});

module.exports = router;
