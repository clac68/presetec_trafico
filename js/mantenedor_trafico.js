function AgregaMantenedorTraficoEventListeners(){

  document.getElementById('ArchivoTrafico')
    .addEventListener('change', leerArchivoTrafico, false);

  document.addEventListener("set_data", function(d){

    var cb = document.getElementById("cbTraficoErrores");
    LimpiaComboBox(cb);
    var a=document.archivos_a_cargar[d.detail.id];
    console.log(document.archivos_a_cargar);
    if ( typeof a == "undefined"){
      console.log("mantenedor_trafico: addEventListener: set_data: Error: No encontré archivo a cargar ");
      return;
    }
    if (d.detail.res=="OK"){
      a.state="OK";
    }else{
      a.state="ERROR";
      a.error=d.detail.error;
      AddOption2Cb(cb, valor, "", a.file+"-"+a.fecha+"-"+a.central+":Error de carga:"+e);
    }

    var cOK=0;
    var cError=0;
    var cCargar=0;
    for(var data in document.archivos_a_cargar){
      switch (document.archivos_a_cargar[data].state){
        case "OK":
          cOK++;
          break;
        case "ERROR":
          cError++;
          break;
        default:
          cCargar++;
          break;
      }
    }
    var bp=document.getElementById("mantenedor_trafico_barra_progreso_carga");
    console.log("cOK+cError+CCargar:"+cOK+cError+cCargar);
    console.log("document.archivos_a_cargar.length:"+document.archivos_a_cargar.length);
    bp.value=cOK+cError;
    bp.max=cOK+cError+cCargar;
    if (cCargar == 0){
      if (cError > 0){
        sendMsgMantenedorTraficoCarga("Se procesaron todos los datos. Sin embargo, se produjeron "+cError+" errores. Revíselos y cargue nuevamente.");
      }else{
        sendMsgMantenedorTraficoCarga("Los datos se cargaron EXITOSAMENTE en la base de datos.");
      }
    }
    console.log("addEventListener:set_data");
    console.log(d);
  });

  document.getElementById('btncargaTrafico')
    .addEventListener('click', function(){
      if (document.archivos == "undefined"){
        window.alert("Error. No has cargado archivos aún");
        return;
      }
      var bp=document.getElementById("mantenedor_trafico_barra_progreso_carga");
      bp.value=0;
      bp.max=document.archivos.length;
      document.archivos_a_cargar={};
      sendMsgMantenedorTraficoCarga("Iniciando carga de "+document.archivos.length+" archivos.");
      for(var i=0; i<document.archivos.length;i++){
        dTrafico=document.archivos[i][1];
        dTrafico.getDataDiaria2BD().forEach(function(objCarga){
          var id=dTrafico.filename+objCarga.fecha+objCarga.central;
          document.archivos_a_cargar[id]={state: "CARGAR", error:null, file:dTrafico.filename, fecha: objCarga.fecha, central: objCarga.central};
          DataCarga.setData(id, objCarga.path, objCarga.data);
        });
/*
        for(var fecha in dTrafico.dataDiaria){
          for(var central in dTrafico.dataDiaria[fecha]){
            var id=dTrafico.filename+"-"+fecha+"-"+central;
            document.archivos_a_cargar[id]={state: "CARGAR", error:null, file:dTrafico.filename, fecha: fecha, central: central };
            var sfecha=fecha.split("-")
            DataCarga.setData(id, "/tDiaria/"+sfecha[0]+"/"+sfecha[1]+"/"+sfecha[2]"/"+central+"/", dTrafico.dataDiaria[fecha][central]);
          }
        }
        */
      }
    }, false);

  document.getElementById('cbTraficoCentral')
    .addEventListener('click', function(){
      borrarTablaTrafico();
      cbArchivo=document.getElementById("cbTraficoArchivo");
      cbFecha=document.getElementById("cbTraficoFecha");
      cbCentral=document.getElementById("cbTraficoCentral");
      cbRuta=document.getElementById("cbTraficoRuta");
      LimpiaComboBox(cbRuta);
      var at=getRegistroArchivoPorNombre(cbArchivo.options[cbArchivo.selectedIndex].value);
      var dTrafico = at[1];
      var fecha=cbFecha.options[cbFecha.selectedIndex].value;
      var central=cbCentral.options[cbCentral.selectedIndex].value;
      var dRuta=dTrafico.dataDiaria[fecha][central];
      for (var ruta in dRuta){
        AddOption2Cb(cbRuta, ruta, "", ruta);
      }
      DisplayDataTraficoDiaria(dRuta);
    }, false);

  document.getElementById('cbTraficoFecha')
    .addEventListener('click', function(){
      LimpiaComboBox(document.getElementById("cbTraficoRuta"));
      cbArchivo=document.getElementById("cbTraficoArchivo");
      cbFecha=document.getElementById("cbTraficoFecha");
      cbCentral=document.getElementById("cbTraficoCentral");
      LimpiaComboBox(cbCentral);
      var at=getRegistroArchivoPorNombre(cbArchivo.options[cbArchivo.selectedIndex].value);
      var fecha=cbFecha.options[cbFecha.selectedIndex].value;
      var dTrafico = at[1];
      var dCentral=dTrafico.dataDiaria[fecha];
      for (var central in dCentral){
        AddOption2Cb(cbCentral, central, "", central);
      }
    }, false);


  document.getElementById('cbTraficoArchivo')
    .addEventListener('click', function(){
      cbArchivo=document.getElementById("cbTraficoArchivo");
      cbFecha=document.getElementById("cbTraficoFecha");
      LimpiaComboBox(cbFecha);
      LimpiaComboBox(document.getElementById("cbTraficoFecha"));
      LimpiaComboBox(document.getElementById("cbTraficoCentral"));
      LimpiaComboBox(document.getElementById("cbTraficoRuta"));
      if (cbArchivo.selectedIndex<0){
        return;
      }
      var at=getRegistroArchivoPorNombre(cbArchivo.options[cbArchivo.selectedIndex].value);
      if(at==null){
        sendMsgMantenedorTrafico("Se podujo un error gravísimo. Contacte al soporte");
        return;
      }
      dTrafico = at[1];

      for (var fecha in dTrafico.dataDiaria){
        AddOption2Cb(cbFecha, fecha, "", fecha);
      }
    }, false);
}

