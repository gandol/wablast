const db =require('./testing');
db.connect();
let sql = "update nomor_tujuan set send=0";
db.query(sql,function(err,res){
    if(err) throw err
    console.log("reset berhasil");
    db.destroy();
});