function Rutas(bd){
  this.dataRutas={};
  this.errores = [];
  this.warnings = [];
  this.bd=bd;
}
/*
cb_getnemo es un calbback para obtener el nemo de una ruta. Debe ser resuelto por quien la llame
nemo=cb_getnemo(codigo);
*/
Rutas.prototype.getRutasConParametros=function(parametros){
  console.log('getRutasConParametros');
  var res={};
  for(var fecha in this.dataRutas){
    for(var central in this.dataRutas[fecha]){
      for(var ruta in this.dataRutas[fecha][central]){
        var objRuta=this.dataRutas[fecha][central][ruta];
        var valido=true;
        for(var param in parametros){
          if(typeof objRuta[param]!='undefined'){
            if(objRuta[param]==parametros[param]){
              valido=valido&&true;
            }else{
              valido=false;
            }
          }else{
            valido=false;
          }
        }
        if(valido){
          if(typeof res[fecha]=='undefined'){
            res[fecha]={};
          }
          if(typeof res[fecha][central]=='undefined'){
            res[fecha][central]={};
          }
          if(typeof res[fecha][central][ruta]=='undefined'){
            res[fecha][central][ruta]={};
          }
        }
      }
    }
  }
  return res;
};

Rutas.prototype.getParametrosRuta=function(){
  var data={};
  var config={nem:'Nemos', area:'Areas', cod:'Zonas', pcd:'PCDs', pco:'PCOs', sen:'Senalizacion', tipo: 'Tipos', sis:'Sistemas'};
  data['Fechas']={}
  data['Centrales']={};
  data['Rutas']={};
  for(var fecha in this.dataRutas){
    data['Fechas'][fecha]={};
    for(var central in this.dataRutas[fecha]){
      data['Centrales'][central]={};
      for(var ruta in this.dataRutas[fecha][central]){
        data['Rutas'][ruta]={};
        var objRuta=this.dataRutas[fecha][central][ruta];
        for(var param in config){
          if(typeof objRuta[param]!='undefined'){
            if (typeof data[config[param]]=='undefined'){
              data[config[param]]={};
            }
            data[config[param]][objRuta[param]]={};
          }
        }
      }
    }
  }
  return data;
};

Rutas.prototype.getDataFromFile=function(ano, mes, central, dataArchivo, cb_getnemo){
    var fecha=ano+"-"+mes;
    var Tablas= this.getTablasCentral(dataArchivo);
    if(this.errores.length> 0){
      return;
    }
    this.rutas = this.getRutasValidas(fecha, central, cb_getnemo, Tablas);
    return this;
};

Rutas.prototype.getPuntoCodigoS7=function(ruta, Tablas){
  var pcodigo={pco:0, pcd:0, sis:""};
  if (typeof Tablas.tbISUPDEST[ruta] == 'undefined'){
    //this.errores.push("Tabla ISUPDEST: Error. No fue posible encontrar los datos S7 de la ruta "+ruta);
    return pcodigo;
  }
  var isup=Tablas.tbISUPDEST[ruta];
  if (typeof Tablas.tbC7RTESET[isup] =="undefined"){
    //this.errores.push("Tabla C7RTESET: Error. No fue posible encontrar los datos S7 ISUP "+isup+" - Largo:" +isup.length);

    return pcodigo;
  }
  var C7Rteset=Tablas.tbC7RTESET[isup];
  if(typeof Tablas.tbC7NETWRK[C7Rteset.netname] == 'undefined'){
    //this.errores.push("Tabla C7NETWRK: Error. No fue posible encontrar netname "+C7Rteset.netname);
    return pcodigo;
  }
  return{pco:Tablas.tbC7NETWRK[C7Rteset.netname], pcd:C7Rteset.pc, sis:C7Rteset.netname};
};

