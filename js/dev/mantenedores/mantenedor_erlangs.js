function MantenedorErlangs(bd, config){

  this.bd=bd;
  this.cbErlangs=config.cbErlangs;
  this.msg=config.msg;
  this.contenedorTablaErlang=config.contenedorTablaErlang;
  this.btnAddErlang=config.btnAddErlang;
  this.btnUpdateErlang=config.btnUpdateErlang;
  this.btnDeleteErlang=config.btnDeleteErlang
  this.btnUploadErlang=config.btnUploadErlang;
  this.inputCodeErlang=config.inputCodeErlang;
  this.inputValorErlang=config.inputValorErlang;
  this.btnAccionErlang=config.btnAccionErlang;
  this.fileErlang=config.fileErlang;
  this.contenedorTablaErlangs=config.contenedorTablaErlangs;
  this.fsAccion=config.fsAccion;
  this.fsLegendaAccion=config.fsLegendaAccion;
  this.fsCargaErlang=config.fsCargaErlang;
  this.btnCargarArchivoErlang=config.btnCargarArchivoErlang;
  this.erlangs=new Erlangs(this.bd);
  this.erlangs_temporal=null;
  this.tablaErlangs=new Tabla(this.contenedorTablaErlangs);
  this.tablaErlang=new Tabla(this.contenedorTablaErlang);
  this.Init();
}

MantenedorErlangs.prototype.initbtnAddErlang=function(){
  var dis=this;
  this.btnAddErlang.onclick=function(){
    dis.HideFrames();
    dis.inputCodeErlang.disabled=false;
    dis.fsLegendaAccion.innerHTML="Agrega un nuevo Erlang"
    dis.accion="add";
    dis.fsLegendaAccion="Agregar un valor de Erlang";
    dis.inputCodeErlang.value="";
    dis.inputValorErlang.value="";
    dis.fsAccion.style.display='inline';
  }
};

MantenedorErlangs.prototype.initbtnUpdateErlang=function(){
  var dis=this;
  this.btnUpdateErlang.onclick=function(){
    dis.fsLegendaAccion.innerHTML="Actualiza Erlangs"
    dis.HideFrames();
    dis.inputCodeErlang.disabled=true;
    if (dis.cbErlangs.options.length<=0){
      return;
    }
    dis.accion="update";
    dis.fsLegendaAccion="Agregar un valor de Erlang";
    var valorE=dis.cbErlangs.options[dis.cbErlangs.selectedIndex].value;
    dis.inputValorErlang.value=dis.erlangs.erlangs[valorE];
    dis.inputCodeErlang.value=valorE;
    dis.fsAccion.style.display='inline';
  }
}

MantenedorErlangs.prototype.initbtnDeleteErlang=function(){
  var dis=this;
  this.btnDeleteErlang.onclick=function(){
    dis.HideFrames();
    var valorE=dis.cbErlangs.options[dis.cbErlangs.selectedIndex].value;
    if (!confirm('Estás a punto de borrar el valor '+ valorE+". Estás seguro?")){
      return;
    }
    dis.erlangs.deleteErlang(valorE, function(){
      dis.msg.innerHTML="El valor "+valorE+" fue eliminado exitosamente de la base de datos.";
      dis.UpdateListaErlangs();
    }, function(e){
      dis.msg.innerHTML="No fue posible eliminar el valor "+valorE+" de la Base de Datos. Por favor, intenta más tarde";
    });
  }
}

MantenedorErlangs.prototype.initbtnUploadErlang=function(){
  var dis=this;
  this.btnUploadErlang.onclick=function(){
    dis.fsLegendaAccion.innerHtml="Selecciona archivo seprado por ;"
    dis.HideFrames();
    dis.fsCargaErlang.style.display = "block";
  };
};

MantenedorErlangs.prototype.initfileErlang=function(){
  var dis=this;
  this.fileErlang.onchange=function(e){
    var archivo = e.target.files[0];
    if (archivo){
      var lector = new FileReader();
      lector.onload = function(e) {
        console.log('lector.onload');
        dis.erlangs_temporal=new Erlangs(dis.bd);
        dis.erlangs_temporal.getErlangsFromFile(e.target.result);
        dis.updateListaErlangsTenporal();
        var count=0;
        for(var valor in dis.erlangs_temporal.erlangs){
          count++;
        }
        dis.msg.innerHTML="Se recuperaron "+count+" registros desde el archivo";
      }
      lector.readAsText(archivo);
    }
  };
}

MantenedorErlangs.prototype.updateListaErlangsTenporal=function(){

  this.tablaErlangs.Delete();
  var objTitulo={valor: "Valor", erlang: "Erlangs"};
  this.tablaErlangs.putTitulo(objTitulo);
  for(var valor in this.erlangs_temporal.erlangs){
    var data={valor: valor, erlang:this.erlangs_temporal.erlangs[valor]};
    this.tablaErlangs.putData(data, objTitulo );
  }
};

