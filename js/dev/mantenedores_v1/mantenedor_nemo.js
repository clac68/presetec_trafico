
function AgregaNemoEventListeners(){
  document.getElementById('btncargaNemo')
    .addEventListener('click', fnCargaNemo, false);

  document.getElementById('btnEliminaNemo')
    .addEventListener('click', fnEliminaNemo, false);

  document.getElementById('btnActualizaNemo')
    .addEventListener('click', fnActualizaNemo, false);

  document.getElementById("cbNemo")
    .addEventListener('click', fnNemoSeleccionado, false);

  /* Evento cuando se ha cargado una nueva central */
  document.addEventListener("carga_nemo", function(d){

    if (d.detail.res.includes("OK")){
      document.getElementById('nombreNemo').value = "";
      document.getElementById('codNemo').value = "";
      sendMsgMantenedorNemo("Se creó exitosamente el nemo en la Base de Datos");
      DataCarga.getNemos();
    }else{
      sendMsgMantenedorNemo("No fue posible cargar el nemo en la base de datos. Por favor, reintente más tarde. Error:"+d.detail.error);
      console.log(d.detail.error);
    }

  });
  /* Evento para llenar lista de centrales del mantenedor de centrales */
  document.addEventListener("get_nemos", function(d){

    if (d.detail.res.includes("OK")){
      var elto;
      var cb = document.getElementById("cbNemo");
      while(cb.options.length>0){
        cb.remove(0);
      }
      for(var i=0;i<d.detail.nemos.length;i++){
          elto=document.createElement("option");
          elto.setAttribute("class", "opcClass");
          elto.setAttribute("value", i);
          elto.setAttribute("title", d.detail.nemos[i][1]);
          elto.appendChild(document.createTextNode(d.detail.nemos[i][0]));
          cb.add(elto)
      }
      sendMsgMantenedorNemo("Los nemos se rescataron exitosamente desde la Base de Datos");
      if (cb.length > 0){
        cb.selectedIndex = 0;
      }
      document.nemos = d.detail.nemos;
    }else{
      sendMsgMantenedorNemo("No fue posible obtener los nemos de la base de datos. Por favor, reintente más tarde. Error:"+d.detail.error);
      console.log(d.detail.error);
    }
  });
  /* Evento ed confirmación de eliminación de la central */
  document.addEventListener("borra_nemo", function(d){

    if (d.detail.res.includes("OK")){
      var elto;
      var cb = document.getElementById("cbNemo");
      for(var i=0; i<cb.length;i++){;
        cb.remove[0];
      }
      document.getElementById('nombreNemo').value = "";
      document.getElementById('codNemo').value = "";
      sendMsgMantenedorNemo("Se borró exitosamente el nemo en la Base de Datos");
      DataCarga.getNemos();
    }else{
      sendMsgMantenedorNemo("No fue posible eliminar el nemo en la base de datos. Por favor, reintente más tarde. Error:"+d.detail.error);
      console.log(d.detail.error);
    }
  });

  document.getElementById('ArchivoNemos')
    .addEventListener('change', leerArchivoNemos, false);
}

function fnNemoSeleccionado(){

  var cb = document.getElementById("cbNemo");
  console.log("fnNemoSeleccionado:cb.selectedIndex:"+cb.selectedIndex);
  if (cb.selectedIndex <0){
    return;
  }

  var index = cb.options[cb.selectedIndex].value;

  if (document.nemos === 'undefined' || index <0 ){
    sendMsgMantenedorNemo("Error al mostrar el nemo. No se encontraron nemos. Comuníquese con el soporte del sistema");
    return;
  }
  var nemo = document.nemos[index];
  document.getElementById('nombreNemo').value = nemo[1];
  document.getElementById('codNemo').value = nemo[0];

}
function fnCargaNemo(){

  var nemo = document.getElementById("nombreNemo").value;
  var codigo = document.getElementById("codNemo").value;
  if (codigo.length != 4){
    window.alert("El código debe tener exactamente 4 caracteres.");
    return;
  }
  if (nemo.length < 4){
    window.alert("El nombre del nemo debe tener al menos 4 caracteres");
    return;
  }

  var msg = "Vas a cargar el nemo en la base de datos. ¿Estás seguro?"
  if (confirm(msg)){
    sendMsgMantenedorNemo("Se comenzará a cargar el nemo en la Base de Datos");
    DataCarga.cargaNemo(nemo, codigo, false);
  }
}

function fnEliminaNemo(){

  var cb = document.getElementById("cbNemo");
  if (cb.selectedIndex < 0){
    return;
  }
  var index = cb.options[cb.selectedIndex].value;
  if (document.nemos === 'undefined'){
    window.alert("Error al intentar eliminar nemo. No se encontraron Nemos. Comuníquese con el soporte del sistema");
    return;
  }
  var msg = "Vas a borrar el nemo seleccionado. ¿Estás seguro?"
  if (confirm(msg)){
    sendMsgMantenedorNemo("Se comenzará a borrar el nemo de la Base de Datos");
    DataCarga.borraNemo(document.nemos[index][0]);
  }
}

function fnActualizaNemo(){

  var cb = document.getElementById("cbNemo");
  if (cb.selectedIndex < 0){
    return;
  }
  var index = cb.options[cb.selectedIndex].value;
  var nombre = document.getElementById("nombreNemo").value;
  if (nombre.length <= 0){
    window.alert("El nombredel nemo no puede ser vacío");
    return;
  }
  if (document.nemos === 'undefined'){
    window.alert("Error al intentar actualizar el nemo. No se encontraron nemos. Comuníquese con el soporte del sistema");
    return;
  }
  var msg = "Vas a actualizar los valores del nemo. ¿Estás seguro?"
  if (confirm(msg)){
    sendMsgMantenedorNemo("Se comenzará a actualizar el nemo en la Base de Datos");
    DataCarga.cargaNemo(nombre, document.nemos[index][0], false);
  }
}

function sendMsgMantenedorNemo(msg){
  document.getElementById("mensaje_mantenedor_nemo").innerHTML=msg;
}

function leerArchivoNemos(e) {
  for(var i=0; i<e.target.files.length;i++){
    var archivo = e.target.files[i];
    if (archivo){
      var lector = new FileReader();
      lector.onload = function(e) {
        console.log("leerArchivoNemos");
        var contenido = e.target.result;
        var linea;
        var lines = contenido.split('\n');
        var cargados = 0;
        for(var i=0; i<lines.length; i++){
          linea=lines[i].split(";");
          if (linea.length >= 2){
            if (linea[0].length == 4){
              DataCarga.cargaNemo(linea[1], linea[0], true);
              cargados++;
            }
          }
        }
        document.getElementById("mensaje_carga_nemos").innerHTML = "En la última carga masiva se cargaron " + cargados + " nemos en la base de datos";
        DataCarga.getNemos();
      }
      lector.readAsText(archivo);
    }
  }
}