Rutas.prototype.getRutasValidas=function(fecha, central, cb_getnemo, Tablas){
  //Rutas S7
  this.dataRutas={};
  this.dataRutas[fecha]={};
  this.dataRutas[fecha][central]={};
  var rutas=this.dataRutas[fecha][central];
    for(var ruta in Tablas.tbTRKMEM){
      pc=this.getPuntoCodigoS7(ruta, Tablas);
      if(pc.pco==0){
        if((typeof Tablas.tbTRKSGRP[ruta]!='undefined')&&((Tablas.tbTRKSGRP[ruta]=='PDTC')||(Tablas.tbTRKSGRP[ruta]=='GWC'))){
          rutas[ruta]={circ: Tablas.tbTRKMEM[ruta], sen:"PRI", pco: pc.pco, pcd: pc.pcd, sis: pc.sis};
        }else{
          rutas[ruta]={circ: Tablas.tbTRKMEM[ruta], sen:"S7", pco: pc.pco, pcd: pc.pcd, sis: pc.sis};
        }
      }else{
        rutas[ruta]={circ: Tablas.tbTRKMEM[ruta], sen:"S7", pco: pc.pco, pcd: pc.pcd, sis: pc.sis};
      }

    }
  //Rutas SIP
  for(var ruta in Tablas.tbDPTRKMEM){
    rutas[ruta]={circ: Tablas.tbDPTRKMEM[ruta], sen:"SIP", pco: 0, pcd:0, sis: ""};
  }
  for(var ruta in rutas){
    if (ruta.length == 15){
      rutas[ruta].nem = cb_getnemo(ruta.substr(0,4));
      rutas[ruta].tipo = ruta.substr(5,1);
      rutas[ruta].dir = ruta.substr(7,1);
      rutas[ruta].area = ruta.substr(8,4);
      rutas[ruta].cod = ruta.substr(12,3);
    }
    if(typeof Tablas.tbCLLI[ruta] == 'undefined'){
      this.errores.push("Tabla CLLI: Error. No fue posible encontrar la ruta "+ruta);
      rutas[ruta].inf="";
    }else{
      rutas[ruta].inf=Tablas.tbCLLI[ruta];
    }
  }
};

Rutas.prototype.getTablasCentral= function(dataArchivo){
  var tablas={};
  var top= [];
  var EmptyTable=[];
  var bottom = [];
  var pos, ltCLLI, ltTRKMEM, ltISUPDEST, ltC7NETWRK, ltC7RTSET, ltDPTRKMEM, ltTRKSGRP;
  var lines = dataArchivo.split('\n');
  position=this.getTablePositions(lines);
  console.log(position);

  if (this.errores.lenght>0){
    return tablas;
  }
  tablas.tbCLLI = this.GetCLLI(this.getTabla("CLII", lines, position.clli.ini, position.clli.fin,  4, true));
  tablas.tbTRKMEM = this.GetTRKMEM(this.getTabla("TRKMEM", lines, position.trkmem.ini, position.trkmem.fin, 6, true));
  tablas.tbISUPDEST = this.GetISUPDEST(this.getTabla("ISUPDEST", lines, position.isupdest.ini, position.isupdest.fin, 3, true));
  tablas.tbC7NETWRK = this.GetC7NETWRK(this.getTabla("C7NETWRK", lines, position.c7metwrk.ini, position.c7metwrk.fin, 16, true));
  tablas.tbC7RTESET = this.GetC7RTESET(this.getTabla("C7RTESET", lines, position.c7rtset.ini, position.c7rtset.fin, 9, true));
  tablas.tbDPTRKMEM = this.GetDPTRKMEM(this.getTabla("DPTRKMEM", lines, position.dptkmem.ini, position.dptkmem.fin, 3, true));
  tablas.tbTRKSGRP = this.GetTRKSGRP(this.getTabla("TRKSGRP", lines, position.trksgrp.ini, position.trksgrp.fin, 19, false));
  console.log(tablas);
  return tablas;
};
Rutas.prototype.getTablePositions=function(lines){
  var position={clli:{pos:[], str:'TABLE: CLLI'}, trkmem:{pos:[], str:'TABLE: TRKMEM'},
    isupdest:{pos:[], str:'TABLE: ISUPDEST'}, c7metwrk:{pos:[], str:'TABLE: C7NETWRK'}, c7rtset:{pos:[], str:'TABLE: C7RTESET'},
    dptkmem:{pos:[], str:'TABLE: DPTRKMEM'}, trksgrp:{pos:[], str:'TABLE: TRKSGRP'}, bottom:{pos:[], str:'BOTTOM'},
    top:{pos:[], str:'TOP'}, empty:{pos:[], str:'EMPTY TABLE'}};
  for(var i = 0; i < lines.length; i++){
    for(var param in position){
      if ((lines[i].indexOf(position[param].str) >= 0) && (lines[i].length<=(position[param].str.length+1))){
        position[param].pos.push(i);
      }
    }
  }
  this.validaPosition(lines, "clli", position, "CLLI");
  this.validaPosition(lines, "trkmem", position, 'TRKMEM');
  this.validaPosition(lines, "isupdest", position, 'ISUPDEST');
  this.validaPosition(lines, "c7metwrk", position, 'C7NETWRK');
  this.validaPosition(lines, "c7rtset", position, 'C7RTESET');
  this.validaPosition(lines, "dptkmem", position, 'DPTRKMEM');
  this.validaPosition(lines, "trksgrp", position, 'TRKSGRP');
  return position;
};

