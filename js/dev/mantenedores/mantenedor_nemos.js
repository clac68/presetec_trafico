function Mantenedornemos(bd, config){

  this.bd=bd;
  this.cbnemos=config.cbnemos;
  this.msg=config.msg;
  this.contenedorTablanemo=config.contenedorTablanemo;
  this.btnAddnemo=config.btnAddnemo;
  this.btnUpdatenemo=config.btnUpdatenemo;
  this.btnDeletenemo=config.btnDeletenemo
  this.btnUploadnemo=config.btnUploadnemo;
  this.inputCodenemo=config.inputCodenemo;
  this.inputValornemo=config.inputValornemo;
  this.btnAccionnemo=config.btnAccionnemo;
  this.filenemo=config.filenemo;
  this.contenedorTablanemos=config.contenedorTablanemos;
  this.fsAccion=config.fsAccion;
  this.fsLegendaAccion=config.fsLegendaAccion;
  this.fsCarganemo=config.fsCarganemo;
  this.btnCargarArchivonemo=config.btnCargarArchivonemo;
  this.nemos=new Nemos(this.bd);
  this.nemos_temporal=null;
  this.tablanemos=new Tabla(this.contenedorTablanemos);
  this.tablanemo=new Tabla(this.contenedorTablanemo);
  this.Init();
}

Mantenedornemos.prototype.initbtnAddnemo=function(){
  var dis=this;
  this.btnAddnemo.onclick=function(){
    dis.HideFrames();
    dis.inputCodenemo.disabled=false;
    dis.fsLegendaAccion.innerHTML="Agrega un nuevo nemo"
    dis.accion="add";
    dis.fsLegendaAccion="Agregar un valor de nemo";
    dis.inputCodenemo.value="";
    dis.inputValornemo.value="";
    dis.fsAccion.style.display='inline';
  }
};

Mantenedornemos.prototype.initbtnUpdatenemo=function(){
  var dis=this;
  this.btnUpdatenemo.onclick=function(){
    dis.fsLegendaAccion.innerHTML="Actualiza nemos"
    dis.HideFrames();
    dis.inputCodenemo.disabled=true;
    if (dis.cbnemos.options.length<=0){
      return;
    }
    dis.accion="update";
    dis.fsLegendaAccion="Agregar un valor de nemo";
    var valorE=dis.cbnemos.options[dis.cbnemos.selectedIndex].value;
    dis.inputValornemo.value=dis.nemos.nemos[valorE];
    dis.inputCodenemo.value=valorE;
    dis.fsAccion.style.display='inline';
  }
}

Mantenedornemos.prototype.initbtnDeletenemo=function(){
  var dis=this;
  this.btnDeletenemo.onclick=function(){
    dis.HideFrames();
    var valorE=dis.cbnemos.options[dis.cbnemos.selectedIndex].value;
    if (!confirm('Estás a punto de borrar el valor '+ valorE+". Estás seguro?")){
      return;
    }
    dis.nemos.deleteNemo(valorE, function(){
      dis.msg.innerHTML="El valor "+valorE+" fue eliminado exitosamente de la base de datos.";
      dis.UpdateListanemos();
    }, function(e){
      dis.msg.innerHTML="No fue posible eliminar el valor "+valorE+" de la Base de Datos. Por favor, intenta más tarde";
    });
  }
}

Mantenedornemos.prototype.initbtnUploadnemo=function(){
  var dis=this;
  this.btnUploadnemo.onclick=function(){
    dis.fsLegendaAccion.innerHtml="Selecciona archivo seprado por ;"
    dis.HideFrames();
    dis.fsCarganemo.style.display = "block";
  };
};

Mantenedornemos.prototype.initfilenemo=function(){
  var dis=this;
  this.filenemo.onchange=function(e){
    var archivo = e.target.files[0];
    if (archivo){
      var lector = new FileReader();
      lector.onload = function(e) {
        console.log('lector.onload');
        dis.nemos_temporal=new Nemos(dis.bd);
        dis.nemos_temporal.getNemosFromFile(e.target.result);
        dis.updateListanemosTenporal();
        var count=0;
        for(var valor in dis.nemos_temporal.nemos){
          count++;
        }
        dis.msg.innerHTML="Se recuperaron "+count+" registros desde el archivo";
      }
      lector.readAsText(archivo);
    }
  };
}

Mantenedornemos.prototype.updateListanemosTenporal=function(){

  this.tablanemos.Delete();
  var objTitulo={valor: "Valor", nemo: "nemos"};
  this.tablanemos.putTitulo(objTitulo);
  for(var valor in this.nemos_temporal.nemos){
    var data={valor: valor, nemo:this.nemos_temporal.nemos[valor]};
    this.tablanemos.putData(data, objTitulo );
  }
};

