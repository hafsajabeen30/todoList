require('dotenv').config();
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');
const moment = require('moment'); // Add moment

// Database setup
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  }
);

const Task = require('./models/task')(sequelize, DataTypes);

const app = express();
const port = 3000;

// Middleware for logging requests
function logger(req, res, next) {
  const logMessage = `${new Date().toISOString()} - ${req.method} ${req.url}\n`;
  fs.appendFile('access.log', logMessage, (err) => {
    if (err) {
      console.error('Error writing to logfile:', err);
    }
  });
  next();
}
app.use(logger);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Sync database and start server
sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

// Routes
app.get('/', (req, res) => {
  res.redirect('/todo-list');
});

app.get('/todos', async (req, res) => {
  try {
    const tasks = await Task.findAll();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/todos', async (req, res) => {
  console.log('Request body:', req.body);  // Add this line to log the request body
  const { task_name, task_description, due_date } = req.body;

  if (!task_name) {
    return res.status(400).json({ error: 'Task name is required' });
  }

  try {
    const task = await Task.create({ task_name, task_description, due_date });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await Task.update({ status }, { where: { id } });
    res.status(200).send('Task updated');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Task.destroy({ where: { id } });
    res.status(200).send('Task deleted');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/todo-list', async (req, res) => {
  try {
    const tasks = await Task.findAll();
    res.render('todo-list', { todos: tasks, moment: moment }); // Pass moment to the template
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


