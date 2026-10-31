import mysql from 'mysql2/promise';

const db = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10
});

// Test database connection
try {
    const connection = await db.getConnection();
    console.log("MySQL connected successfully!");
    connection.release();
} catch (error) {
    console.error("MySQL connection failed:", error.message);
}

export default db;