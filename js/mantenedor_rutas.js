function AgregaMantenedorRutasEventListeners(){



  document.getElementById("btneliminarrutasdecentral")
    .addEventListener('click', function(){
      cbCentral = document.getElementById("cbcentralrutas");
      if (cbCentral.length < 0){
          return;
      }
      var fecha = document.getElementById("fecha_carga_rutas").value.split("-");
      if (fecha.length < 3){
        sendMsgMantenedorRutas("Error. La Fecha seleccionada es inválida");
        return;
      }
      if (fecha[0] === 'undefined' || fecha[1] === 'undefined'){
        var msg = "Error. La Fecha seleccionada es inválida"
        sendMsgMantenedorRutas(msg);
        window.alert(msg);
      }
      nombreCentral = cbCentral.options[cbCentral.selectedIndex].text;
      idCentral = cbCentral.options[cbCentral.selectedIndex].value;
      var msg = "Vas a eliminar las rutas de la central "+ nombreCentral + " asociados a la fecha "+ fecha[0] + "-" + fecha[1] + ". ¿Estás seguro?"
      if (confirm(msg)){
        sendMsgMantenedorRutas("Borrando rutas de la Base de Datos");
        DataCarga.borraRutasDeCentral(fecha[0], fecha[1], document.rutascentral[idCentral][0]);
      }
    });

  document.getElementById('fecha_carga_rutas')
    .addEventListener('change', RecuperaCentralesyRutas, false);

    document.getElementById('ArchivoRutadeCentral')
      .addEventListener('change', function(e){
        console.log("addEventListener:ArchivoRutadeCentral: inicio");
        var central = document.getElementById("cbcentralrutasacargar");
        for(var i=0; i<e.target.files.length;i++){
            var archivo = e.target.files[i];
            if ('name' in e.target.files[i]){
              sendMsgMantenedorCargaRutas("Iniciando análisis de archivo:" + e.target.files[i].name);
              console.log("addEventListener:ArchivoRutadeCentral: nombre de archivo: " + e.target.files[i].name);
            }
            if (archivo){
              var lector = new FileReader();
              lector.onload = function(e) {
                var fecha = document.getElementById("fecha_carga_rutas").value.split("-");
                var cb = document.getElementById("cbcentralrutasacargar");
                if (cb.selectedIndex < 0){
                  window.alert("No se cargaron los datos. Debes selecionar una central a quien asociar este archivo.");
                  return;
                }
                var id = cb.options[cb.selectedIndex].value;
                if (id>document.centrales.length || id<0){
                  window.alert("Lo siento. Se produjo un error grave. Contacta al soporte del sistema");
                  return;
                }
                var contenido = e.target.result;
                DataRutas.resetData();
                sendMsgMantenedorCargaRutas("Iniciando análisis de archivo:" + e.target.value);
                DataRutas.procesaArchivoCentral(document.centrales[id][1], this.result, document.nemos);
                if (DataRutas.getErrores().length > 0){
                  var elto;
                  var cb = document.getElementById("cberroresrutas");
                  while(cb.options.length>0){
                    cb.remove(0);
                  }
                  for(var i=0;i<DataRutas.getErrores().length;i++){
                      elto=document.createElement("option");
                      elto.setAttribute("class", "opcClass");
                      elto.setAttribute("value", i);
                      elto.appendChild(document.createTextNode(DataRutas.getErrores()[i]));
                      cb.add(elto)
                  }
                  var msg = "Carga Fallida: El archivo no se cargó en la base de datos ya que contiene " + DataRutas.getErrores().length + "errores. Corrígelos y vuelve a intentar la carga.";
                  sendMsgMantenedorCargaRutas(msg);
                  window.alert(msg);
                  return;
                }
                sendMsgMantenedorCargaRutas("Iniciando carga de rutas en la base de datos.");
                DataCarga.cargaRutasDeCentral(document.centrales[id][1], fecha[0]+ "-" +fecha[1], DataRutas.getRutas());
              }
              lector.readAsText(archivo);
            }
        }
      }, false);

    document.addEventListener("carga_rutas", function(d){
      if (d.detail.regProcesados < DataRutas.getRutas().length){
        console.log("addEventListener: carga_rutas: no ha terminado");
        return;
      }
      console.log("addEventListener: carga_rutas: termino de cargar en bd");
      if (d.detail.res.includes("OK")){
        sendMsgMantenedorCargaRutas("Las rutas de la central se cargaron exitosamente en la base de datos.");
        RecuperaCentralesyRutas();
        return;
      }
      sendMsgMantenedorCargaRutas("Error. Se produjeron errores al cargar la BD. Revisar y recargar");
      var elto;
      var cb = document.getElementById("cberroresrutas");
      while(cb.options.length>0){
        cb.remove(0);
      }
      for(var i=0;i<DataCarga.getErrores().length;i++){
          elto=document.createElement("option");
          elto.setAttribute("class", "opcClass");
          elto.setAttribute("value", i);
          elto.appendChild(document.createTextNode(DataRutas.getErrores()[i]));
          cb.add(elto)
      }


    });


    document.addEventListener("get_centrales", function(d){
      if (d.detail.res.includes("OK")){
        var elto;
        var cb = document.getElementById("cbcentralrutasacargar");
        while(cb.options.length>0){
          cb.remove(0);
        }
        for(var i=0;i<d.detail.centrales.length;i++){
            elto=document.createElement("option");
            elto.setAttribute("class", "opcClass");
            elto.setAttribute("value", i);
            elto.setAttribute("title", d.detail.centrales[i][2]);
            elto.appendChild(document.createTextNode(d.detail.centrales[i][0]));
            cb.add(elto)
        }
        sendMsgMantenedorRutas("Las centrales se rescataron exitosamente desde la Base de Datos");
        document.centrales = d.detail.centrales;
      }else{
        sendMsgMantenedorRutas("No fue posible obtener las centrales de la base de datos. Por favor, reintente más tarde. Error:"+d.detail.error);
        console.log(d.detail.error);
      }
    });

  document.getElementById("cbcentralrutas")
    .addEventListener('click', function(){
      cb = document.getElementById("cbrutasdecentral");
      while(cb.options.length>0){
        cb.remove(0);
      }
      cbCentral = document.getElementById("cbcentralrutas");
      if (cbCentral.selectedIndex < 0){
        sendMsgMantenedorRutas("Error, no se seleccionó una central");
        return;
      }
      var index = cbCentral.options[cbCentral.selectedIndex].value;
      for (var i=0; i<document.rutascentral[index][1].length; i++){
        //console.log("AgregaRuta:arrRutas[i][1]:"  + arrRutas[i][1][arrRutas[i][1].length-1][0]);
        elto=document.createElement("option");
        elto.setAttribute("class", "opcClass");
        elto.setAttribute("value", i);
        elto.appendChild(document.createTextNode(document.rutascentral[index][1][i][0]));
        cb.add(elto);
      }
    }, false);

  document.getElementById("cbrutasdecentral")
    .addEventListener('click', function(){
      cbCentral = document.getElementById("cbcentralrutas");
      cbRutas = document.getElementById("cbrutasdecentral");
      if (cbCentral.length < 0){
          window.alert("Error Grave. No encontré centrales. Por fvor contactar a soporte.");
          return;
      }
      if (cbRutas.length < 0){
          window.alert("Error Grave. No encontré rutas. Por fvor contactar a soporte.");
          return;
      }
      iCentral = cbCentral.options[cbCentral.selectedIndex].value;
      iRuta = cbRutas.options[cbRutas.selectedIndex].value;

        console.log("addEventListener:cbrutasdecentral:iecntral-iruta:" + iCentral + "-"+ iRuta);

      DisplayRutaData( document.rutascentral[iCentral][1][iRuta][1]);
    }, false);


  document.addEventListener("get_rutascentral", function(d){
    console.log("addEventListener:get_rutascentral:inicio");
    if (d.detail.res.includes("OK")){

      var elto;
      var cb = document.getElementById("cbcentralrutas");
      while(cb.options.length>0){
        cb.remove(0);
      }
      for(var i=0;i<d.detail.rutasCentral.length;i++){
          elto=document.createElement("option");
          elto.setAttribute("class", "opcClass");
          elto.setAttribute("value", i);
          elto.appendChild(document.createTextNode(d.detail.rutasCentral[i][0]));
          cb.add(elto);
      }
      if (d.detail.rutasCentral.length > 0){
        sendMsgMantenedorRutas("Se recuperaron las rutas de " + d.detail.rutasCentral.length + " centrales desde la base de datos");
      }else{
        sendMsgMantenedorRutas("No hay rutas cargadas para la fecha seleccionada");
      }
      document.rutascentral = d.detail.rutasCentral;
    }
  });
}

