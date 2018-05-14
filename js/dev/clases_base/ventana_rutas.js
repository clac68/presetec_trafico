
function VentanaRutas(contenedor,centrales,rutas, rutasAnt){
  for(var fecha in rutas.dataRutas){};
  this.fecha=fecha;
  for(var fecha in rutasAnt.dataRutas){};
  this.fechaAnt=fecha;
  this.cont=contenedor;
  while(this.cont.firstChild){
    this.cont.removeChild(this.cont.firstChild);
  }
  this.rutas=rutas;
  this.rutasAnt=rutasAnt;
  this.centrales=centrales;
  this.comparacion=this.rutas.getDiferenciaRutas(this.rutasAnt);
  this.init();

}

VentanaRutas.prototype.init=function(){
  this.contRutas=document.createElement('div');
  this.contRutas.setAttribute('class', 'ventana_rutas');
  this.cont.appendChild(this.contRutas);

  var label=document.createElement('label');
  this.cbCentrales=document.createElement('select');
  label.appendChild(document.createTextNode('Centrales'));
  label.appendChild(this.cbCentrales);
  this.contRutas.appendChild(label);

  var label=document.createElement('label');
  this.cbRutas=document.createElement('select');
  label.appendChild(document.createTextNode('Rutas'));
  label.appendChild(this.cbRutas);
  this.contRutas.appendChild(label);
  this.contRutas.appendChild(document.createElement('br'));


  this.contOpciones=document.createElement('div');
  this.contRutas.appendChild(this.contOpciones);

  var label=document.createElement('label');
  label.setAttribute('class', 'radio_button');
  this.optionTodas=document.createElement('input');
  this.optionTodas.setAttribute('name', 'rbRutas');
  this.optionTodas.setAttribute('type', 'radio');
  label.appendChild(document.createTextNode('Detalle de Rutas'));
  label.appendChild(this.optionTodas);
  var span=document.createElement('span');
  span.setAttribute('class', 'checkmark');
  label.appendChild(span);
  this.contOpciones.appendChild(label);

  var label=document.createElement('label');
  label.setAttribute('class', 'radio_button');
  this.optionAgregadas=document.createElement('input');
  this.optionAgregadas.setAttribute('name', 'rbRutas');
  this.optionAgregadas.setAttribute('type', 'radio');
  label.appendChild(document.createTextNode('Rutas Agregadas'));
  label.appendChild(this.optionAgregadas);
  var span=document.createElement('span');
  span.setAttribute('class', 'checkmark');
  label.appendChild(span);
  this.contOpciones.appendChild(label);

  var label=document.createElement('label');
  label.setAttribute('class', 'radio_button');
  this.optionEliminadas=document.createElement('input');
  this.optionEliminadas.setAttribute('name', 'rbRutas');
  this.optionEliminadas.setAttribute('type', 'radio');
  label.appendChild(document.createTextNode('Rutas Eliminadas'));
  label.appendChild(this.optionEliminadas);
  var span=document.createElement('span');
  span.setAttribute('class', 'checkmark');
  label.appendChild(span);
  this.contOpciones.appendChild(label);

  var label=document.createElement('label');
  label.setAttribute('class', 'radio_button');
  this.optionCambio=document.createElement('input');
  this.optionCambio.setAttribute('name', 'rbRutas');
  this.optionCambio.setAttribute('type', 'radio');
  label.appendChild(document.createTextNode('Cambio de Parámetros'));
  label.appendChild(this.optionCambio);
  var span=document.createElement('span');
  span.setAttribute('class', 'checkmark');
  label.appendChild(span);
  this.contOpciones.appendChild(label);

  this.contOpciones.appendChild(document.createElement('br'));

  this.contTabla=document.createElement('div');
  this.cont.appendChild(this.contTabla);
  this.tabla= new Tabla(this.contTabla);

  this.tabla.Delete();
  this.initcbCentrales();
  this.initcbRutas();
  this.initOptions();
  this.initData();
};

