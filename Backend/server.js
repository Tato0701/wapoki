// --- Importar los módulos necesarios ---
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

// --- Configuración inicial ---
const app = express();
const PORT = process.env.PORT || 3006;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Configuración de la conexión a la Base de Datos MySQL ---
// ¡IMPORTANTE! Reemplaza estos valores con tus credenciales de MySQL.
const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: 'Tatiana123456', // Cambia esto
    database: 'wapoki' // El nombre de tu nueva base de datos
};

// // --- Endpoint para probar la conexión a la base de datos ---
// app.get('/api/test-db', async (req, res) => {
//     try {
//         const [rows] = await pool.query('SELECT 1 AS test');
//         res.json({ success: true, message: 'Conexión exitosa', result: rows });
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'Error de conexión', error: error.message });
//     }
// });

// --- Pool de Conexiones a la DB ---
const pool = mysql.createPool(dbConfig);

// --- Rutas de la API (Endpoints) ---

// OBTENER TODOS LOS CLIENTES (Nuevo Endpoint para el formulario)
app.get('/api/clientes', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id_cliente, nombre, apellido FROM clientes ORDER BY nombre ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// --- CRUD para Mascotas (Adaptado a la nueva estructura) ---

// OBTENER TODAS LAS MASCOTAS (Read con JOIN)
app.get('/api/mascotas', async (req, res) => {
    try {
        // Consulta que une las tablas `mascotas` y `clientes`
        const sql = `
            SELECT 
                m.id_mascota, 
                m.nombre, 
                m.especie, 
                m.raza, 
                m.edad, 
                m.peso, 
                m.id_cliente,
                CONCAT(c.nombre, ' ', c.apellido) AS nombre_cliente
            FROM mascotas AS m
            JOIN clientes AS c ON m.id_cliente = c.id_cliente
            ORDER BY m.id_mascota DESC
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener mascotas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// AÑADIR UNA NUEVA MASCOTA (Create)
app.post('/api/mascotas', async (req, res) => {
    try {
        const { nombre, especie, raza, edad, peso, id_cliente } = req.body;
        if (!nombre || !especie || !raza || !edad || !peso || !id_cliente) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }
        
        const sql = 'INSERT INTO mascotas (nombre, especie, raza, edad, peso, id_cliente) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await pool.query(sql, [nombre, especie, raza, edad, peso, id_cliente]);
        
        res.status(201).json({ id_mascota: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error al añadir mascota:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ACTUALIZAR UNA MASCOTA (Update)
app.put('/api/mascotas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, especie, raza, edad, peso, id_cliente } = req.body;

        const sql = 'UPDATE mascotas SET nombre = ?, especie = ?, raza = ?, edad = ?, peso = ?, id_cliente = ? WHERE id_mascota = ?';
        const [result] = await pool.query(sql, [nombre, especie, raza, edad, peso, id_cliente, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Mascota no encontrada' });
        }

        res.json({ message: 'Mascota actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar mascota:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ELIMINAR UNA MASCOTA (Delete)
app.delete('/api/mascotas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM mascotas WHERE id_mascota = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Mascota no encontrada' });
        }

        res.json({ message: 'Mascota eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar mascota:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// --- Iniciar el servidor ---
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://127.0.0.1:${PORT}`);
});
