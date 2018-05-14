function Erlangs(bd){
  this.bd=bd;
  this.erlangs={};
}

Erlangs.prototype.addErlang=function(numero, erlang, cb_ok, cb_error){
  if (typeof this.erlangs[numero] != 'undefined'){
    cb_error({code:"erlang/duplicado", msg: 'El dato ya existe en la base de datos'})
    return;
  }
  var dis=this;
  this.bd.setData("/erlangs/"+numero, erlang, function(){
    dis.erlangs[numero]=erlang;
    cb_ok();
  }, function(e){
    cb_error({code:"erlang/network_error", msg: 'Se produjo un problema en la carga de datos'})
    console.log("AddErlang");
    console.log(e);
  });
};

Erlangs.prototype.updateErlang=function(numero, erlang, cb_ok, cb_error){
  if (typeof this.erlangs[numero] == 'undefined'){
    cb_error({code:"erlang/no_existe", msg: 'El dato no existe.'})
    return;
  }
  var dis=this;
  this.bd.setData("/erlangs/"+numero, erlang, function(){
    dis.erlangs[numero]=erlang;
    cb_ok();
  }, function(e){
    cb_error({code:"erlang/network_error", msg: 'Se produjo un problema en la carga de datos'})
    console.log("updateErlang");
    console.log(e);
  });
};

Erlangs.prototype.deleteErlang=function(numero, cb_ok, cb_error){
  if (typeof this.erlangs[numero] == 'undefined'){
    cb_error({code:"erlang/no_existe", msg: 'El dato no existe.'});
    console.log("deleteErlang: Dato:"+numero);
    return;
  }
  var dis=this;
  this.bd.deleteData("/erlangs/"+numero, function(){
    delete dis.erlangs[numero];
    cb_ok();
  }, function(e){
    cb_error({code:"erlang/network_error", msg: 'Se produjo un problema en la carga de datos'})
    console.log("deleteErlang");
    console.log(e);
  });
};

Erlangs.prototype.getErlangsFromBD=function(cb_ok, cb_error){
  this.erlangs={};
  var dis=this;
  this.bd.getData("/erlangs", function(data){
    data.forEach(function(erl){
      dis.erlangs[erl.key]=erl.val();
    })
    cb_ok(dis.erlangs);
  }, function(e){
    cb_error(e);
  });
};

Erlangs.prototype.deleteErlangs=function(cb_ok, cb_error){
  var dis=this;
  this.bd.deleteData("/erlangs", function(){
    delete dis.erlangs;
    dis.erlangs={};
    cb_ok();
  }, function(e){
    cb_error(e);
  });
};

Erlangs.prototype.saveErlangs=function(cb_ok, cb_error){
  this.bd.setData("/erlangs", this.erlangs, function(){
    cb_ok();
  }, function(e){
    cb_error(e);
  });
};

Erlangs.prototype.getErlangsFromFile=function(contenido){
  var data;
  var error=[];
  var warning=[];
  this.erlangs={};
  var lines = contenido.split("\n");
  for (var i=0;i<lines.length;i++){
    if (i>0){
      data = lines[i].split(";");
      if (data.length == 2){
        var val=Number(data[0]);
        if (typeof this.erlangs[val] == 'undefined'){
          this.erlangs[val]=this.getNumberDataConPunto(data[1]);
        }else{
          error.push("Línea " + i + ": El valor "+ val + " está repetido.");
        }
      }else{
        if (data.length<2){
          error.push("Línea " + i + ": tiene menos de 2 campos separados por ;")
        }else{
          warning.push("Línea "+i+ "tiene más de 2 campos. Línea="+lines[i]);
        }
      }
    }
  }
  return this.erlangs;
};


Erlangs.prototype.getNumberDataConPunto=function(strData){
  var strAux=strData.split(".");
  if (strAux.length<2){
    return Number(strData);
  }
  if (strAux[1].length == 1){
    return Number(strAux[0])+Number(strAux[1]/10);
  }
  return Number(strAux[0])+Number(strAux[1].slice(0,2))/100;
};

Erlangs.prototype.CalculaErlang=function(circuitos){
  if(typeof this.erlangs[circuitos]=='undefined'){
    return circuitos;
  }
  return this.erlangs[circuitos];
}
