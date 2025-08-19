// --- Importar módulos ---
// --- Permite crear un servidor web.
const express = require('express');
// --- Permite conectar y trabajar con una base de datos MySQL.
const mysql = require('mysql2/promise');
// --- Capa seguridad para permitir peticiones a mi api
const cors = require('cors');

// --- Configuración inicial ---
// --- APP(Inicializa) express
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

// --- Rutas de la API (Endpoints) ---

// ------------------------------
// --- CRUD para usuarios
// ------------------------------

// OBTENER TODOS LOS USUARIOS
app.get('/api/usuarios', async (req, res) => {
    try {
        const sql = `
            SELECT   
                u.nombre_usuario,
                u.nombre,
                u.apellido,
                u.email,
                u.telefono,
                u.rol
            FROM usuarios AS u
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener servicios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// AÑADIR UN NUEVO USUARIO
app.post('/api/usuarios', async (req, res) => {
    try {
        const { nombre_usuario, contrasenia, nombre, apellido, email, telefono, rol } = req.body;
        if (!nombre_usuario || !contrasenia || !nombre || !apellido || !email || !telefono || !rol) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }
        const sql = 'INSERT INTO usuarios (nombre_usuario, contrasenia, nombre, apellido, email, telefono, rol) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [result] = await pool.query(sql, [nombre_usuario, contrasenia, nombre, apellido, email, telefono, rol]);

        res.status(201).json({ id_usuario: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error al añadir usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ACTUALIZAR UN USUARIO
app.put('/api/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_usuario, nombre, apellido, email, telefono, rol } = req.body;

        const sql = 'UPDATE usuarios SET nombre_usuario = ?, nombre = ?, apellido = ?, email = ?, telefono = ?, rol = ? WHERE id_usuario = ?';
        const [result] = await pool.query(sql, [nombre_usuario, nombre, apellido, email, telefono, rol, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ELIMINAR UN USUARIO
app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ------------------------------
// --- CRUD para veterinarios
// ------------------------------

// OBTENER TODOS LOS VETERINARIOS
app.get('/api/veterinarios', async (req, res) => {
    try {
        const sql = `
            SELECT   
                v.nombre AS nombre_veterinario,
                v.apellido AS apellido_veterinario,
                v.especialidad AS especialidad_veterinario,
                v.telefono AS telefono_veterinario,
                v.email AS email_veterinario,
                u.nombre_usuario
            FROM veterinarios AS v
            LEFT JOIN usuarios AS u 
                ON v.id_usuario = u.id_usuario
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener veterinarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// AÑADIR UN NUEVO VETERINARIO
app.post('/api/veterinarios', async (req, res) => {
    try {
        const { nombre, apellido, especialidad, telefono, email, id_usuario } = req.body;
        if (!nombre || !apellido || !especialidad || !telefono || !email || !id_usuario) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }
        const sql = 'INSERT INTO veterinarios (nombre, apellido, especialidad, telefono, email, id_usuario) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await pool.query(sql, [nombre, apellido, especialidad, telefono, email, id_usuario]);

        res.status(201).json({ id_usuario: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error al añadir usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ACTUALIZAR UN VETERINARIO
app.put('/api/veterinarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, especialidad, telefono, email, id_usuario } = req.body;

        const sql = 'UPDATE veterinarios SET nombre = ?, apellido = ?, especialidad = ?, telefono = ?, email = ?, id_usuario = ? WHERE id_veterinario = ?';
        const [result] = await pool.query(sql, [nombre, apellido, especialidad, telefono, email, id_usuario, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Veterinario no encontrado' });
        }

        res.json({ message: 'Veterinario actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar veterinario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ELIMINAR UN VETERINARIO
app.delete('/api/veterinarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM veterinarios WHERE id_veterinario = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Veterinario no encontrado' });
        }

        res.json({ message: 'Veterinario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar veterinario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ------------------------------
// --- CRUD para servicios
// ------------------------------

// OBTENER TODOS LOS SERVICIOS
app.get('/api/servicios', async (req, res) => {
    try {
        const sql = `
            SELECT   
                s.nombre AS nombre_servicio,
                s.descripcion AS descripcion_servicio,
                s.precio AS precio_servicio
            FROM servicios AS s
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener servicios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// AÑADIR UNA NUEVA ENFERMEDAD
app.post('/api/servicios', async (req, res) => {
    try {
        const { nombre, descripcion, precio } = req.body;
        if (!nombre || !descripcion || !precio) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }
        const sql = 'INSERT INTO servicios (nombre, descripcion, precio) VALUES (?, ?, ?)';
        const [result] = await pool.query(sql, [nombre, descripcion, precio]);

        res.status(201).json({ id_servicio: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error al añadir servicio:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ACTUALIZAR UN SERVICIO
app.put('/api/servicios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio } = req.body;

        const sql = 'UPDATE servicios SET nombre = ?, descripcion = ?, precio = ? WHERE id_servicio = ?';
        const [result] = await pool.query(sql, [nombre, descripcion, precio, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        res.json({ message: 'Servicio actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar servicio:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ELIMINAR UN SERVICIO
app.delete('/api/servicios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM servicios WHERE id_servicio = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        res.json({ message: 'Servicio eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar servicio:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ------------------------------
// --- CRUD para localidades
// ------------------------------

// OBTENER TODAS LAS LOCALIDADES
app.get('/api/localidades', async (req, res) => {
    try {
        const sql = `
            SELECT   
                l.nombre AS nombre_localidad
            FROM localidades AS l
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener localidades:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// AÑADIR UNA NUEVA LOCALIDAD
app.post('/api/localidades', async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }
        const sql = 'INSERT INTO localidades (nombre) VALUES (?)';
        const [result] = await pool.query(sql, [nombre]);

        res.status(201).json({ id_localidad: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error al añadir localidad:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ACTUALIZAR UNA LOCALIDAD
app.put('/api/localidades/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        const sql = 'UPDATE localidades SET nombre = ? WHERE id_localidad = ?';
        const [result] = await pool.query(sql, [nombre, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Localidad no encontrada' });
        }

        res.json({ message: 'Localidad actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar localidad:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ELIMINAR UNA LOCALIDAD
app.delete('/api/localidades/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM localidades WHERE id_localidad = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Localidad no encontrada' });
        }

        res.json({ message: 'Localidad eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar localidad:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ------------------------------
// --- CRUD para barrios
// ------------------------------

// OBTENER TODOS LOS BARRIOS
app.get('/api/barrios', async (req, res) => {
    try {
        const sql = `
            SELECT   
                b.id_barrio,
                b.nombre AS nombre_barrio,
                l.nombre AS nombre_localidad
            FROM barrios AS b
            LEFT JOIN localidades AS l 
                ON b.id_localidad = l.id_localidad
            ORDER BY b.id_barrio DESC
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener barrios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// AÑADIR UN NUEVO BARRIO
app.post('/api/barrios', async (req, res) => {
    try {
        const { nombre, id_localidad } = req.body;
        if (!nombre || !id_localidad) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }
        const sql = 'INSERT INTO barrios (nombre, id_localidad) VALUES (?, ?)';
        const [result] = await pool.query(sql, [nombre, id_localidad]);

        res.status(201).json({ id_barrio: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error al añadir barrio:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ACTUALIZAR UN BARRIO
app.put('/api/barrios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, id_localidad } = req.body;

        const sql = 'UPDATE barrios SET nombre = ?, id_localidad = ? WHERE id_barrio = ?';
        const [result] = await pool.query(sql, [nombre, id_localidad, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Barrio no encontrado' });
        }

        res.json({ message: 'Barrio actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar barrio:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ELIMINAR UN BARRIO
app.delete('/api/barrios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM barrios WHERE id_barrio = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Barrio no encontrado' });
        }

        res.json({ message: 'Barrio eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar barrio:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ------------------------------
// --- CRUD para clientes
// ------------------------------

// OBTENER TODOS LOS CLIENTES
app.get('/api/clientes', async (req, res) => {
    try {
        const sql = `
            SELECT  
                c.id_cliente, 
                c.nombre, 
                c.apellido, 
                c.telefono, 
                c.email, 
                c.direccion, 
                b.nombre AS id_barrio
            FROM clientes AS c
            LEFT JOIN barrios AS b 
                ON c.id_barrio = b.id_barrio
            ORDER BY c.id_cliente DESC
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener clientes:', error);
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
        const id_barrio_number = parseInt(id_barrio, 10);
        const sql = 'INSERT INTO clientes (nombre, apellido, telefono, email, direccion, id_barrio) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await pool.query(sql, [nombre, apellido, telefono, email, direccion, id_barrio_number]);

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

// ------------------------------
// --- CRUD para mascotas
// ------------------------------

// OBTENER TODAS LAS MASCOTAS
app.get('/api/mascotas', async (req, res) => {
    try {
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

// ------------------------------
// --- CRUD para enfermedades
// ------------------------------

// OBTENER TODAS LAS ENFERMEDADES
app.get('/api/enfermedades', async (req, res) => {
    try {
        const sql = `
            SELECT   
                e.nombre AS nombre_enfermedad,
                e.descripcion AS descripcion_enfermedad
            FROM enfermedades AS e
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener enfermedades:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// AÑADIR UNA NUEVA ENFERMEDAD
app.post('/api/enfermedades', async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        if (!nombre || !descripcion) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }
        const sql = 'INSERT INTO enfermedades (nombre, descripcion) VALUES (?, ?)';
        const [result] = await pool.query(sql, [nombre, descripcion]);

        res.status(201).json({ id_enfermedad: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error al añadir enfermedad:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ACTUALIZAR UNA ENFERMEDAD
app.put('/api/enfermedades/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        const sql = 'UPDATE enfermedades SET nombre = ?, descripcion = ? WHERE id_enfermedad = ?';
        const [result] = await pool.query(sql, [nombre, descripcion, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Enfermedad no encontrada' });
        }

        res.json({ message: 'Enfermedad actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar enfermedad:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ELIMINAR UNA ENFERMEDAD
app.delete('/api/enfermedades/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM enfermedades WHERE id_enfermedad = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Enfermedad no encontrada' });
        }

        res.json({ message: 'Enfermedad eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar enfermedad:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ----------------------------------------
// --- CRUD para enfermedades de mascotas
// ----------------------------------------

// OBTENER TODAS LAS ENFERMEDADES MASCOTAS
app.get('/api/enfermedades_mascotas', async (req, res) => {
    try {
        const sql = `
            SELECT   
                m.nombre AS nombre_mascota,
                e.nombre AS nombre_enfermedad,
                e.descripcion AS descripcion_enfermedad,
                em.fecha_diagnostico AS fecha_diagnostico
            FROM enfermedades_mascotas AS em
            LEFT JOIN enfermedades AS e 
                ON em.id_enfermedad = e.id_enfermedad
            LEFT JOIN mascotas AS m 
                ON em.id_mascota = m.id_mascota
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener enfermedades de mascotas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// AÑADIR UNA NUEVA ENFERMEDAD MASCOTA
app.post('/api/enfermedades_mascotas', async (req, res) => {
    try {
        const { id_mascota, id_enfermedad, fecha_diagnostico } = req.body;
        if (!id_mascota || !id_enfermedad || !fecha_diagnostico) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }
        const sql = 'INSERT INTO enfermedades_mascotas (id_mascota, id_enfermedad, fecha_diagnostico) VALUES (?, ?, ?)';
        const [result] = await pool.query(sql, [id_mascota, id_enfermedad, fecha_diagnostico]);

        res.status(201).json({ id_enfermedad: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error al añadir enfermedad de mascota:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ACTUALIZAR UNA ENFERMEDAD DE MASCOTA
app.put('/api/enfermedades_mascotas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { id_mascota, id_enfermedad, fecha_diagnostico } = req.body;

        const sql = 'UPDATE enfermedades_mascotas SET id_mascota = ?, id_enfermedad = ?, fecha_diagnostico = ? WHERE id_enfermedad = ?';
        const [result] = await pool.query(sql, [id_mascota, id_enfermedad, fecha_diagnostico, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Enfermedad de mascota no encontrada' });
        }

        res.json({ message: 'Enfermedad de mascota actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar enfermedad de mascota:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ELIMINAR UNA ENFERMEDAD DE MASCOTA
app.delete('/api/enfermedades_mascotas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM enfermedades_mascotas WHERE id_enfermedad = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Enfermedad de mascota no encontrada' });
        }

        res.json({ message: 'Enfermedad de mascota eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar enfermedad de mascota:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ------------------------------
// --- CRUD para citas
// ------------------------------

// OBTENER TODAS LAS CITAS
app.get('/api/citas', async (req, res) => {
    try {
        const sql = `
            SELECT 
                c.fecha,
                c.hora,
                c.motivo,
                m.nombre AS nombre_mascota,
                v.nombre AS nombre_veterinario,
                cl.nombre AS nombre_cliente
            FROM citas AS c
            LEFT JOIN mascotas AS m 
                ON c.id_mascota = m.id_mascota
            LEFT JOIN veterinarios AS v 
                ON c.veterinario = v.id_veterinario
            LEFT JOIN clientes AS cl
                ON m.id_cliente = cl.id_cliente
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener citas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// AÑADIR UNA NUEVA CITA
app.post('/api/citas', async (req, res) => {
    try {
        const { fecha, hora, id_mascota, id_veterinario, motivo } = req.body;
        if (!fecha || !hora || !id_mascota || !id_veterinario || !motivo) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const sql = 'INSERT INTO citas (fecha, hora, id_mascota, id_veterinario, motivo) VALUES (?, ?, ?, ?, ?)';
        const [result] = await pool.query(sql, [fecha, hora, id_mascota, id_veterinario, motivo]);

        res.status(201).json({ id_cita: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error al añadir cita:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ACTUALIZAR UNA CITA
app.put('/api/citas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha, hora, id_mascota, id_veterinario, motivo } = req.body;

        const sql = 'UPDATE citas SET fecha = ?, hora = ?, id_mascota = ?, id_veterinario = ?, motivo = ? WHERE id_cita = ?';
        const [result] = await pool.query(sql, [fecha, hora, id_mascota, id_veterinario, motivo, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        res.json({ message: 'Cita actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar cita:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ELIMINAR UNA CITA
app.delete('/api/citas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM citas WHERE id_cita = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        res.json({ message: 'Cita eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar cita:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ------------------------------
// --- CRUD para tratamientos
// ------------------------------

// OBTENER TODOS LOS TRATAMIENTOS
app.get('/api/tratamientos', async (req, res) => {
    try {
        const sql = `
            SELECT 
                t.descripcion AS descripcion_tratamiento,
                t.medicamento AS nombre_medicamento,
                t.dosis,
                c.fecha,
                c.hora,
                m.nombre AS nombre_mascota,
                v.nombre AS nombre_veterinario,
                cl.nombre AS nombre_cliente
            FROM tratamientos AS t
            LEFT JOIN citas AS c
                ON t.id_cita = c.id_cita
            LEFT JOIN mascotas AS m
                ON c.id_mascota = m.id_mascota
            LEFT JOIN veterinarios AS v
                ON c.id_veterinario = v.id_veterinario
            LEFT JOIN clientes AS cl
                ON m.id_cliente = cl.id_cliente
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener tratamientos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// AÑADIR UN NUEVO TRATAMIENTO
app.post('/api/tratamientos', async (req, res) => {
    try {
        const { descripcion, medicamento, dosis, id_cita } = req.body;
        if (!descripcion || !medicamento || !dosis || !id_cita) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const sql = 'INSERT INTO tratamientos (descripcion, medicamento, dosis, id_cita) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(sql, [descripcion, medicamento, dosis, id_cita]);

        res.status(201).json({ id_tratamiento: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error al añadir tratamiento:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ACTUALIZAR UN TRATAMIENTO
app.put('/api/tratamientos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion, medicamento, dosis, id_cita } = req.body;

        const sql = 'UPDATE tratamientos SET descripcion = ?, medicamento = ?, dosis = ?, id_cita = ? WHERE id_tratamiento = ?';
        const [result] = await pool.query(sql, [descripcion, medicamento, dosis, id_cita, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tratamiento no encontrado' });
        }

        res.json({ message: 'Tratamiento actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar tratamiento:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ELIMINAR UN TRATAMIENTO
app.delete('/api/tratamientos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM tratamientos WHERE id_tratamiento = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tratamiento no encontrado' });
        }

        res.json({ message: 'Cita eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar cita:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ------------------------------
// --- CRUD para facturas
// ------------------------------

// OBTENER TODAS LAS FACTURAS
app.get('/api/facturas', async (req, res) => {
    try {
        const sql = `
            SELECT 
                f.fecha_emision,
                f.total,
                f.metodo_pago,
                c.nombre AS nombre_cliente,
                m.nombre AS nombre_mascota
            FROM facturas AS f
            LEFT JOIN clientes AS c 
                ON f.id_cliente = c.id_cliente
            LEFT JOIN mascotas AS m 
                ON f.id_mascota = m.id_mascota
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener facturas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// AÑADIR UNA NUEVA FACTURA
app.post('/api/facturas', async (req, res) => {
    try {
        const { fecha_emision, total, metodo_pago, id_cliente } = req.body;
        if (!fecha_emision || !total || !metodo_pago || !id_cliente) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const sql = 'INSERT INTO facturas (fecha_emision, total, metodo_pago, id_cliente) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(sql, [fecha_emision, total, metodo_pago, id_cliente]);

        res.status(201).json({ id_factura: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error al añadir factura:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ACTUALIZAR UNA FACTURA
app.put('/api/facturas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha_emision, total, metodo_pago, id_cliente } = req.body;

        const sql = 'UPDATE facturas SET fecha_emision = ?, total = ?, metodo_pago = ?, id_cliente = ? WHERE id_factura = ?';
        const [result] = await pool.query(sql, [fecha_emision, total, metodo_pago, id_cliente, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Factura no encontrada' });
        }

        res.json({ message: 'Factura actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar factura:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ELIMINAR UNA FACTURA
app.delete('/api/facturas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM facturas WHERE id_factura = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Factura no encontrada' });
        }

        res.json({ message: 'Factura eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar factura:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// -----------------------------------
// --- CRUD para detalle de facturas
// -----------------------------------

// OBTENER TODOS LOS DETALLES FACTURAS
app.get('/api/detalles_facturas', async (req, res) => {
    try {
        const sql = `
            SELECT 
                f.fecha_emision,
                c.nombre AS nombre_cliente,
                m.nombre AS nombre_mascota,
                df.servicio AS nombre_servicio,
                df.cantidad AS cantidad_servicio,
                df.subtotal AS subtotal_servicio,
                f.total AS total_factura,
                f.metodo_pago AS metodo_pago_factura
            FROM detalle_facturacion AS df
            LEFT JOIN facturas AS f 
                ON f.id_factura = df.id_factura
            LEFT JOIN servicios AS s
                ON df.id_servicio = s.id_servicio
            LEFT JOIN clientes AS c 
                ON f.id_cliente = c.id_cliente
            LEFT JOIN mascotas AS m 
                ON f.id_mascota = m.id_mascota
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener detalle facturas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// AÑADIR UN NUEVO DETALLE FACTURA
app.post('/api/detalles_facturas', async (req, res) => {
    try {
        const { id_factura, id_servicio, cantidad, subtotal } = req.body;
        if (!id_factura || !id_servicio || !cantidad || !subtotal) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const sql = 'INSERT INTO detalle_facturacion (id_factura, id_servicio, cantidad, subtotal) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(sql, [id_factura, id_servicio, cantidad, subtotal]);

        res.status(201).json({ id_detalle_factura: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error al añadir detalle factura:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ACTUALIZAR UN DETALLE FACTURA
app.put('/api/detalles_facturas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { id_factura, id_servicio, cantidad, subtotal } = req.body;

        const sql = 'UPDATE detalle_facturacion SET id_factura = ?, id_servicio = ?, cantidad = ?, subtotal = ? WHERE id_detalle_factura = ?';
        const [result] = await pool.query(sql, [id_factura, id_servicio, cantidad, subtotal, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Detalle de factura no encontrado' });
        }

        res.json({ message: 'Detalle de factura actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar detalle factura:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ELIMINAR UNA FACTURA
app.delete('/api/detalles_facturas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM detalle_facturacion WHERE id_detalle_factura = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Detalle de factura no encontrado' });
        }

        res.json({ message: 'Detalle de factura eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar detalle factura:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
 

// --- Iniciar el servidor ---
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://127.0.0.1:${PORT}`);
});