MantenedorErlangs.prototype.initbtnCargarArchivoErlang=function(){
  var dis=this;
  btnCargarArchivoErlang.onclick=function(){

    dis.tablaErlangs.Delete();
    dis.HideFrames();
    if (dis.erlangs_temporal== null){
      return;
    }
    if (!confirm('Vas a cargar los datos a la base de datos. Estás seguro?')){
      return;
    }
    dis.msg.innerHTML="Comenzando a grabar el archivo de erlngs en la base de datos";
    dis.erlangs_temporal.saveErlangs(function(){
      dis.fsCargaErlang.style.display='none';
      dis.msg.innerHTML='Los datos del archivo han sido cargados exitosamente en la Base de Datos';
      dis.getErlangsFromBD();
    }, function(e){
      dis.msg.innerHTML='Se produjo un error al cargar los datos en la Base de Datos. Por favor, reintente.';
    });
  };
};

MantenedorErlangs.prototype.getErlangsFromBD=function(){
  var dis=this;
  this.erlangs.getErlangsFromBD(function(){
    dis.UpdateListaErlangs();
    dis.msg.innerHTML='Los datos fueron rescatados existosamente desde la base de datos.';
  },  function(e){
    dis.msg.innerHTML='No fue posible obtener los datos desde la base de datos. Reintente más tarde';
  });
};

MantenedorErlangs.prototype.UpdateListaErlangs=function(){
  LimpiaComboBox(this.cbErlangs);
  this.tablaErlang.Delete();
  for(var valorE in this.erlangs.erlangs){
    AddOption2Cb(this.cbErlangs, valorE, "", valorE);
  }
  if (this.cbErlangs.options.length > 0){
    this.cbErlangs.value=this.cbErlangs.options[0].value;
    this.cbErlangs.onchange();
  }
};

MantenedorErlangs.prototype.initcbErlangs=function(){
  var dis=this;
  this.cbErlangs.onchange=function(){
    dis.tablaErlang.Delete();
    if (dis.cbErlangs.options.length<=0){
      return;
    }
    var valorE=dis.cbErlangs.options[dis.cbErlangs.selectedIndex].value;
    var objTitulo={valor: "Valor", erlang: "Erlangs"};
    dis.tablaErlang.putTitulo(objTitulo);
    var data={valor: valorE, erlang:dis.erlangs.erlangs[valorE]};
    dis.tablaErlang.putData(data, objTitulo );
  };
};
MantenedorErlangs.prototype.initbtnAccionErlang=function(){
  var dis=this;
  btnAccionErlang.onclick=function(){
    var valorE=dis.inputCodeErlang.value;
    var erlang=dis.inputValorErlang.value;
    if (!dis.ValidarDatos(valorE, erlang)){
      return;
    }
    if (dis.accion=="update"){
      if (confirm('Vas a actualizar el valor '+valorE+' en la Base de Datos.Estás seguro?')){
        dis.msg.innerHTML="Actualizando el registro con valor "+valorE+' en la base de datos';
        dis.updateErlangInBD(valorE, erlang);
      }
      return;
    }else{
      if (confirm('Vas a agregar un nuevo registro con valor '+valorE+' en la Base de Datos.Estás seguro?')){
        dis.msg.innerHTML="Agregando el registro con valor "+valorE+' en la base de datos';
        dis.addErlang2BD(valorE, erlang);
      }
      return;
    }
  };
};
MantenedorErlangs.prototype.addErlang2BD=function(valorE, erlang){
  var dis=this;
  if (typeof this.erlangs.erlangs[valorE]!='undefined'){
    window.alert('El valor '+valorE +' ya existe en la Base de Datos. Actualice en vez de agregar');
    return;
  }
  this.erlangs.addErlang(valorE, erlang, function(){
    dis.HideFrames();
    dis.UpdateListaErlangs();
    dis.msg.innerHTML="El valor "+valorE+" fue agregado a la Base de Datos";
  }, function(e){
    dis.msg.innerHTML="Error. El valor "+valorE+" no fue agregado en la base de datos. Por favor, reintente más tarde";
  });
};

MantenedorErlangs.prototype.updateErlangInBD=function(valorE, erlang){
  var dis=this;
  if (typeof this.erlangs.erlangs[valorE]=='undefined'){
    window.alert('El valor '+valorE +' no existe en la Base de Datos. No es posible actualizar');
    return;
  }
  this.erlangs.updateErlang(valorE, erlang, function(){
    dis.msg.innerHTML="El valor "+valorE+" fue actualizado en la Base de Datos";
    dis.HideFrames();
    dis.UpdateListaErlangs();
  }, function(e){
    dis.msg.innerHTML="Error. El valor "+valorE+" no fue actualizado en la base de datos. Por favor, reintente más tarde";
  });
};

MantenedorErlangs.prototype.ValidarDatos=function(valor, erlang){
    if (isNaN(valor)){
      window.alert('El valor ingresado '+ valor +' no es un número válido');
      return false;
    }
    if (isNaN(erlang)){
      window.alert('El valor de erlang ingresado '+ valor +' no es un número');
      return false;
    }
    return true;
};
MantenedorErlangs.prototype.HideFrames=function(){
  this.fsAccion.style.display='none';
  this.fsCargaErlang.style.display='none';
};

MantenedorErlangs.prototype.Init=function(){
  this.fsAccion.style.display = "none";
  this.fsCargaErlang.style.display = "none";
  this.initbtnAddErlang();
  this.initbtnUpdateErlang();
  this.initbtnDeleteErlang();
  this.initbtnUploadErlang();
  this.initbtnAccionErlang();
  this.initfileErlang();
  this.initcbErlangs();
  this.initbtnCargarArchivoErlang();
  this.getErlangsFromBD();
};
