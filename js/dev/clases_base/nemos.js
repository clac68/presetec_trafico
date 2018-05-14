function Nemos(bd){
  this.bd=bd;
  this.nemos={};
  this.errores=[];
}
Nemos.prototype.getNemosFromFile=function(contenido){
  this.nemos={};
  var lines = contenido.split('\n');
  for(var i=0; i<lines.length; i++){
    linea=lines[i].split(";");
    if (linea.length < 2){
      this.errores.push("Error al cargar nemo. La línea "+i+" tiene menos de dos campos separados por ;");
    }else{
      var cod=linea[0].trim();
      if (cod.length!=4){
        this.errores.push("Error al cargar nemo. La línea "+i+" tiene un campo de largo distinto a 4");
      }else{
        this.nemos[cod]=linea[1].trim();
      }
    }
  }
  return this.nemos;
};

Nemos.prototype.getNemosFromBD=function(cb_ok, cb_error){
  var dis=this;
  this.bd.getData("/nemos", function(data){
    data.forEach(function(nemo){
      dis.nemos[nemo.key]=nemo.val();
    })
    cb_ok();
  }, function(e){
    console.log("getNemosFromBD:Error");
    console.log(e);
    cb_error(e);
  });
};

Nemos.prototype.addNemo=function(codigo, nemo, cb_ok, cb_error){
  var dis=this;
  this.bd.setData("/nemos/"+codigo, nemo, function(){
    dis.nemos[codigo]=nemo;
    cb_ok();
  }, function(e){
    cb_error(e);
  });
};

Nemos.prototype.deleteNemo=function(codigo, cb_ok, cb_error){
  var dis=this;
  this.bd.deleteData("/nemos/"+codigo, function(){
    delete dis.nemos[codigo];
    cb_ok();
  }, function(e){
    cb_error(e);
  });
};

Nemos.prototype.updateNemo=function(codigo, nemo, cb_ok, cb_error){
  var dis=this;
  this.bd.setData("/nemos/"+codigo,nemo, function(){
    dis.nemos[codigo]=nemo;
    cb_ok();
  }, function(e){
    cb_error(e);
  });
};

Nemos.prototype.saveNemos=function(cb_ok, cb_error){
  this.bd.setData('/nemos', this.nemos, function(){
    cb_ok();
  }, function(e){
    cb_error(e);
  });
}

Nemos.prototype.deleteNemos=function(cb_ok, cb_error){
  var dis=this;
  this.bd.deleteData("/nemos", function(){
    this.nemos={};
    cb_ok();
  }, function(e){
    cb_error(e);
  });
}
