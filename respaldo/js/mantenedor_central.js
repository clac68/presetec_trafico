
function AgregaCentralEventListeners(){
  document.getElementById('btncargaCentral')
    .addEventListener('click', fnCargaCentral, false);

  document.getElementById('btnEliminaCentral')
    .addEventListener('click', fnEliminaCentral, false);

  document.getElementById('btnActualizaCentral')
    .addEventListener('click', fnActualizaCentral, false);

  document.getElementById("cbcentral")
    .addEventListener('click', fnCentralSeleccionada, false);

  /* Evento cuando se ha cargado una nueva central */
  document.addEventListener("carga_central", function(d){

    if (d.detail.res.includes("OK")){
      document.getElementById('nombreCentral').value = "";
      document.getElementById('codCentral').value = "";
      document.getElementById('descCentral').value = "";
      sendMsgMantenedorCentral("Se actualizó exitosamente la central en la Base de Datos");
      DataCarga.getCentrales();
    }else{
      sendMsgMantenedorCentral("No fue posible cargar la central en la base de datos. Por favor, reintente más tarde. Error:"+d.detail.error);
      console.log(d.detail.error);
    }

  });
  /* Evento para llenar lista de centrales del mantenedor de centrales */
  document.addEventListener("get_centrales", function(d){

    if (d.detail.res.includes("OK")){
      var elto;
      var cb = document.getElementById("cbcentral");
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
      sendMsgMantenedorCentral("Las centrales se rescataron exitosamente desde la Base de Datos");
      document.centrales = d.detail.centrales;
    }else{
      sendMsgMantenedorCentral("No fue posible obtener las centrales de la base de datos. Por favor, reintente más tarde. Error:"+d.detail.error);
      console.log(d.detail.error);
    }

  });
  /* Evento ed confirmación de eliminación de la central */
  document.addEventListener("borra_central", function(d){

    if (d.detail.res.includes("OK")){
      var elto;
      var cb = document.getElementById("cbcentral");
      for(var i=0; i<cb.length;i++){;
        cb.remove[0];
      }
      document.getElementById('nombreCentral').value = "";
      document.getElementById('codCentral').value = "";
      document.getElementById('descCentral').value = "";
      sendMsgMantenedorCentral("Se borró exitosamente la central en la Base de Datos");
      DataCarga.getCentrales();
    }else{
      sendMsgMantenedorCentral("No fue posible eliminar la central en la base de datos. Por favor, reintente más tarde. Error:"+d.detail.error);
      console.log(d.detail.error);
    }

  });
}

function fnCentralSeleccionada(){

  var cb = document.getElementById("cbcentral");

  console.log("fnNemoSeleccionado:cb.selectedIndex:"+cb.selectedIndex);
  if (cb.selectedIndex <0){
    sendMsgMantenedorCentral("Aún no se cargan las centrales desde la Base de Datos.");
    return;
  }
  var index = cb.options[cb.selectedIndex].value;


  if (document.centrales === 'undefined' || index <0 ){
    sendMsgMantenedorCentral("Error al mostrar la central. No se encontraron centrales. Comuníquese con el soporte del sistema");
    return;
  }
  var central = document.centrales[index];
  document.getElementById('nombreCentral').value = central[0];
  document.getElementById('codCentral').value = central[1];
  document.getElementById('descCentral').value = central[2];

}
function fnCargaCentral(){

  var central = document.getElementById("nombreCentral").value;
  var codigo = document.getElementById("codCentral").value;
  var desc = document.getElementById("descCentral").value;
  if (central.length <= 0){
    window.alert("El nombre de central no puede ser vacío");
    return;
  }
  if (codigo.length < 4){
    window.alert("El código de la central debe tener al menos 4 caracteres");
    return;
  }

  var msg = "Vas a agregar una  central. ¿Estás seguro?"
  if (confirm(msg)){
    sendMsgMantenedorCentral("Se comenzará a cargar la central en la Base de Datos");
    DataCarga.cargaCentral(central, codigo, desc);
  }
}

function fnEliminaCentral(){

  var cb = document.getElementById("cbcentral");
  var index = cb.options[cb.selectedIndex].value;
  if (document.centrales === 'undefined'){
    window.alert("Error al intentar eliminar central. No se encontraron centrales. Comuníquese con el soporte del sistema");
    return;
  }
  var msg = "Vas a borrar la central. ¿Estás seguro?"
  if (confirm(msg)){
    sendMsgMantenedorCentral("Se comenzará a borrar la central en la Base de Datos");
    DataCarga.borraCentral(document.centrales[index][1]);
  }
}

function fnActualizaCentral(){

  var cb = document.getElementById("cbcentral");
  var index = cb.options[cb.selectedIndex].value;
  var central = document.getElementById("nombreCentral").value;
  var desc = document.getElementById("descCentral").value;
  if (central.length <= 0){
    window.alert("El nombre de central no puede ser vacío");
    return;
  }
  if (document.centrales === 'undefined'){
    window.alert("Error al intentar actualizar la central. No se encontraron centrales. Comuníquese con el soporte del sistema");
    return;
  }
  var msg = "Vas a actualizar los valores de la central. ¿Estás seguro?"
  if (confirm(msg)){
    sendMsgMantenedorCentral("Se comenzará a actualizar la central en la Base de Datos");
    DataCarga.cargaCentral(central, document.centrales[index][1], desc);
  }
}

function sendMsgMantenedorCentral(msg){
  document.getElementById("mensaje_mantenedor_central").innerHTML=msg;
}
