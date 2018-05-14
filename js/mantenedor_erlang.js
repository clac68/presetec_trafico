function AgregaMantenedorErlangEventListeners(){

  document.addEventListener("get_erlangs", function(d){
    console.log("addEventListener:get_erlangs:inicio");
    var elto;
    if (d.detail.res.includes("OK")){
      sendMsgMantenedoGetrErlangs("Los datos de Erlangs fueron rescatados exitosamente. Se cargaron " + d.detail.erlangs.length + " registros.");
      document.erlangs=d.detail.erlangs;
      var cb = document.getElementById("cbEntradaErlang");
      while(cb.options.length>0){
        cb.remove(0);
      }
      for(var i=0; i<document.erlangs.length;i++){
        elto=document.createElement("option");
        elto.setAttribute("class", "opcClass");
        elto.setAttribute("value", i);
        elto.appendChild(document.createTextNode(document.erlangs[i][0]));
        cb.add(elto);
      }
    }else{
      sendMsgMantenedoGetrErlangs("Se produjo un error al intentar recuperar los datos de erlangs cargados en la Base de Datos");
    }
  })

  document.addEventListener("save_erlangs", function(d){
    if (d.detail.res.includes("OK")){
      sendMsgMantenedorSaveErlangs("El archivo de Erlangs fue cargado correctamente en la Base de Datos");
      DataCarga.getErlangsdeBD();
      sendMsgMantenedoGetrErlangs("Se están recuperando los datos de Erlangs desde la BD.");
    }else{
      sendMsgMantenedorSaveErlangs("Se produjo un error al intentar cargar los datos en la base de datos");
    }
  })

  document.getElementById("cbEntradaErlang")
    .addEventListener('click', function(){
    cb = document.getElementById("cbEntradaErlang");
    if (cb.selectedIndex<0){
      return;
    }
    txt = document.getElementById("inErlang");
    txt.value=document.erlangs[cb.options[cb.selectedIndex].value][1];
    })

    document.getElementById('ArchivoErlang')
      .addEventListener('change', function(e){
      var archivo = e.target.files[0];
      if (archivo){
        var lector = new FileReader();
        lector.onload = function(e) {
          var contenido = e.target.result;
          var arrErlang=[];
          var data;
          var lines = contenido.split("\n");
          for (var i=0;i<lines.length;i++){
            if (i>0){
              data = lines[i].split(";");
              if (data.length == 2){
                arrErlang.push([Number(data[0]), getNumberDataConPunto(data[1])]);
              }
            }
          }
          DataCarga.cargaErlangs(arrErlang);
        }
        lector.readAsText(archivo);
      }
    })
}
function sendMsgMantenedoGetrErlangs(msg){
  document.getElementById("mensaje_mantenedor_erlang_get_bd").innerHTML=msg;
}

function sendMsgMantenedorSaveErlangs(msg){
  document.getElementById("mensaje_mantenedor_erlang_save_bd").innerHTML=msg;
}

function getNumberDataConPunto(strData){
  var strAux=strData.split(".");
  if (strAux.length<2){
    return Number(strData);
  }
  if (strAux[1].length == 1){
    return Number(strAux[0])+Number(strAux[1]/10);
  }
  return Number(strAux[0])+Number(strAux[1].slice(0,2))/100;
}