function sendMsgMantenedorRutas(msg){
  document.getElementById("mensaje_mantenedor_rutas").innerHTML=msg;
}

function sendMsgMantenedorCargaRutas(msg){
  document.getElementById("mensaje_mantenedor_carga_rutas").innerHTML=msg;
}

function RecuperaCentralesyRutas(){

    var fecha = document.getElementById("fecha_carga_rutas").value.split("-");
    if (fecha.length < 3){
      sendMsgMantenedorRutas("Error. La Fecha seleccionada es inválida");
      console.log("AgregaMantenedorRutasEventListeners: fecha invalida:"+fecha);
      return;
    }
    if (fecha[0] === 'undefined' || fecha[1] === 'undefined'){
      var msg = "Error. La Fecha seleccionada es inválida"
      sendMsgMantenedorRutas(msg);
      window.alert(msg);
    }
    DisplayRutaData(null);
    sendMsgMantenedorRutas("Recuperando las rutas cargadas desde la base de datos.");
    DataCarga.getRutasDeCentral(fecha[0], fecha[1]);
}

function DisplayRutaData( dataRuta){

  if (dataRuta != null){
    document.getElementById("ruta_area").value = dataRuta[6];
    document.getElementById("ruta_circuitos").value = dataRuta[0];
    document.getElementById("ruta_direccion").value = dataRuta[4];
    document.getElementById("ruta_informacion").value = dataRuta[7];
    document.getElementById("ruta_nemo").value = dataRuta[2];
    document.getElementById("ruta_pcd").value = dataRuta[9];
    document.getElementById("ruta_pco").value = dataRuta[8];
    document.getElementById("ruta_senalizacion").value = dataRuta[1];
    document.getElementById("ruta_sistema").value = dataRuta[10];
    document.getElementById("ruta_tipo").value = dataRuta[3];
    return;
  }
  document.getElementById("ruta_area").value = "";
  document.getElementById("ruta_circuitos").value = "";
  document.getElementById("ruta_direccion").value = "";
  document.getElementById("ruta_informacion").value = "";
  document.getElementById("ruta_nemo").value = "";
  document.getElementById("ruta_pcd").value = "";
  document.getElementById("ruta_pco").value = "";
  document.getElementById("ruta_senalizacion").value = "";
  document.getElementById("ruta_sistema").value = "";
  document.getElementById("ruta_tipo").value = "";
}
