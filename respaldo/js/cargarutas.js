/*******************************
Procesa archivo de centrales para obtener las rutas asociadas
********************************/
(function(window, document){
    'use strict'
    var inicio=function(){
      var centrales = new Array();
      var errores = new Array();
      var warnings = new Array();
      var rutas = new Array();
      var nemos = new Array();
      var DataRutas = {
        getErrores: function(){
          return errores;
        },
        getWarnings: function(){
          return warnings;
        },
        getRutas:function(){
          return rutas;
        },
        getNemos: function(){
          return nemos;
        },
        procesaArchivoNemos: function(contenido){
          var linea;
          var lines = contenido.split('\n');
          for(var i=0; i<lines.length; i++){
            linea=lines[i].split(";");
            if (linea.length >= 2){
              nemos.push([linea[0], linea[1]]);
            }
          }
          return this;
        },
        procesaArchivoCentral:function(central, contenido, nemosRuta){
          if (nemosRuta !== "undefined"){
            nemos = nemosRuta;
          }
          var tbCLLI = new Array();
          var tbTRKMEM = new Array();
          var tbISUPDEST = new Array();
          var tbC7NETWRK = new Array();
          var tbC7RTESET = new Array();
          var tbDPTRKMEM = new Array();

          if (nemos.length <= 0){
            window.alert("Error: No es posible procesar el archivo. Debe cargar el archivo de nemos");
            return;
          }
          var bottom = new Array();
          var pos, ltCLLI, ltTRKMEM, ltISUPDEST, ltC7NETWRK, ltC7RTSET, ltDPTRKMEM;
          var lines = contenido.split('\n');
          ltCLLI=-1;
          ltTRKMEM=-1;
          ltISUPDEST=-1;
          ltC7NETWRK=-1;
          ltC7RTSET=-1;
          ltDPTRKMEM=-1;
          for(var i = 0; i < lines.length; i++){
            ltCLLI= BuscaTextoEnLinea(lines[i], i, "TABLE: CLLI", ltCLLI);
            ltTRKMEM= BuscaTextoEnLinea(lines[i], i, "TABLE: TRKMEM", ltTRKMEM);
            ltISUPDEST= BuscaTextoEnLinea(lines[i], i, "TABLE: ISUPDEST", ltISUPDEST);
            ltC7NETWRK= BuscaTextoEnLinea(lines[i], i, "TABLE: C7NETWRK", ltC7NETWRK);
            ltC7RTSET= BuscaTextoEnLinea(lines[i], i, "TABLE: C7RTESET", ltC7RTSET);
            ltDPTRKMEM = BuscaTextoEnLinea(lines[i], i, "TABLE: DPTRKMEM", ltDPTRKMEM);
            if (lines[i].indexOf("BOTTOM") >= 0){
                bottom.push(i);
            }
          }
          tbCLLI = getTabla("CLII", lines, ltCLLI, 8, bottom, errores, 4);
          tbTRKMEM = getTabla("TRKMEM", lines, ltTRKMEM, 8, bottom, errores, 6);
          tbISUPDEST = getTabla("ISUPDEST", lines, ltISUPDEST, 8, bottom, errores, 3);
          tbC7NETWRK = getTabla("C7NETWRK", lines, ltC7NETWRK, 4, bottom, errores, 16);
          tbC7RTESET = getTabla("C7RTESET", lines, ltC7RTSET, 3, bottom, errores, 9);
          tbDPTRKMEM = getTabla("DPTRKMEM", lines, ltDPTRKMEM, 3, bottom, errores, 3);
          rutas = getRutasValidas(nemos, tbCLLI, tbTRKMEM, tbISUPDEST, tbC7NETWRK, tbC7RTESET, tbDPTRKMEM);

          return this;
        },
        cargaenBD:function(){
        },
        getData:function(){
          return centrales;
        },
        resetData: function(){

          centrales = new Array();
          errores = new Array();
          warnings = new Array();
          rutas = new Array();

        }
      }
      return DataRutas;
    }

    if (typeof window.DataRutas === 'undefined'){
        window.DataRutas = inicio();
    }else {
        console.log("La librería cargarutas.js está siendo llamada nuevamente. Se mantiene el objeto global DataRutas");
    }
})(window, document);