Rutas.prototype.validaPosition=function(lines, param, position, tableName){
  if(typeof position[param] == 'undefined'){
    this.errores.push('Tabla:'+tableName+' Error de desarrollo. Parámetro '+param + ' no encontrado');
    console.error('validaPosition:'+' parámetro '+ param + ' no encontrado en tabla '+ tableName);
    return false;
  }
  if (position[param].pos.lenght <= 0){
    this.errores.push('Tabla:'+tableName+': Error. No se encontró la tabla en el archivo seleccionado');
    return false;
  }
  if (position[param].pos.lenght > 1){
    var str='Tabla:'+tableName+': Error. La tabla se encontró repetida en el archivo. Líneas repetidas: ';
    for(var i=1; i< position[param].pos.lenght;i++){
      str+= position[param].pos[i] + ","
    }
    return false;
  }
  var posTop=this.getNextLinea(position[param].pos[0], position.top.pos);
  var posBottom=this.getNextLinea(position[param].pos[0], position.bottom.pos);
  var posEmptyTable=this.getNextLinea(position[param].pos[0], position.empty.pos);

  if (posTop<posEmptyTable){
    if(posTop+3 < lines.length){
      posInicio=posTop+3;
      if(posBottom < lines.length){
        posFin = posBottom-1;
      }else{
        this.errores.push("Tabla " + tableName +": La tabla está cortada. No tiene el identificador BOTTOM");
        return false;
      }
    }else{
      this.errores.push("Tabla " + tableName +": La tabla está cortada. Tiene el identificador TOP pero no tiene datos");
      return false;
    }
  }else{
    this.warnings.push("Tabla " + tableName +": La tabla está vacía.");
    return false;
  }
  position[param].ini=posInicio;
  position[param].fin=posFin;
  return true;
};

Rutas.prototype.GetTRKSGRP=function(arrDatos){
  var Data={};
  arrDatos.forEach(function(item, index){
    if(item.length>=19){
      var nombre=item[0].trim();
      var cod=nombre.substr(12,3);
      if ((nombre.length==15) && (!isNaN(cod))){
        Data[item[0]]=item[18];
      }
    }
  })
  return Data;
}
Rutas.prototype.GetDPTRKMEM= function(arrDatos){
  //Cada objeto tiene la informacion (ADMININF)
  var dis=this;
  var Data={};
  arrDatos.forEach(function(item, index){
    if(item.length<3){
      dis.errores.push("Error en registro DPTRKMEM="+item[0]+",registro "+index+" de la tabla DPTRKMEM. Tiene menos de 3 campos.");
    }else{
      var nombre=item[0].trim();
      var cod=nombre.substr(12,3);
      if ((nombre.length==15) && (!isNaN(cod))){
        Data[item[0]]=item[2];
      }else{
          //dis.warnings.push("Tabla DPTRKMEM: La ruta "+nombre+" no tiene 15 caracteres de largo. No se incluirá en el reporte");
      }
    }
  })
  return Data;
};

Rutas.prototype.GetCLLI= function(arrDatos){
  //Cada objeto tiene la informacion (ADMININF)
  var Data={};
  arrDatos.forEach(function(item, index){
    if(item.length<4){
      this.errores.push("Error en registro CLLI="+item[0]+",registro "+index+" de la tabla CLLI. Tiene menos de 4 campos.");
    }else{
      Data[item[0].trim()]=item[3].trim();
    }
  })
  return Data;
};

Rutas.prototype.GetTRKMEM= function(arrDatos){
  var Data={};
  var dis=this;
  arrDatos.forEach(function(item, index){
    var nombre = item[0].trim()
    if (nombre.length == 15){
      if(item.length<1){
        dis.errores.push("Error en registro TRKMEM="+item[0]+",registro "+index+" de la tabla TRKMEM. Tiene menos de 1 campo.");
      }else{
        var name=item[0].trim();
        if (typeof Data[name] == 'undefined'){
          Data[name]=0;
        }
        Data[name]++;
      }
    }else{
      //dis.warnings.push("Tabla TRKMEM: Ruta "+ nombre +" no tiene 15 caracteres de largo. No se incluye en reporte");
    }
  })
  return Data;
};

Rutas.prototype.GetISUPDEST= function(arrDatos){
  var Data={};
  var dis=this;
  arrDatos.forEach(function(item, index){
    if(item.length<3){
      dis.errores.push("Error en registro ISUPDEST="+item[0]+",registro "+index+" de la tabla ISUPDEST. Tiene menos de 3 campos.");
    }else{
      var name=item[0].trim();
      if (typeof Data[name] == 'undefined'){
        Data[name]="";
      }
      Data[name]=item[2].trim();
    }
  })
  return Data;
};

