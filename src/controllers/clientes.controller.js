import {pool} from '../db.js'

export const getClientes = async(req,res)=> {
    try{
        const sql =  "select*from clientes"
        const [rows] = await pool.query(sql)
        res.json(rows)
    }catch(error){
        return res.status(500).json(error)
    }
}

export const getCliente = async(req,res)=> {
    try{
        const sql =  "select*from clientes where id=?"
        const [rows] = await pool.query(sql,req.params.id)
        if(rows.length<=0){return res.status(400).json({message: "cliente not found"})}
        res.json(rows)
    }catch(error){
        return res.status(500).json(error)
    }
}
export const addCliente = async (req,res)=> {
    try {
        const sql = "INSERT INTO clientes (dni, nombre, email, cel, dir)VALUES (?, ?, ?, ?, ?)"
        const {dni, nombre, email, cel, dir} = req.body
        const [rows] = await pool.query(sql,[dni, nombre, email, cel, dir])
        res.status(201).json({dni, nombre, email, cel, dir})
    } catch (error) {
       return res.status(500).json(error)
    }
}
export const updateCliente = async (req,res)=>{
    try {
        const sql = "update clientes set dni=ifnull(?,dni),nombre=ifnull(?,nombre),email=ifnull(?,email),cel=ifnull(?,cel),dir=ifnull(?,dir) where id=? "
        const { dni, nombre, email, cel, dir } = req.body; 
        const [result] = await pool.query(sql,[dni, nombre, email, cel, dir,req.params.id]) 
        if(result.affectedRows===0){
            return res.status(400).json({message:'cliente no encontrada'})
        }
        const [rows] = await pool.query("select*from clientes where id=?",req.params.id)
        res.json(rows)
        
    } catch (error) {
        return res.status(500).json(error)
    }
} 

export const deleteCliente = async (req,res)=>{ 
    try {
        const sql= "delete from clientes where id=?"
        const [rows] = await pool.query(sql,req.params.id)
        
        if(rows.affectedRows <= 0){
            return res.status(404).json({message:"cliente not found"})
        }
        res.sendStatus(204)
    } catch (error) {
        return res.status(500).json(error)        
    }
}