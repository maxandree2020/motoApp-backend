import {pool} from '../db.js'

export const getMotos = async(req,res)=> {
    try{
        const sql =  "select*from motos"
        const [rows] = await pool.query(sql)
        res.json(rows)
    }catch(error){
        return res.status(500).json(error)
    }
}

export const getMoto = async(req,res)=> {
    try{
        const sql =  "select*from motos where id=?"
        const [rows] = await pool.query(sql,req.params.id)
        if(rows.length<=0){return res.status(400).json({message: "moto not found"})}
        res.json(rows)
    }catch(error){
        return res.status(500).json(error)
    }
}

export const addMoto = async (req, res) => {
  try {
    const sql =
      "INSERT INTO motos (nombre, descrip, tipo, precio, disponible) VALUES(?,?,?,?,?)";
    const { nombre, descrip, tipo, precio, disponible } = req.body;
    const [result] = await pool.query(sql, [
      nombre,
      descrip,
      tipo,
      precio,
      disponible,
    ]);
    // result.insertId tiene el id generado
    res.status(201).json({ id: result.insertId, nombre, descrip, tipo, precio, disponible });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const updateMoto = async (req,res)=>{
    try {
        const sql = "update motos set nombre=ifnull(?,nombre),descrip=ifnull(?,descrip),tipo=ifnull(?,tipo),precio=ifnull(?,precio),disponible=ifnull(?,disponible) where id=? "
        const { nombre, descrip, tipo, precio, disponible } = req.body; 
        const [result] = await pool.query(sql,[nombre, descrip, tipo, precio, disponible,req.params.id]) 
        if(result.affectedRows===0){
            return res.status(400).json({message:'motos no encontrada'})
        }
        const [rows] = await pool.query("select*from motos where id=?",req.params.id)
        res.json(rows)
        
    } catch (error) {
        return res.status(500).json(error)
    }
} 

export const deleteMoto = async (req,res)=>{ 
    try {
        const sql= "delete from motos where id=?"
        const [rows] = await pool.query(sql,req.params.id)
        
        if(rows.affectedRows <= 0){
            return res.status(404).json({message:"moto not found"})
        }
        res.sendStatus(204)
    } catch (error) {
        return res.status(500).json(error)        
    }
}