VentanaRutas.prototype.initcbCentrales=function(){
  var dis=this;
  this.cbCentrales.onchange=function(){
    if(dis.cbCentrales.selectedIndex<0){
      return;
    }
    LimpiaComboBox(dis.cbRutas);
    var centralSelected=dis.cbCentrales.options[dis.cbCentrales.selectedIndex].value;
    var objTitulo=dis.getTitulo();
    AddOption2Cb(dis.cbRutas,'TODAS','', 'TODAS');
    if(centralSelected!='TODAS'){
      var objCentral=dis.centrales.centrales[centralSelected];
      if((typeof dis.rutas.dataRutas[dis.fecha]!='undefined')&&(typeof dis.rutas.dataRutas[dis.fecha][centralSelected]!='undefined')){
        for(var ruta in dis.rutas.dataRutas[dis.fecha][centralSelected]){
          var str=objCentral.shortname+'-'+ruta;
          AddOption2Cb(dis.cbRutas,str,'', str);
        }
      }else{
        console.error('initcbCentrales: No fue posible encontrar la ruta.');
        console.error('fecha:'+dis.fecha);
        console.error('central:'+centralSelected);
        console.error(dis.rutas.dataRutas);
      }
    }else{
      for(var central in dis.centrales.centrales){
        if((typeof dis.rutas.dataRutas[dis.fecha]!='undefined')&&(typeof dis.rutas.dataRutas[dis.fecha][central]!='undefined')){
          var objCentral=dis.centrales.centrales[central];
          for(var ruta in dis.rutas.dataRutas[dis.fecha][central]){
            var str=objCentral.shortname+'-'+ruta;
            AddOption2Cb(dis.cbRutas,str,'', str);
          }
        }else{
          console.error('initcbCentrales: No fue posible encontrar la ruta.');
          console.error('fecha:'+dis.fecha);
          console.error('central:'+central);
          console.error(dis.rutas.dataRutas);
        }
      }
    }
    dis.cbRutas.value='TODAS';
    dis.cbRutas.onchange();
  };
};
VentanaRutas.prototype.initcbRutas=function(){
  var dis=this;
  this.cbRutas.onchange=function(){
    dis.optionTodas.checked=true;
    dis.showData();
  };
};

