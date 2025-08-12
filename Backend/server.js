// --- Importar módulos ---
// --- Permite crear un servidor web.
const express = require('express');
// --- Permite conectar y trabajar con una base de datos MySQL.
const mysql = require('mysql2/promise');
// --- Permite que el servidor acepte peticiones desde otras páginas web.
const cors = require('cors');

// --- Configuración inicial ---
// --- Crea una aplicación web con Express.
const app = express();
// --- Define el puerto donde funcionará.
const PORT = process.env.PORT || 3006;

// --- Middlewares --- 
app.use(cors());
app.use(express.json());

// --- Configuración de la conexión a la Base de Datos MySQL ---
const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: 'Tatiana123456',
    database: 'wapoki'
};

// --- Pool de Conexiones a la DB ---
// --- Permite hacer varias consultas a la base de datos al mismo tiempo.
const pool = mysql.createPool(dbConfig);

// --- Endpoint de prueba para verificar que el servidor está funcionando ---
// // --- Endpoint para probar la conexión a la base de datos ---
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 AS test');
        res.json({ success: true, message: 'Conexión exitosa', result: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error de conexión', error: error.message });
    }
});

// --- Rutas de la API (Endpoints) ---

// --- CRUD para Clientes

// OBTENER TODOS LOS CLIENTES
app.get('/api/clientes', async (req, res) => {
    try {
        // Consulta que une las tablas `mascotas` y `clientes`
        const sql = `
            SELECT 
                c.id_cliente, 
                c.nombre, 
                c.apellido, 
                c.telefono, 
                c.email, 
                c.direccion, 
                b.nombre
            FROM clientes AS c
            JOIN barrios AS b ON c.id_barrio = b.id_barrio
            ORDER BY c.id_cliente DESC
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener mascotas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// AÑADIR UN NUEVO CLIENTE
app.post('/api/clientes', async (req, res) => {
    try {
        const { nombre, apellido, telefono, email, direccion, id_barrio } = req.body;
        if (!nombre || !apellido || !telefono || !email || !direccion || !id_barrio) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const sql = 'INSERT INTO clientes (nombre, apellido, telefono, email, direccion, barrio) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await pool.query(sql, [nombre, apellido, telefono, email, direccion, id_barrio]);

        res.status(201).json({ id_cliente: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error al añadir cliente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ACTUALIZAR UN CLIENTE
app.put('/api/clientes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, telefono, email, direccion, id_barrio } = req.body;

        const sql = 'UPDATE clientes SET nombre = ?, apellido = ?, telefono = ?, email = ?, direccion = ?, id_barrio = ? WHERE id_cliente = ?';
        const [result] = await pool.query(sql, [nombre, apellido, telefono, email, direccion, id_barrio, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        res.json({ message: 'Cliente actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ELIMINAR UN CLIENTE
app.delete('/api/clientes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM clientes WHERE id_cliente = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        res.json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// --- CRUD para Mascotas

// OBTENER TODAS LAS MASCOTAS
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

// AÑADIR UNA NUEVA MASCOTA
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

// ACTUALIZAR UNA MASCOTA
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

// ELIMINAR UNA MASCOTA
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
