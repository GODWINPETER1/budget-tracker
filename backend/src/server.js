require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoriesRoute');
const transactionRoutes = require('./routes/transactionRoutes')
const budgetRoutes = require('./routes/budgetRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const statsRoutes = require('./routes/statsRoutes');


const app = express();

app.use(cors());
app.use(express.json());

// authorizationapis
app.use('/api/auth' , authRoutes);

// require middleware api
app.use('/api/categories' , categoryRoutes);
app.use('/api/transactions' , transactionRoutes);
app.use('/api/budgets' , budgetRoutes)
app.use('/api/recurring', recurringRoutes);
app.use('/api/stats' , statsRoutes);

// health check
app.get('/api/health', async (req , res) => {

    try {
        await db.raw('SELECT 1');
        res.json({ status: 'ok', db: 'connected'});

    } catch (err) {
        console.error('DB connected error:', err.message);
        res.status(500).json({ status: 'error', db: 'disconnected'})
    }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})