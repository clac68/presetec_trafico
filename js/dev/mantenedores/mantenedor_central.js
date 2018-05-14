function MantendedorCentrales(bd, config ){
  console.log('MantendedorCentrales: inicio');
  console.log(config);
  console.log(config.cb);
  this.bd=bd;
  this.cb=config.cb;
  this.addCodigoCentral=config.addCodigoCentral;
  this.addShortName=config.addShortName;
  this.addNombre=config.addNombre;
  this.addDescripcion=config.addDescripcion;
  this.btnAgregar=config.btnAgregar;
  this.btnEliminar=config.btnEliminar;
  this.btnActualizar=config.btnActualizar;
  this.btnAccion=config.btnAccion;
  this.contenedorTabla=config.contenedorTabla;
  this.infoAccion=config.infoAccion;
  this.contenedorAccion=config.contenedorAccion
  this.legend=config.legend;
  this.centrales=new Centrales(bd);
  this.table=new Tabla(this.contenedorTabla);
  this.Init();
}

MantendedorCentrales.prototype.initCbCentrales=function(){
    var dis=this;
    this.contenedorAccion.style.display = "none";
    this.cb.onchange=function(){
      dis.table.Delete();
      console.log('initCbCentrales:onchange');
      console.log(dis.cb.selectedIndex);
      if (dis.cb.selectedIndex<0){
        return;
      }
      var objTitulo={codigo:'Central', nombre:'Nombre', shortname:'Nombre Corto', descripcion:'Desripción'};
      var central=dis.cb.options[dis.cb.selectedIndex].value;
      var objData=dis.centrales.centrales[central];
      objData.codigo=central;
      dis.table.putTitulo(objTitulo);
      dis.table.putData(objData, objTitulo);
    };
};

MantendedorCentrales.prototype.initBtnAgregar=function(){
  var dis=this;
  this.btnAgregar.onclick=function(){
    dis.addCodigoCentral.disabled=false;
    dis.btnAccion.innerHTML="<b>Agregar Central</b>"
    dis.accion='Agregar';
    dis.contenedorAccion.style.display = "inline";
    dis.legend.innerHTML="Agregar Central";
  };
};

MantendedorCentrales.prototype.initBtnActualizar=function(){
  var dis=this;
  this.btnActualizar.onclick=function(){
    if (dis.cb.selectedIndex < 0){
      return;
    }
    var central=dis.cb.options[dis.cb.selectedIndex].value;
    var objCentral= dis.centrales.centrales[central];

    dis.addCodigoCentral.value=central;
    dis.addShortName.value=objCentral.shortname;
    dis.addNombre.value=objCentral.nombre;
    dis.addDescripcion.value=objCentral.descripcion;

    dis.addCodigoCentral.disabled=true;
    dis.btnAccion.innerHTML="<b>Actualizar Datos</b>"
    dis.accion='Actualizar';
    dis.legend.innerHTML="Actualizar los datos de "+central;
    dis.contenedorAccion.style.display = "inline";
  };
};

MantendedorCentrales.prototype.initBtnAccion=function(){
  var dis=this;
  this.btnAccion.onclick=function(){
    var codCentral = dis.addCodigoCentral.value;
    var shortName=dis.addShortName.value;
    var nombre=dis.addNombre.value;
    var desc = dis.addDescripcion.value;
    if(codCentral.length <= 0){
      window.alert("El código de la central no puede ser vacío");
      return;
    }
    if(shortName.length <= 0){
      window.alert("El campo Nombre Corto no puede ser vacío.");
      return;
    }
    if(nombre.length <= 0){
      window.alert("El Nombre de la central no puede ser vacío.");
      return;
    }
    if(desc.length <= 0){
      window.alert("Por fvor, incorpora una descripción de la central");
      return;
    }
    if (dis.accion == "Agregar"){
      if (typeof dis.centrales.centrales[codCentral] != 'undefined'){
        window.alert("La central "+codCentral+" ya existe!!!");
        return;
      }
    }
    dis.centrales.addCentral(codCentral, nombre, shortName, desc,function(){
      dis.contenedorAccion.style.display = "none";
      dis.UpdateCB();
      if(dis.accion=='Agregar'){
        dis.infoAccion.innerHTML="La central fue cargada exitosamnete.";
      }else{
        dis.infoAccion.innerHTML="La central fue actualiza exitosamnete.";
      }
    }, function(e){
      dis.infoAccion.innerHTML="Se produjo un error al cargar la central en la Base de Datos. Por favor intente más tarde.";
    });
  };
}

MantendedorCentrales.prototype.initBtnEliminar=function(){
  var dis=this;
  this.btnEliminar.onclick=function(){
    if (dis.cb.options.length <=0){
      return;
    }
    central=dis.cb.options[dis.cb.selectedIndex].value;
    if(!window.confirm('Estás a punto de eliminar la central ' +central+'. Estás seguro de querer borrarla?')){
      return;
    }
    dis.centrales.deleteCentral(central, function(){
        dis.contenedorAccion.style.display = "none";
        dis.UpdateCB();
        dis.infoAccion.innerHTML="La central fue eliminada exitosamnete.";
    }, function(e){
      dis.infoAccion.innerHTML="Se produjo un error al eliminar la central en la Base de Datos. Por favor intente más tarde.";
    });
  }
};

MantendedorCentrales.prototype.UpdateCB=function(){
  LimpiaComboBox(this.cb);
  this.table.Delete();
  for(var central in this.centrales.centrales){
    AddOption2Cb(this.cb, central, "", central);
  }
  if (this.cb.options.length > 0){
    this.cb.value=this.cb.options[0].value;
    this.cb.onchange();
  }
}
MantendedorCentrales.prototype.Init=function(){
  var dis=this;
  this.initCbCentrales();
  this.initBtnAgregar();
  this.initBtnActualizar();
  this.initBtnAccion();
  this.initBtnEliminar();
  this.centrales.getCentrales(function(data){
    dis.infoAccion.innerHTML="Se cargaron las centrales desde la Base de Datos";
    dis.UpdateCB();
  }, function(e){
    console.log('getCentrales:ERROR');
    console.log(e);
    dis.infoAccion.innerHtml='Error: No se pudo cargar las centrales desde la Base de Datos. Actualice la página y revide su conexión de red';
  });
}