function leerArchivoTrafico(e){
  sendMsgMantenedorTrafico("Iniciando lectura y procesamiento de archivos");
  var bp=document.getElementById("mantenedor_trafico_barra_progreso");
  bp.value=0;
  bp.max=e.target.files.length;
  document.archivos=[];
  console.log(document.archivos);
  document.contador_archivos=e.target.files.length;
  LimpiaComboBox(document.getElementById("cbTraficoErrores"));
  LimpiaComboBox(document.getElementById("cbTraficoWarnings"));
  LimpiaComboBox(document.getElementById("cbTraficoArchivo"));
  LimpiaComboBox(document.getElementById("cbTraficoFecha"));
  LimpiaComboBox(document.getElementById("cbTraficoCentral"));
  LimpiaComboBox(document.getElementById("cbTraficoRuta"));
  borrarTablaTrafico();

  document.cantidad_archivos=e.target.files.length;
  for(var i=0; i<e.target.files.length;i++){
    var archivo = e.target.files[i];
    if (archivo){
      var lector = new FileReader();

      document.archivos.push([lector, new TraficoDiario(document, window), archivo.name]);

      lector.onload = function(e){
        var regArchivo = getRegistroArchivo(this)
        if (regArchivo == null){
          console.log("Error gravísimo. No se encontró el registro de archivo previamente guardado.");
          return;
        }
        regArchivo[1].procesaHtml(regArchivo[2], e.target.result);

        var bp=document.getElementById("mantenedor_trafico_barra_progreso");
        bp.value++
        var cbError = document.getElementById("cbTraficoErrores");
        var cbWarning = document.getElementById("cbTraficoWarnings");
        console.log(regArchivo);
        for(var i=0; i<regArchivo[1].arrErrores.length;i++){
          AddOption2Cb(cbError, i, "", regArchivo[1].arrErrores[i]);
        }
        for( i=0; i<regArchivo[1].arrWarnings.length;i++){
          AddOption2Cb(cbWarning, i, "", regArchivo[1].arrWarnings[i]);
        }
        document.contador_archivos--;
        if (document.contador_archivos <= 0){
          CargaDatosTraficoDiario();
          if (cbError.length>0){
            sendMsgMantenedorTrafico("Se procesaron todos los archivos seleccionados y se encontraron "+ cbError.length + "errores");
          }else{
            sendMsgMantenedorTrafico("Se procesaron todos los archivos seleccionados y no se detectaron errores");
          }
        }
      }
      lector.readAsText(archivo);
    }
    else{
      document.contador_archivos--;
    }
  }
  //console.log(document.nombre_archivo);
}

function CargaDatosTraficoDiario(){
  var td;
  var cb = document.getElementById("cbTraficoArchivo");
  for(var i=0; i<document.archivos.length;i++){
    td=document.archivos[i][1];
    console.log(td);
    AddOption2Cb(cb, td.filename, "", td.filename);
  }
}

function getRegistroArchivo( fReader){
  for(var i=0; i<document.archivos.length;i++){
    if (document.archivos[i][0] === fReader ){
      return document.archivos[i];
    }
  }
  return null;
}
function getRegistroArchivoPorNombre( nombre){
  for(var i=0; i<document.archivos.length;i++){
    if (document.archivos[i][2] === nombre ){
      return document.archivos[i];
    }
  }
  return null;
}

function sendMsgMantenedorTrafico(msg){
  document.getElementById("mensaje_mantenedor_trafico").innerHTML=msg;
}
function sendMsgMantenedorTraficoCarga(msg){
  document.getElementById("mensaje_mantenedor_trafico_carga").innerHTML=msg;
}
function DisplayDataTraficoDiaria(dRutas){
  var tb=document.getElementById("tbtraficoRuta");
  if (tb==null){
    console.log("no encontré la tabla");
    return;
  }
  var fila=0;
  for(var ruta in dRutas){
    if (fila==0){
      var row=tb.insertRow(fila)
      cell=row.insertCell(0);
      cell.innerHTML="Ruta";
      cell=row.insertCell(1);
      cell.innerHTML="Max intentos";
      cell=row.insertCell(2);
      cell.innerHTML="Min ASR";
      var columna=3;
      for(var campo in dRutas[ruta].data){
        cell=row.insertCell(columna);
        cell.innerHTML=campo;
      }
      fila++;
    }
    var row=tb.insertRow(fila)
    var cell=row.insertCell(0);
    cell.innerHTML=ruta;
    var cell=row.insertCell(1);
    cell.innerHTML=dRutas[ruta].stat["int"].max;
    var cell=row.insertCell(2);
    cell.innerHTML=dRutas[ruta].stat["asr"].min;
    var columna=3;
    for(var campo in dRutas[ruta].data){
      cell=row.insertCell(columna);
      cell.innerHTML=dRutas[ruta].data[campo];
    }
  }
}
function borrarTablaTrafico(){
  console.log("borrando tabla. ahora si");
  var tb=document.getElementById("tbtraficoRuta");
  console.log(tb);
  console.log(tb.rows.length);
  while(tb.rows.length>0){
    tb.deleteRow(0);
  }
}

function ResetFieldSet(fs){

}
