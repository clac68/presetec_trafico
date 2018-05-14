function AgregaMantenedorTraficoEventListeners(){

  document.getElementById('ArchivoTrafico')
    .addEventListener('change', leerArchivoTrafico, false);
}

function leerArchivoTrafico(e){
  for(var i=0; i<e.target.files.length;i++){
    var archivo = e.target.files[i];
    var nombreArchivo=[];
    document.nombre_archivo=nombreArchivo;
    if (archivo){
      var lector = new FileReader();
      nombreArchivo.push([archivo.name, lector]);
      lector.onload = function(e){
        var contenido = e.target.result;
        var nombre = getNombreFileReader(this)
        console.log(nombre);
        console.log(window.DataTrafico);

        DataTrafico.procesaHtml(nombre, contenido);
        console.log(DataTrafico.getErrors());
        console.log(DataTrafico.getDataDiaria());
        var DataxDia = DataTrafico.getObjDataDiaria();
        for(var i=0;i<DataxDia.length;i++){
          var fecha=
          console.log(DataxDia[i][3]);
          DataCarga.pruebaMasiva(DataxDia[i][0], DataxDia[i][1], DataxDia[i][2], DataxDia[i][3], DataxDia[i][4]);
        }

      }
      lector.readAsText(archivo);
    }
  }
  //console.log(document.nombre_archivo);
}

function getNombreFileReader( fReader){

  for(var i=0; i<document.nombre_archivo.length;i++){
    if (document.nombre_archivo[i][1] === fReader ){
      return document.nombre_archivo[i][0];
    }
  }
  return "indefinido";
}
