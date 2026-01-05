import {pool} from '../db.js'
import {format} from 'date-fns'


export const getAlquileres = async(req,res)=> {
    try{
        const sql =  "select*from alquileres"
        const [rows] = await pool.query(sql)
        res.json(rows)
    }catch(error){
        return res.status(500).json(error)
    }
}

export const getAlquiler = async(req,res)=> {
    try{
        const sql =  "select*from alquileres where id=?"
        const [rows] = await pool.query(sql,req.params.id)
        if(rows.length<=0){return res.status(400).json({message: "alquiler not found"})}
        res.json(rows)
    }catch(error){
        return res.status(500).json(error)
    }
}

export const addAlquiler = async (req,res)=> {
    try {
        const sql = "INSERT INTO alquileres (moto_id, cliente_id, fecha_inicio, fecha_fin, precio_total)VALUES (?, ?, ?, ?, ?)"
        const {moto_id, cliente_id, fecha_inicio, fecha_fin, precio_total} = req.body
         await pool.query(sql,[moto_id, cliente_id,format(fecha_inicio,'yyyy-MM-dd HH:mm:ss'),format(fecha_fin,'yyyy-MM-dd HH:mm:ss'), precio_total])
        res.status(201).json({moto_id, cliente_id, fecha_inicio, fecha_fin, precio_total})
    
    
    } catch (error) {
       return res.status(500).json(error)
    }
}


export const updateAlquiler = async (req,res)=>{
    try {
        const sql = "update alquileres set moto_id=?, cliente_id=?, fecha_inicio=?, fecha_fin=?, precio_total=?  where id=?"
        const {moto_id, cliente_id, fecha_inicio, fecha_fin, precio_total} = req.body; 
        
        const ini =format(fecha_inicio,'yyyy-MM-dd HH:mm:ss')
        const fin =format(fecha_fin,'yyyy-MM-dd HH:mm:ss')   

        const [result] = await pool.query(sql,[moto_id, cliente_id,ini,fin,precio_total,req.params.id]) 
        if(result.affectedRows===0){
            return res.status(400).json({message:'alquiler no encontrada'})
        }
        const [rows] = await pool.query("select*from alquileres where id=?",req.params.id)
        res.json(rows)
        
    } catch (error) {
        return res.status(500).json(error)
    }
} 

export const deleteAlquiler = async (req,res)=>{ 
    try {
        const sql= "delete from alquileres where id=?"
        const [rows] = await pool.query(sql,req.params.id)
        
        if(rows.affectedRows <= 0){
            return res.status(404).json({message:"alquiler not found"})
        }
        res.sendStatus(204)
    } catch (error) {
        return res.status(500).json(error)        
    }
}

export const getFacturaAlquiler = async (req, res) => {
    try {
        const sql = `
            SELECT
                c.nombre,
                c.dni,
                c.email,
                a.fecha_inicio,
                a.fecha_fin,
                a.precio_total,
                m.nombre AS moto_alquilada,
                m.precio AS precio_dia
            FROM
                alquileres a
            INNER JOIN
                clientes c ON a.cliente_id = c.id
            INNER JOIN
                motos m ON a.moto_id = m.id
            WHERE
                a.id = ?;
        `;
        const [rows] = await pool.query(sql, [req.params.id]);

        if (rows.length <= 0) {
            return res.status(404).json({ message: "Factura not found" });
        }

        res.json(rows[0]);
    } catch (error) {
        //return res.status(500).json({ message: "Something went wrong" });
        if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({ message: "Servicio de base de datos no disponible" });
    }
    return res.status(500).json({ message: "Error interno del servidor" });
    
    }
};
