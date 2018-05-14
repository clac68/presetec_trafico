function Centrales(bd){
  this.bd=bd;
  this.centrales={};
}

Centrales.prototype.addCentral= function(central, name, shortname, descripcion,cb_ok, cb_error){
  var dis=this;
  var data={nombre:name, shortname:shortname, descripcion:descripcion};
  this.bd.setData("/centrales/"+central, data, function(){
    dis.centrales[central]= data;
    cb_ok();
  }, function(e){
    cb_error(e);
  });
  return this;
};

Centrales.prototype.updateCentral= function(central, name, shortname, descripcion,cb_ok, cb_error){
  if (typeof this.centrales[central]=="undefined"){
    cb_error({code:"/central/no_existe", msg:"La central no existe"});
    return;
  }
  var dis=this;
  var data={nombre:name, shortname:shortname, descripcion:descripcion};
  this.bd.setData("/centrales/"+central, data, function(){
    dis.centrales[central]= data;
    cb_ok();
  }, function(e){
    cb_error(e);
  });
  return this;
};

Centrales.prototype.deleteCentral= function(central, cb_ok, cb_error){
  var dis=this;
  this.bd.deleteData("/centrales/"+central, function(){
    if (typeof dis.centrales[central] != 'undefined'){
      delete dis.centrales[central];
    }
    cb_ok();
  }, function(e){
    cb_error(e);
  });
  return this;
};

Centrales.prototype.getCentrales=function(cb_ok, cb_error){
  objCentrales={};
  var dis=this;
  this.bd.getData( "/centrales", function(data){
    data.forEach(function(central){
      objCentrales[central.key]=SnapShot2Object(central);
    })
    dis.centrales=objCentrales;
    cb_ok(objCentrales);
  }, function(e){
    cb_error(e);
  });
};

Centrales.prototype.getCentralFromShortName=function(shortname){
  for(var central in this.centrales){
    if(this.centrales[central].shortname == shortname){
      return central;
    }
  }
  return;
};