function BuscaTextoEnLinea(strLine, linea, strBuscado, valorActual){
  pos = strLine.indexOf(strBuscado);
  if (pos >= 0){
    return linea;
  }
  return valorActual;
}
function getTabla(strTableName, lineas, posIni, offset, arrBottom, arrError, nCampos){
  var i, pos, posFin, salir;
  var tb = new Array();
  console.log("Procesando Tabla " + strTableName);

  if (posIni < 0){
    arrError.push("Tabla " + strTableName +": La tabla no se encuentra en el archivo.");
    return null;
  }

  i=1;
  salir =false;
  while (!salir){
    if ((posIni+ i) >= lineas.length){
      arrError.push("Tabla " + strTableName +": No se encontró inicio de reporte (TOP).");
      return null;
    }
    res = lineas[posIni + i].split();
    //
    if (res[0].indexOf("TOP")>=0){
      if (posIni + 3 >=lineas.length){
        arrError.push("Tabla " + strTableName +": El reporte está incompleto.");
        return null;
      }
      posIni = posIni+i+3;
      salir = true;
    }
    i++;
  }
  i=0;
  posFin = -1
  salir = false;
  while (!salir){
    if (i >= arrBottom.length){
      salir = true;
    }else{
      if (arrBottom[i] > posIni){
        posFin = arrBottom[i];
        salir = true;
      }
    }
    i++;
  }
  if (posFin == -1){
    arrError.push("Tabla " + strTableName +": Los datos de la tabla no finaizan con la línea BOTTOM.");
    return null;
  }
  for (i=posIni; i<posFin;i++){
    res = lineas[i].split(" ");
    if (res.length >= nCampos){
      tb.push(res);
    }else{
        arrError.push("Tabla " + strTableName +": Línea:" + (i+1)+ ". La línea no tiene al menos "+ nCampos + " campos que son requeridos:" + lineas[i]);
    }
  }
  console.log("Fin de procesamieto Tabla " + strTableName);
  return tb;
}

function getRutasValidas(nemos, tbCLLI, tbTRKMEM, tbISUPDEST, tbC7NETWRK, tbC7RTESET, tbDPTRKMEM){
  var interconexion, tipoTrafico, direccion, ciudad, area, circuitos, pc, sistema, inf, nemo;
  var rutas = new Array();

  var rt = new Array()
  tbTRKMEM.forEach(function(item, index){
    incrementaRuta(item, index, rt);
  })
  tbDPTRKMEM.forEach(function(item, index){
    rt.push([item[0], item[2], "SIP"]);
  })


  rt.forEach(function(item,index){
    pc = [0,0, ""];
    inf = "";
    nemo = "";
    if (item[0].length == 15){
      nemo = getNemo(item[0].substr(0,4), nemos);
      tipoTrafico = item[0].substr(5,1);
      direccion = item[0].substr(7,1);
      ciudad = item[0].substr(8,4);
      area = item[0].substr(12,4);
      if (item[2].includes("S7")){
        var pc = getPuntoCodigo(item[0], tbISUPDEST, tbC7RTESET,tbC7NETWRK);
      }
      inf = getInfoAdministrativa(item[0].trim(), tbCLLI);
      rutas.push([item[0].trim(), item[1], item[2], nemo, tipoTrafico, direccion,ciudad, area, inf, pc[0], pc[1], pc[2]]);
    }
  })
  return rutas;
}
function getNemo(strBuscado, nemos){
  for (var i=0; i<nemos.length;i++){
      if (nemos[i][0].includes(strBuscado)){
        return nemos[i][1].replace(/[^a-zA-Z 0-9.]+/g,' ');
      }
  }
  return "No definido";
}
function getInfoAdministrativa(strRuta, tbCLLI){
  for(var i=0; i<tbCLLI.length; i++){
    if (tbCLLI[i][0].includes(strRuta.trim())){
      return tbCLLI[i][3];
    }
  }
}
function incrementaRuta(item, index, rutas7){
  for(var i=0; i<rutas7.length;i++){
    if (rutas7[i][0].includes(item[0])){
      (rutas7[i][1])++;
      return;
    }
  }
  rutas7.push([item[0], 1, "S7"]);
}
function getPuntoCodigo(ruta, tbISUPDEST, tbC7RTESET, tbC7NETWRK){
  var pcd, pco;
  for(var i=0; i<tbISUPDEST.length; i++){
    if (tbISUPDEST[i][0].includes(ruta)){
      for (var j=0;i<tbC7RTESET.length; j++){
        if (tbC7RTESET[j][0].includes(tbISUPDEST[i][2].trim())){
          pcd =  2048*tbC7RTESET[j][5] + 8*tbC7RTESET[j][6] + tbC7RTESET[j][7];
          for (var k=0; k<tbC7NETWRK.length; k++){
            if (tbC7NETWRK[k][0].includes(tbC7RTESET[j][1].trim())){
              pco = 2048*tbC7NETWRK[k][4] + 8*tbC7NETWRK[k][5] + tbC7NETWRK[k][6];
              return [pco,pcd, tbC7RTESET[j][1]];
            }
          }
        }
      }
    }
  }
  return [0,0, ""];
}