Mantenedornemos.prototype.initbtnCargarArchivonemo=function(){
  var dis=this;
  btnCargarArchivonemo.onclick=function(){

    dis.tablanemos.Delete();
    dis.HideFrames();
    if (dis.nemos_temporal== null){
      return;
    }
    if (!confirm('Vas a cargar los datos a la base de datos. Estás seguro?')){
      return;
    }
    dis.msg.innerHTML="Comenzando a grabar el archivo de erlngs en la base de datos";
    dis.nemos_temporal.saveNemos(function(){
      dis.fsCarganemo.style.display='none';
      dis.msg.innerHTML='Los datos del archivo han sido cargados exitosamente en la Base de Datos';
      dis.getnemosFromBD();
    }, function(e){
      dis.msg.innerHTML='Se produjo un error al cargar los datos en la Base de Datos. Por favor, reintente.';
    });
  };
};

Mantenedornemos.prototype.getnemosFromBD=function(){
  var dis=this;
  this.nemos.getNemosFromBD(function(){
    dis.UpdateListanemos();
    dis.msg.innerHTML='Los datos fueron rescatados existosamente desde la base de datos.';
  },  function(e){
    dis.msg.innerHTML='No fue posible obtener los datos desde la base de datos. Reintente más tarde';
  });
};

Mantenedornemos.prototype.UpdateListanemos=function(){
  LimpiaComboBox(this.cbnemos);
  this.tablanemo.Delete();
  for(var valorE in this.nemos.nemos){
    AddOption2Cb(this.cbnemos, valorE, "", valorE);
  }
  if (this.cbnemos.options.length > 0){
    this.cbnemos.value=this.cbnemos.options[0].value;
    this.cbnemos.onchange();
  }
};

Mantenedornemos.prototype.initcbnemos=function(){
  var dis=this;
  this.cbnemos.onchange=function(){
    dis.tablanemo.Delete();
    if (dis.cbnemos.options.length<=0){
      return;
    }
    var valorE=dis.cbnemos.options[dis.cbnemos.selectedIndex].value;
    var objTitulo={valor: "Valor", nemo: "nemos"};
    dis.tablanemo.putTitulo(objTitulo);
    var data={valor: valorE, nemo:dis.nemos.nemos[valorE]};
    dis.tablanemo.putData(data, objTitulo );
  };
};
Mantenedornemos.prototype.initbtnAccionnemo=function(){
  var dis=this;
  btnAccionnemo.onclick=function(){
    var valorE=dis.inputCodenemo.value;
    var nemo=dis.inputValornemo.value;
    if (!dis.ValidarDatos(valorE, nemo)){
      return;
    }
    if (dis.accion=="update"){
      if (confirm('Vas a actualizar el valor '+valorE+' en la Base de Datos.Estás seguro?')){
        dis.msg.innerHTML="Actualizando el registro con valor "+valorE+' en la base de datos';
        dis.updatenemoInBD(valorE, nemo);
      }
      return;
    }else{
      if (confirm('Vas a agregar un nuevo registro con valor '+valorE+' en la Base de Datos.Estás seguro?')){
        dis.msg.innerHTML="Agregando el registro con valor "+valorE+' en la base de datos';
        dis.addnemo2BD(valorE, nemo);
      }
      return;
    }
  };
};
Mantenedornemos.prototype.addnemo2BD=function(valorE, nemo){
  var dis=this;
  if (typeof this.nemos.nemos[valorE]!='undefined'){
    window.alert('El valor '+valorE +' ya existe en la Base de Datos. Actualice en vez de agregar');
    return;
  }
  this.nemos.addNemo(valorE, nemo, function(){
    dis.HideFrames();
    dis.UpdateListanemos();
    dis.msg.innerHTML="El valor "+valorE+" fue agregado a la Base de Datos";
  }, function(e){
    dis.msg.innerHTML="Error. El valor "+valorE+" no fue agregado en la base de datos. Por favor, reintente más tarde";
  });
};

Mantenedornemos.prototype.updatenemoInBD=function(valorE, nemo){
  var dis=this;
  if (typeof this.nemos.nemos[valorE]=='undefined'){
    window.alert('El valor '+valorE +' no existe en la Base de Datos. No es posible actualizar');
    return;
  }
  this.nemos.updateNemo(valorE, nemo, function(){
    dis.msg.innerHTML="El valor "+valorE+" fue actualizado en la Base de Datos";
    dis.HideFrames();
    dis.UpdateListanemos();
  }, function(e){
    dis.msg.innerHTML="Error. El valor "+valorE+" no fue actualizado en la base de datos. Por favor, reintente más tarde";
  });
};

Mantenedornemos.prototype.ValidarDatos=function(valor, nemo){
    if (valor.length!=4){
      window.alert('El valor ingresado '+ valor +' debe tener cuatro caracteres');
      return false;
    }
    if (nemo.length <4){
      window.alert('El valor de nemo ingresado '+ nemo +' debe tener un valor mayor a 4');
      return false;
    }
    return true;
};
Mantenedornemos.prototype.HideFrames=function(){
  this.fsAccion.style.display='none';
  this.fsCarganemo.style.display='none';
};

Mantenedornemos.prototype.Init=function(){
  this.fsAccion.style.display = "none";
  this.fsCarganemo.style.display = "none";
  this.initbtnAddnemo();
  this.initbtnUpdatenemo();
  this.initbtnDeletenemo();
  this.initbtnUploadnemo();
  this.initbtnAccionnemo();
  this.initfilenemo();
  this.initcbnemos();
  this.initbtnCargarArchivonemo();
  this.getnemosFromBD();
};