VentanaRutas.prototype.showData=function(){
  var arrFecha=this.fecha.split('-');
  if(this.optionTodas.checked){
    this.tabla.enableMenu('detalle_rutas_'+arrFecha[0]+'.'+arrFecha[1]);
    this.showDetalle();
    return;
  }
  if(this.optionAgregadas.checked){
    this.tabla.enableMenu('rutas_agregadas_'+arrFecha[0]+'.'+arrFecha[1]);
    this.showRutas(this.comparacion.nuevas, this.rutas);
    return;
  }
  if(this.optionEliminadas.checked){
    this.tabla.enableMenu('rutas_eliminadas_'+arrFecha[0]+'.'+arrFecha[1]);
    this.showRutas(this.comparacion.eliminadas, this.rutasAnt);
    return;
  }
  if(this.optionCambio.checked){
    this.tabla.enableMenu('rutas_modificadas_'+arrFecha[0]+'.'+arrFecha[1]);
    this.showRutasDiferentes(this.comparacion.diferentes, this.rutas, this.rutasAnt);
    return;
  }
};
VentanaRutas.prototype.showRutasDiferentes=function(datos, rutas, rutas2){
  this.tabla.Delete();
  var objTitulo=this.getTitulo();
  this.tabla.putTitulo(objTitulo);
  for(var fecha in datos){
    for(var central in datos[fecha]){
        for(var ruta in datos[fecha][central]){
          var objRuta = rutas.dataRutas[this.fecha][central][ruta];
          var objRuta2 = rutas2.dataRutas[this.fechaAnt][central][ruta];
          var data=Object.assign({},objRuta);
          var data2=Object.assign({},objRuta2);
          data.central=this.centrales.centrales[central].nombre;
          data2.central=this.centrales.centrales[central].nombre;
          data.ruta=ruta;
          data2.ruta=ruta;
          data.fecha=this.fecha;
          data2.fecha=this.fechaAnt;
          this.tabla.putData(data, objTitulo);
          this.tabla.putData(data2, objTitulo);
        }
    }
  }
};
VentanaRutas.prototype.showRutas=function(datos, rutas, rutas2){
  this.tabla.Delete();
  var objTitulo=this.getTitulo();
  this.tabla.putTitulo(objTitulo);
  for(var fecha in datos){
    for(var central in datos[fecha]){
      for(var ruta in datos[fecha][central]){
        var objRuta = rutas.dataRutas[fecha][central][ruta];
        var data=Object.assign({},objRuta);
        data.central=this.centrales.centrales[central].nombre;
        data.ruta=ruta;
        data.fecha=fecha;
        this.tabla.putData(data, objTitulo);
        if(typeof rutas2 != 'undefined'){
          var objRuta = rutas.dataRutas[fecha][central][ruta];
          var data=Object.assign({},objRuta);
          data.central=this.centrales.centrales[central];
          data.ruta=ruta;
          data.fecha=fecha;
          dis.tabla.putData(data, objTitulo);
        }
      }
    }
  }
};
VentanaRutas.prototype.showDetalle=function(){
  if(this.cbRutas.selectedIndex<0){
    return;
  }
  var rutaSelected=this.cbRutas.options[this.cbRutas.selectedIndex].value;
  this.tabla.Delete();
  var objTitulo=this.getTitulo();
  this.tabla.putTitulo(objTitulo);
  if(rutaSelected!='TODAS'){
    var arrRuta=rutaSelected.split('-');
    var central=this.centrales.getCentralFromShortName(arrRuta[0]);
    var ruta=arrRuta[1];
    var objRuta=this.getObjRuta(this.rutas, this.fecha, central, ruta);
    if(typeof objRuta != 'undefined'){
      var data=Object.assign({}, objRuta);

      data.fecha=this.fecha;
      data.central=this.centrales.centrales[central].nombre;
      data.ruta=ruta;
      this.tabla.putData(data, objTitulo);
    }
  }else{
    for(var i=0;i<this.cbRutas.options.length;i++){
      var arrRuta=this.cbRutas.options[i].value.split('-');
      if(arrRuta.length>1){
        var central=this.centrales.getCentralFromShortName(arrRuta[0]);
        var ruta=arrRuta[1];
        var objRuta=this.getObjRuta(this.rutas, this.fecha, central, ruta);
        if(typeof objRuta != 'undefined'){
          var data=Object.assign({}, objRuta);
          data.fecha=this.fecha;
          data.central=this.centrales.centrales[central].nombre;
          data.ruta=ruta;
          this.tabla.putData(data, objTitulo);
        }
      }
    }
  }
};
VentanaRutas.prototype.initOptions=function(){
  var dis=this;
  this.optionTodas.onchange=function(){
    dis.showData();
  };
  this.optionCambio.onchange=function(){
    dis.showData();
  };
  this.optionAgregadas.onchange=function(){
    dis.showData();
  };
  this.optionEliminadas.onchange=function(){
    dis.showData();
  };
};
VentanaRutas.prototype.initData=function(){
  var dis=this;
  LimpiaComboBox(this.cbCentrales);
  AddOption2Cb(this.cbCentrales,'TODAS','','TODAS')
  for(var central in this.centrales.centrales){
    AddOption2Cb(this.cbCentrales,central,'',this.centrales.centrales[central].nombre);
  }
  this.cbCentrales.value='TODAS';
  this.cbCentrales.onchange();
};

VentanaRutas.prototype.getTitulo=function(){
  var objTitulo={fecha:'Fecha', central:'Central', ruta:'Ruta'};
  objTitulo.circ='Circuitos';
  objTitulo.tipo='Tipo';
  objTitulo.dir='Dirección';
  objTitulo.inf='Información';
  objTitulo.nem='Compañía';
  objTitulo.tipo='Tipo';
  objTitulo.area='Área';
  objTitulo.cod='Código';
  objTitulo.sen='Señalización';
  objTitulo.pco='PCO';
  objTitulo.pcd='PCD';
  objTitulo.sis='Sistema';
  return objTitulo;
};

VentanaRutas.prototype.getObjRuta=function(rutas, fecha, central, ruta){
  if(typeof rutas.dataRutas[fecha]=='undefined'){
    return;
  }
  if(typeof rutas.dataRutas[fecha][central]=='undefined'){
    return;
  }
  if(typeof rutas.dataRutas[fecha][central][ruta]=='undefined'){
    return;
  }
  return rutas.dataRutas[fecha][central][ruta];
};
