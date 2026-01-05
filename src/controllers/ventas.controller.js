import {pool} from '../db.js'
import {format} from 'date-fns'


export const getVentas = async(req,res)=> {
    try{
        const sql =  `SELECT
  v.id,
  v.moto_id,
  v.cliente_id,
  v.fecha_venta,
  v.precio
FROM
  ventas v
INNER JOIN
  motos m ON v.moto_id = m.id
WHERE
  m.tipo = 'venta'
ORDER BY
  v.fecha_venta DESC;`;
        const [rows] = await pool.query(sql)
        res.json(rows)
    }catch(error){
        console.error(error);
        return res.status(500).json({message: "Ocurrió un error en el servidor"})
    }
}



export const getVenta = async (req, res) => {
  try {
    const sql = `
      SELECT v.id, v.fecha_venta, v.precio,
             c.id AS cliente_id, c.nombre AS cliente_nombre,
             m.id AS moto_id, m.nombre AS moto_nombre
      FROM ventas v
      JOIN clientes c ON v.cliente_id = c.id
      JOIN motos m ON v.moto_id = m.id
      WHERE v.id = ?
    `;
    const [rows] = await pool.query(sql, [req.params.id]);
    if (rows.length <= 0) {
      return res.status(400).json({ message: "Venta no encontrada" });
    }
    res.json(rows);
  } catch (error) {
    return res.status(500).json(error);
  }
};
export const addVenta = async (req, res) => {
    // La solicitud debería incluir moto_id y cliente_id en el cuerpo (body)
    // fecha_venta y precio se obtendrán automáticamente en la consulta.
    const { moto_id, cliente_id } = req.body;
    let connection;

    try {
        // Obtenemos una conexión de la piscina de conexiones para la transacción
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Verificar si la moto está disponible y es para venta
        const [motoRows] = await connection.query(
            "SELECT precio, disponible FROM motos WHERE id = ? AND tipo = 'venta'",
            [moto_id]
        );

        if (motoRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Moto no encontrada o no está a la venta" });
        }
        
        const moto = motoRows[0];
        if (!moto.disponible) {
            await connection.rollback();
            return res.status(409).json({ message: "Esta moto ya ha sido vendida" });
        }

        // 2. Insertar la nueva venta
        const [ventaResult] = await connection.query(
            "INSERT INTO ventas (moto_id, cliente_id, fecha_venta, precio) VALUES (?, ?, CURDATE(), ?)",
            [moto_id, cliente_id, moto.precio]
        );
        
        // 3. Actualizar el estado de la moto a no disponible
        await connection.query(
            "UPDATE motos SET disponible = false WHERE id = ?",
            [moto_id]
        );

        
        await connection.commit();

        res.status(201).json({ 
            message: "Venta registrada con éxito", 
            ventaId: ventaResult.insertId 
        });

    } catch (error) {
        // Si algo falla, revertimos los cambios
        if (connection) {
            await connection.rollback();
        }
        console.error(error);
        return res.status(500).json({ message: "Ocurrió un error durante el proceso de venta" });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

export const updateVenta = async (req,res)=>{
    try {
        const sql = "update ventas set moto_id=?, cliente_id=?, fecha_venta=?, precio=?  where id=?"
        const {moto_id, cliente_id, fecha_venta,precio} = req.body; 
        const [result] = await pool.query(sql,[moto_id, cliente_id,format(fecha_venta,'yyyy-MM-dd HH:mm:ss'),precio,req.params.id]) 
        if(result.affectedRows===0){
            return res.status(404).json({message:'venta no encontrada'})
        }
        const [rows] = await pool.query("select*from ventas where id=?",req.params.id)
        res.json(rows)
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Ocurrió un error en el servidor"})
    }
} 

export const deleteVenta = async (req,res)=>{ 
    try {
        const sql= "delete from ventas where id=?"
        const [rows] = await pool.query(sql,req.params.id)
        
        if(rows.affectedRows <= 0){
            return res.status(404).json({message:"venta not found"})
        }
        res.sendStatus(204)
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Ocurrió un error en el servidor"})       
    }
}


export const getMotosDisponibles = async (req, res) => {
    try {
        // Consulta SQL para seleccionar motos que están disponibles y son para venta
        const sql = `
            SELECT
                id,
                nombre,
                descrip,
                precio
            FROM
                motos
            WHERE
                disponible = true AND tipo = 'venta';
        `;
        const [rows] = await pool.query(sql);

        if (rows.length <= 0) {
            return res.status(404).json({ message: "No se encontraron motos disponibles para la venta" });
        }

        res.json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Ocurrió un error al obtener las motos" });
    }
};