Rutas.prototype.GetC7RTESET= function(arrDatos){
  var Data={};
  arrDatos.forEach(function(item, index){
    if(item.length<8){
      this.errores.push("Error en registro C7RTESET="+item[0]+",registro "+index+" de la tabla C7RTESET. Tiene menos de 8 campos.");
    }else{
      var name=item[0].trim();
      if (typeof Data[name] == 'undefined'){
        Data[name]={};
      }
      Data[name]={pc: 2048*item[5] + 8*item[6] + item[7], netname: item[1].trim()};
    }
  })
  return Data;
};

Rutas.prototype.GetC7NETWRK= function(arrDatos){
  var Data={};
  arrDatos.forEach(function(item, index){
    if(item.length<7){
      this.errores.push("Error en registro C7NETWRK="+item[0]+",registro "+index+" de la tabla C7NETWRK. Tiene menos de 7 campos.");
    }else{
      var name=item[0].trim();
      if (typeof Data[name] == 'undefined'){
        Data[name]="";
      }
      Data[name]= 2048*item[4] + 8*item[5] + item[6];
    }
  })
  return Data;
};
Rutas.prototype.getNextLinea=function(posIni, arrData){
  for(var i=0;i <arrData.length;i++){
    if (arrData[i]>posIni){
      return arrData[i];
    }
  }
  return 999999999;
};
Rutas.prototype.getTabla= function(strTableName, lineas, posIni, posFin,  nCampos, alertarLargo){
  var i, pos, posFin, salir;
  var tb = [];

  for (i=posIni; i<=posFin;i++){
    res = lineas[i].split(" ");
    if (res.length >= nCampos){
      tb.push(res);
    }else{
      if(alertarLargo){
        this.errores.push("Tabla " + strTableName +": Línea:" + (i+1)+ ". La línea no tiene al menos "+ nCampos + " campos que son requeridos:" + lineas[i]);
      }
    }
  }
  console.log("Fin de procesamieto Tabla " + strTableName);
  return tb;
};

Rutas.prototype.getDataFromBD=function(ano, mes, cb_ok, cb_error){
  var fecha=Number(ano)+"-"+Number(mes);
  var dis=this;
  var path="/rutas/"+Number(ano)+"/"+Number(mes);
  console.log(path);
  this.bd.getData(path, function(snapshot){
  dis.dataRutas={};
  dis.dataRutas[fecha]={};
  var objFecha=dis.dataRutas[fecha];
  snapshot.forEach(function(central){
    objFecha[central.key]={};
    var objCentral = objFecha[central.key]
    central.forEach(function(ruta){
      objCentral[ruta.key]=SnapShot2Object(ruta);
    })
  })
  cb_ok(dis.dataRutas);
  }, function(e){
    cb_error(e);
  });
};

Rutas.prototype.saveDataInBD=function(cb_ok, cb_error){
  var dis=this;
  var arrErrores=[];
  var count=0;
  var count_ok=0;
  for(var fecha in this.dataRutas){
    var arrFecha = fecha.split("-");
    this.deleteRutasMantencion(arrFecha[0]-3);
    var objFecha=this.dataRutas[fecha];
    for(var central in objFecha){
      var path="/rutas/"+Number(arrFecha[0])+"/"+Number(arrFecha[1])+"/"+central;
      count++;
      this.bd.setData(path, objFecha[central], function(){
        count_ok++;
        if (count==(count_ok+arrErrores.length)){
          if (arrErrores.length > 0){
            cb_error(arrErrores);
          }else{
            cb_ok();
          }
        }
      }, function(e){
        arrErrores.push(e);
      });
    }
  }
};

Rutas.prototype.getDiferenciaRutas= function(rutasComparacion){
  console.log('getDiferenciaRutas');
  var nuevas = this.getRutasAgregadas(this.dataRutas, rutasComparacion.dataRutas);
  var eliminadas=this.getRutasAgregadas(rutasComparacion.dataRutas, this.dataRutas);
  var diferentes=this.getRutasDiferentes(rutasComparacion.dataRutas, this.dataRutas);
  return({nuevas:nuevas, eliminadas:eliminadas, diferentes:diferentes});
};

Rutas.prototype.getRutasDiferentes=function(dataNueva, dataAnterior){
  var res={};
  for(var antfecha in dataAnterior){
    var fechaAnt=antfecha;
  }
  console.log('getRutasDiferentes');
  console.log(dataNueva);
  console.log(dataAnterior);
  for(var fecha in dataNueva){
    for(var central in dataNueva[fecha]){
      for(var ruta in dataNueva[fecha][central]){
        var agregar=false;
        if (this.existeData(dataAnterior, fechaAnt, central, ruta)){
          for(var param in dataNueva[fecha][central][ruta]){
            if (typeof dataAnterior[fechaAnt][central][ruta][param] == 'undefined'){

              agregar=true;
            }else{
              if (dataAnterior[fechaAnt][central][ruta][param]!=dataNueva[fecha][central][ruta][param]){
                agregar=true;
              }
            }
          }
        }
        if(agregar){
          if (typeof res[fecha]=='undefined'){
            res[fecha]={};
          }
          if (typeof res[fecha][central] == 'undefined'){
            res[fecha][central]={};
          }
          res[fecha][central][ruta]={};
        }
      }
    }
  }
  return res;
};

Rutas.prototype.existeData=function(data, fecha, central, ruta){
  if(typeof data[fecha]=='undefined'){
    return false;
  }

  if(typeof data[fecha][central]=='undefined'){
    return false;
  }

  if(typeof data[fecha][central][ruta]=='undefined'){
    return false;
  }
  return true;
};

Rutas.prototype.getRutasAgregadas= function(dataNueva, dataAnterior){
  for(var antfecha in dataAnterior){
    var fechaant=antfecha;
  }
  var Agregadas={};
  for(var fecha in dataNueva){
    for(var central in dataNueva[fecha]){
      for(var ruta in dataNueva[fecha][central]){
        var agregar=false;
        if ((typeof dataAnterior[fechaant] == 'undefined')||(typeof dataAnterior[fechaant][central] == 'undefined')){
          agregar=true;
        }else{
          if (typeof dataAnterior[fechaant][central][ruta] == 'undefined'){
            agregar=true;
          }
        }
        if (agregar){
          if (typeof Agregadas[fecha]=='undefined'){
            Agregadas[fecha]={};
          }
          if (typeof Agregadas[fecha][central] == 'undefined'){
            Agregadas[fecha][central]={};
          }
          Agregadas[fecha][central][ruta]={};
        }
      }
    }
  }
  return Agregadas;
};

Rutas.prototype.deleteRutasMantencion=function(ano){
  this.bd.deleteData("/rutas/"+Number(ano), function(){
    console.log('Se borraron las rutas del año:'+ano);
  }, function(e){
    console.error('No fue posible eliminar las rutas del año:'+ano);
  });
};

Rutas.prototype.deleteRutasDeCentral=function(ano, mes, central, cb_ok, cb_error){
  var dis=this;
  this.bd.deleteData("/rutas/"+Number(ano)+"/"+Number(mes)+"/"+central, function(){
    if (typeof dis.dataRutas[central] != 'undefined'){
      delete dis.dataRutas[central];
    }
    cb_ok();
  }, function(e){
    cb_error(e);
  });
};

Rutas.prototype.BuscaTextoEnLinea=function (strLine, linea, strBuscado, valorActual){
  pos = strLine.indexOf(strBuscado);
  if (pos >= 0){
    return linea;
  }
  return valorActual;
};

Rutas.prototype.getCentralesyRutasXTipo=function(){
  var res={};
  for(var fecha in this.dataRutas){
    for(var central in this.dataRutas[fecha]){
      for(var ruta in this.dataRutas[fecha][central]){
        var objRuta=this.dataRutas[fecha][central][ruta];
        tipoRuta=this.getTipoRuta(objRuta);
        if(typeof res[tipoRuta]=='undefined'){
          res[tipoRuta]={};
        }
        if(typeof res[tipoRuta][central]=='undefined'){
          res[tipoRuta][central]={};
        }
        if(typeof res[tipoRuta][central][ruta] =='undefined'){
          res[tipoRuta][central][ruta]={};
        }
      }
    }
  }
  return res;
};

Rutas.prototype.getTipoRuta=function(objRuta){
  var tipoRuta='';
  switch (objRuta.tipo) {
    case 'C':
      tipoRuta='EXTERNAS';
      break;
    case 'L':
      tipoRuta='EXTERNAS';
      break;
    case 'P':
      tipoRuta='EXTERNAS';
      break;
    case 'X':
      tipoRuta='INTERNAS';
      break;
    case 'I':
      tipoRuta='INTERNAS';
      break;
    case 'T':
      tipoRuta='TANDEM';
      break;
    default:
      tipoRuta='INTERNAS';
  }
  return tipoRuta;
};
