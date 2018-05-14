'use strict'
function TraficoDiario(bd){
  if (typeof bd == 'undefined'){
    console.log("TraficoDiario: ERROR: no se le entregó el objeto de Base de Datos");
  }
  this.bd=bd;
  this.arrErrores = [];
  this.arrWarnings = [];
  this.dataHora = {};
  this.dataDiaria = {};
  this.filename="";
}

TraficoDiario.prototype.deleteMantencion=function(ano,mes, cb_ok, cb_error){
  var path='';
  if (typeof mes == 'undefined'){
    path= '/tDiario/'+ano;
  }else{
    path= '/tDiario/'+ano+'/'+mes;
  }
  this.bd.deleteData(path, function(){
    cb_ok();
  }, function(e){
    cb_error(e);
  });
};

TraficoDiario.prototype.deleteDataCentral=function(ano,mes, central, cb_ok, cb_error){
  var dis=this;
  var path="/tDiario/"+ano+"/"+mes+'/'+central;
  this.bd.deleteData(path, function(){
    var fecha=ano+"-"+mes;
    delete dis.dataDiaria[fecha][central];
    cb_ok();
  }, function(e){
    cb_error(e);
  });

};
TraficoDiario.prototype.deleteDataDiaria=function(cb_ok, cb_error){
  var count=0;
  for(var fecha in this.dataDiaria){
    count++;
  }
  console.log(this.dataDiaria);
  var countOK=0;
  var countError=0;
  for (var fecha in this.dataDiaria){
    var arrFecha = fecha.split('-');
    var path="/tDiario/"+arrFecha[0]+"/"+arrFecha[1];
    var dis=this;
    this.bd.deleteData(path, function(){
      delete dis.dataDiaria[fecha];
      count--;
      countOK++;
      if (count==0){
        if (countError>0){
          cb_error('No se borraron todos los registros');
        }else {
          cb_ok();
        }
      }
    }, function(e){
        count--;
        countError++;
        if (count==0){
          if (countError>0){
            cb_error('No se borraron todos los registros');
          }else {
            cb_ok();
          }
        }
    });
  }
};

TraficoDiario.prototype.getDataMesRutaFromBD=function(ano, mes, central, ruta, cb_ok,cb_error){
  var path = "/tDiario/"+ano+"/"+mes+"/"+central+"/"+ruta;
  var dis=this;
  this.bd.getData(path, function(snapshot){
    snapshot.forEach(function(dia){
      var fecha=ano+"-"+mes+"-"+dia.key;
      var objDia = dis.AgregaDataDiaria(fecha, central, ruta);
      //console.log(objDia);
      dia.forEach(function(param){
        if (param.key=='data'){
          objDia.data=SnapShot2Object(param);
        }
        if (param.key=='stat'){
          objDia.stat={}
          param.forEach(function(stat){
            //console.log(stat.val());
            objDia.stat[stat.key]=SnapShot2Object(stat);
          })
        }
      })
    })
    cb_ok(dis.dataDiaria);
  }, function(e){
    cb_error(e);
  });
};

TraficoDiario.prototype.getDataMesFromBD=function(ano, mes, cb_ok,cb_error){
  var path = "/tDiario/"+ano+"/"+mes;
  console.log('getDataMesFromBD:inicio');
  var dis=this;
  this.bd.getData(path, function(snapshot){
    dis.dataDiaria[ano+'-'+mes]={};
    snapshot.forEach(function(central){
      central.forEach(function(ruta){
        ruta.forEach(function(dia){
          var fecha = ano+"-"+mes+'-'+dia.key;
          var objDia = dis.AgregaDataDiaria(fecha, central.key, ruta.key);
          objDia.stat={};
          dia.forEach(function(param){
            if (param.key=='data'){
              objDia.data=SnapShot2Object(param);
            }
            if (param.key=='stat'){
              param.forEach(function(stat){
                objDia.stat[stat.key]=SnapShot2Object(stat);
              })
            }
          })
        })
      })
    })
    cb_ok(dis.dataDiaria);
  }, function(e){
    console.log('getDataMesFromBD:Error');
    console.log(e);
    cb_error(e);
  });
};

TraficoDiario.prototype.savePartialDataInBD=function(cb_ok, cb_error,cb_progress){
  var cont=0;
  for(var fecha in this.dataDiaria){
    var objFecha=this.dataDiaria[fecha];
    for(var central in objFecha){
      for(var ruta in objFecha[central]){
        for(var dia in objFecha[central][ruta]){
          cont++;
        }
      }
    }
  }
  var contMax=cont;
  var contOK=0;
  var contError=0;
  for(var fecha in this.dataDiaria){
    var arrFecha=fecha.split('-');
    var mes;
    this.deleteMantencion(arrFecha[0]-3,mes, function(){}, function(e){});
    var objFecha=this.dataDiaria[fecha];
    for(var central in objFecha){
      var objCentral = objFecha[central];
      for(var ruta in objCentral){
        var objRuta=objCentral[ruta];
        for(var dia in objRuta){
          var path = '/tDiario/'+arrFecha[0]+'/'+arrFecha[1]+'/'+central+"/"+ruta+"/"+dia;
          this.bd.setData(path, objRuta[dia], function(){
            cont--;
            contOK++;
            cb_progress({cont: cont, max: contMax});
            if (cont == 0){
              if (contError > 0){
                cb_error('No se cargaron todos los datos. Faltaton '+contError + 'centrales');
              }else{
                cb_ok();
              }
            }
          }, function(e){
            cont--;
            contError++;
            cb_progress({cont: cont, max: contMax});
            console.log(e);
            if (cont == 0){
              if (contError > 0){
                cb_error('No se cargaron todos los datos. Faltaton '+contError + 'centrales');
              }else{
                cb_ok();
              }
            }
          });
        }
      }
    }
  }
};

TraficoDiario.prototype.saveAllDataInBD=function(cb_ok, cb_error,cb_progress){
  var cont=0;
  for(var fecha in this.dataDiaria){
    cont++;
  }
  var contMax=cont;
  var contOK=0;
  var contError=0;
  for(var fecha in this.dataDiaria){
    var arrFecha = fecha.split('-');
    var path="/tDiario/"+arrFecha[0]+"/"+arrFecha[1];
    this.bd.setData(path, this.dataDiaria[fecha], function(){
      contOK++;
      cont--;
      if (cont == 0){
        if (contError > 0){
          cb_error('No se cargaron todos los datos. Faltaton '+contError + 'centrales');
        }else{
          cb_ok();
        }
      }
    }, function(e){
      contError++;
      cont--;
      if (cont == 0){
        if (contError > 0){
          cb_error('No se cargaron todos los datos. Faltaton '+contError + 'centrales');
        }else{
          cb_ok();
        }
      }
    });
  }
};

TraficoDiario.prototype.procesaHtml=function(nombreArchivo, htmlData, erlangs){
  this.filename=nombreArchivo;
  var parser, htmlDoc, eltosTR, eltosTD;
  try{
    parser = new DOMParser();
    htmlDoc=parser.parseFromString(htmlData, "text/html")
    eltosTR = htmlDoc.getElementsByTagName("tr");
    eltosTD = htmlDoc.getElementsByTagName("td");
  } catch(e){
    this.AgregaError("Error al leer archivo html:" + e);
    console.log("DataTraficoDiario: cargaHtml: " + nombreArchivo + ":Error al leer archivo html:" + e);
    return false;
  }
  if ((eltosTD.length==0) ||(eltosTR.length==0)){
    this.AgregaError( "Error al leer archivo: No es el archivo Html esperado. No tiene datos");
    return false;
  }
  if ( eltosTD.length != eltosTR.length * 23 ){
    this.AgregaError( "Error: el archivo no tiene 23 columans");
    return this;
  }
  var central, ruta, fecha, ano, mes, dia, hora;
  for(var i=1; i<eltosTR.length;i++){
    if (i>1){
      central = eltosTD[(i-1)*23+5].textContent.trim();
      ruta = eltosTD[(i-1)*23+7].textContent.trim();
      ano = parseInt(eltosTD[(i-1)*23+1].textContent.trim());
      mes = parseInt(eltosTD[(i-1)*23+2].textContent.trim());
      dia=parseInt(eltosTD[(i-1)*23+3].textContent.trim());
      hora=parseInt(eltosTD[(i-1)*23+4].textContent.split(":",2)[0].trim());

      var dataTraficoDiario={
        cic: this.getNumber(eltosTD[(i-1)*23+8].textContent),
        cice: this.getNumber(eltosTD[(i-1)*23+9].textContent),
        int: this.getNumber(eltosTD[(i-1)*23+10].textContent),
        dbd: this.getNumber(eltosTD[(i-1)*23+11].textContent),
        n98: this.getNumber(eltosTD[(i-1)*23+12].textContent),
        con: this.getNumber(eltosTD[(i-1)*23+13].textContent),
        c70: this.getNumber(eltosTD[(i-1)*23+14].textContent),
        rsp: this.getNumber(eltosTD[(i-1)*23+15].textContent),
        totu: this.getNumber(eltosTD[(i-1)*23+16].textContent),
        totue: this.getNumber(eltosTD[(i-1)*23+17].textContent),
        mbu: this.getNumber(eltosTD[(i-1)*23+18].textContent),
        sbu: this.getNumber(eltosTD[(i-1)*23+19].textContent),
        tru: this.getNumber(eltosTD[(i-1)*23+20].textContent),
        coli: this.getNumber(eltosTD[(i-1)*23+21].textContent),
        ocp: this.getNumber(eltosTD[(i-1)*23+22].textContent)
      };
      //console.log(eltosTD[(i-1)*23+22].textContent );
      dataTraficoDiario.asr=100;
      if (dataTraficoDiario.int > 0){
        dataTraficoDiario.asr=Number(((dataTraficoDiario.rsp/dataTraficoDiario.int)*100).toFixed(2));
      }
      /*
      dataTraficoDiario.ocup=0;
      if(dataTraficoDiario.cice > 0){
        dataTraficoDiario.ocup=Number((dataTraficoDiario.totue/dataTraficoDiario.cice*100).toFixed(2));
      }
      */

      if(typeof erlangs == 'undefined'){
        dataTraficoDiario.ocup=dataTraficoDiario.ocp;
      }else{
        var aux=erlangs(dataTraficoDiario.cic);
        if(aux>0){
          dataTraficoDiario.ocup=Number((((dataTraficoDiario.totu/36)/aux)*100).toFixed(2));
        }else{
          dataTraficoDiario.ocup=0;
        }
      }
      dataTraficoDiario.h=hora;

      fecha=ano+"-"+mes+"-"+ dia;
      if (this.ValidaData(nombreArchivo, i, central, ruta, ano, mes, dia, hora, dataTraficoDiario)){
        if (typeof this.dataHora[fecha] == 'undefined'){
          this.dataHora[fecha]={};
        }
        var objFecha=this.dataHora[fecha];
        if (typeof objFecha[central] == 'undefined'){
          objFecha[central]={};
        }
        var objCentral=objFecha[central];
        if (typeof objCentral[ruta] == 'undefined'){
          objCentral[ruta]={};
        }
        var objRuta = objCentral[ruta];
        if (typeof objRuta[hora] == 'undefined'){
          objRuta[hora]={};
        }
        objRuta[hora]=dataTraficoDiario;
      }
    }
  }
  this.CalculaTraficoDiario();
};

TraficoDiario.prototype.CalculaTraficoDiario=function(){
  //console.log(this.dataHora);
    var objCentral, objRuta, objFecha, objDia, objHora;
    for(var f in this.dataHora){
      objFecha=this.dataHora[f];
      for(var c in objFecha){
        objCentral=objFecha[c];
        for(var r in objCentral){
          objRuta=objCentral[r];
          var objMaximo={};
          var stat={int:{h:0, num: 1, max:0, prom:0, sum:0}, asr:{h:0, num: 1, min:10000,prom:0, sum:0}, ocup:{h:0, num:1,  max:0, prom:0, sum:0}};
          for(var h in objRuta){
            objHora=objRuta[h];
            if(stat.ocup.max <= objHora.ocup){
              objMaximo=objHora;;
              stat.ocup.h=Number(h);
              stat.ocup.num=1;
              stat.ocup.max=objHora.ocup;
              stat.ocup.sum=objHora.ocup;

              stat.asr.h=Number(h);
              stat.asr.num=1;
              stat.asr.min=objHora.asr;
              stat.asr.sum=objHora.asr;

              stat.int.h=Number(h);
              stat.int.num=1;
              stat.int.max=objHora.int;
              stat.int.sum=objHora.int;
            }
          }
          if(stat.int.num > 0){
            stat.int.prom=Number((stat.int.sum/stat.int.num).toFixed(2));
            stat.asr.prom=Number((stat.asr.sum/stat.int.num).toFixed(2));
            stat.ocup.prom=Number((stat.ocup.sum/stat.int.num).toFixed(2));
          }else{
            stat.int.prom=0;
            stat.asr.prom=0;
            stat.ocup.prom=0;
          }

          //console.log(stat.ocup);
          //console.log(stat.ocup.sum);
          stat.asr.sum=Number(stat.asr.sum.toFixed(2));
          stat.ocup.sum=Number(stat.ocup.sum.toFixed(2));

          var objDataDiaria = this.AgregaDataDiaria(f, c, r);
          objDataDiaria.data=objMaximo;
          objDataDiaria.stat=stat;
        }
      }
    }
    //console.log('CalculaTraficoDiario: fin');
    //console.log(this.dataDiaria);
    this.dataHora={};
  };

TraficoDiario.prototype.AgregaDataDiaria=function(fecha, central, ruta,dia){
  //console.log(fecha);
  var arrFecha=fecha.split('-');
  if(typeof dia=='undefined'){
    dia=arrFecha[2];
  }
  //console.log(dia);

  var auxFecha=arrFecha[0]+'-'+arrFecha[1];
  if (typeof this.dataDiaria[auxFecha]=='undefined'){
    this.dataDiaria[auxFecha]={};
  }
  var objFecha=this.dataDiaria[auxFecha];
  if (typeof objFecha[central] == 'undefined'){
    objFecha[central]={};
  }
  var objCentral=objFecha[central];
  if (typeof objCentral[ruta]=='undefined'){
    objCentral[ruta]={};
  }
  var objRuta = objCentral[ruta];
  if (typeof objRuta[dia] == 'undefined'){
    objRuta[dia]={};
  }
  return objRuta[dia];
};

TraficoDiario.prototype.getObjBDDataDiaria=function(){

    var objFecha, objCentral, objRuta;
    var data=[];
    for(var i=0; i<this.dataDiaria.length;i++){
      var dataCentral={};
      objFecha=this.dataDiaria[i];
      for(var j=0; j<objFecha.centrales.length;j++){
        objCentral=objFecha.centrales[j];
        var dataRuta={};
        for(var k=0; k<objCentral.rutas.length;k++){
          objRuta=objCentral.rutas[k];
          //console.log(objRuta);
          dataRuta[objRuta.ruta]={};
          dataRuta[objRuta.ruta].h=objRuta.horas[0].hora;
          dataRuta[objRuta.ruta].d=objRuta.horas[0].data;
          dataRuta[objRuta.ruta].stat=objRuta.stat;
        }
        var fecha = objFecha.fecha.split("-");
        data.push([fecha[0], fecha[1], fecha[2], objCentral.central, dataRuta]);
        //dataCentral[objCentral.central]=dataRuta;
      }
    }
    //return JSON.stringify(data);
    return data;
};

TraficoDiario.prototype.ValidaData=function(nombreArchivo, linea, central, ruta, ano, mes, dia, hora, dataTraficoDiario){

    if ((ano<2000) || (ano>2100)){
      this.AgregaError( ": registro "+i +". El año no es válido. Año:" + ano);
      return false;
    }
    if ((mes<=0) || (mes >12)){
      this.AgregaError( ": registro "+i+". El mes no es válido. Mes:" + mes);
      return false;
    }
    if ((dia<=0) || (dia>31)){
      this.AgregaError( ": registro "+i+". El día no es válido. Día:" + dia);
      return false;
    }
    if ((hora<0) || (hora>23)){
      this.AgregaError( ": registro "+i+". La hora no es válida. Hora:" + hora);
      return false;
    }
    if (dataTraficoDiario.cic1 < 0){
      this.AgregaError( ": registro "+i+". El valor circuitos1 es negativo:" + dataTraficoDiario.cic1);
      return false;
    }
    if (dataTraficoDiario.cic2 < 0){
      this.AgregaError( ": registro "+i+". El valor circuitos2 es negativo:" + dataTraficoDiario.cic2);
      return false;
    }
    if (dataTraficoDiario.int < 0){
      this.AgregaError( ": registro "+i+". El valor intentos es negativo:" + dataTraficoDiario.int);
      return false;
    }
    if (dataTraficoDiario.dbd < 0){
      this.AgregaError( ": registro "+i+". El valor desborde es negativo:" + dataTraficoDiario.dbd);
      return false;
    }
    if (dataTraficoDiario.n98 < 0){
      this.AgregaError( ": registro "+i+". El valor N99_98% es negativo:" + dataTraficoDiario.n98);
      return false;
    }
    if (dataTraficoDiario.con < 0){
      this.AgregaError( ": registro "+i+". El valor Connect es negativo:" + dataTraficoDiario.con);
      return false;
    }
    if (dataTraficoDiario.c70 < 0){
      this.AgregaError( ": registro "+i+". El valor C90_70% es negativo:" + dataTraficoDiario.c70);
      return false;
    }
    if (dataTraficoDiario.rsp < 0){
      this.AgregaError( ": registro "+i+". El valor Respuesta es negativo:" + dataTraficoDiario.rsp);
      return false;
    }
    if (dataTraficoDiario.totu < 0){
      this.AgregaError( ": registro "+i+". El valor Totu es negativo:" + dataTraficoDiario.totu);
      return false;
    }
    if (dataTraficoDiario.totue < 0){
      this.AgregaError( ": registro "+i+". El valor Totu E es negativo:" + dataTraficoDiario.totue);
      return false;
    }
    if (dataTraficoDiario.mbu < 0){
      this.AgregaError( ": registro "+i+". El valor MBU es negativo:" + dataTraficoDiario.mbu);
      return false;
    }
    if (dataTraficoDiario.sbu < 0){
      this.AgregaError( ": registro "+i+". El valor SBU es negativo:" + dataTraficoDiario.sbu );
      return false;
    }
    if (dataTraficoDiario.tru < 0){
      this.AgregaError( ": registro "+i+". El valor TRU es negativo:" + dataTraficoDiario.tru );
      return false;
    }
    if (dataTraficoDiario.coli < 0){
      this.AgregaError( ": registro "+i+". El valor Colisiones es negativo:" + dataTraficoDiario.coli );
      return false;
    }
    if (dataTraficoDiario.ocp < 0){
      this.AgregaError( ": registro "+i+". El valor Ocupacion es negativo:" + dataTraficoDiario.ocp );
      return false;
    }
    return true;
};

TraficoDiario.prototype.AgregaError=function(msgError){
  this.arrErrores.push(this.filename + ":" + msgError);
};

TraficoDiario.prototype.AgregaWarning=function(msgWarning){
  this.arrWarnings.push(this.filename + ":" + msgWarning);
};


TraficoDiario.prototype.getObjHora=function(hora, data){
  var objHora = {hora: hora, data: data};
  return objHora;
};

TraficoDiario.prototype.getObjRuta=function(ruta, objHora){
  var objRuta = {ruta: ruta, horas:[], stat:this.getObjEstadistica()};
  objRuta.horas.push(objHora);
  return objRuta;
};

TraficoDiario.prototype.getObjCentral=function(central, objRuta){
  var objCentral = {central:central, rutas:[]};
  objCentral.rutas.push(objRuta);
  return objCentral;
};

TraficoDiario.prototype.getObjFecha=function(fecha, objCentral){
  var objFecha={fecha:fecha, centrales:[] }
  objFecha.centrales.push(objCentral);
  return objFecha;
};

TraficoDiario.prototype.getObjEstadistica=function(){
  var objIntentos={max:0, prom:0, prom1:0};
  var objASR={max:0, prom:0, prom1:0};
  var objEstadistica={int:objIntentos, asr:objASR}
  return objEstadistica;
};

TraficoDiario.prototype.getNumber=function(strData){
  var strAux=strData.trim().split(",");
  if (strAux[0]==""){
    strAux[0]="0";
  }
  if (strAux.length<2){
    return Number(strData);
  }
  var res;
  if (strAux[1].length == 1){
    //res = (parseInt(strAux[0])+(strAux[1]/10)).toFixed(2);
    res = Number((parseInt(strAux[0])+(strAux[1]/10)).toFixed(2));
  }
  else{
    //res= (parseInt(strAux[0])+(strAux[1].slice(0,2)/100)).toFixed(2);
    res= Number((parseInt(strAux[0])+(strAux[1].slice(0,2)/100)).toFixed(2));
  }
  if (isNaN(res)){
    console.log("no es número");
    console.log(strData);
    console.log(strAux[0]);
    console.log(strAux[1]);
    console.log(strAux[1].slice(0,2)/10);
    console.log(strAux[1].slice(0,2)/100);
    console.log("entero:" + parseInt(strAux[0]));
    console.log(isNaN(parseInt(strAux[0])));
    console.log(isNaN(strAux[1].slice(0,2)/10));
    console.log(isNaN(strAux[1].slice(0,2)/100));
    console.log(isNaN(parseInt(strAux[0])))
  }
  return res;
};

TraficoDiario.prototype.getRutasSinTrafico=function(){
  var rutasSinTrafico={};
  for(var fecha in this.dataDiaria){
    var arrFecha=fecha.split('-');
    rutasSinTrafico[fecha]={dias:getDiasDelMes(arrFecha[0], arrFecha[1])};
    for (var central in this.dataDiaria[fecha]){
      for(var ruta in this.dataDiaria[fecha][central]){
        var numDias=0;
        for(var dia in this.dataDiaria[fecha][central][ruta]){
          numDias++;
        }
        if(numDias < rutasSinTrafico[fecha].dias){
          if (typeof rutasSinTrafico[fecha][central] == 'undefined'){
            rutasSinTrafico[fecha][central]={};
          }
          rutasSinTrafico[fecha][central][ruta]=Object.assign({},this.dataDiaria[fecha][central][ruta]);
        }
      }
    }
  }
  return rutasSinTrafico;
};

TraficoDiario.prototype.getRutas=function(){
  var rutas={};
  for(var fecha in this.dataDiaria){
    var count=0;
    rutas[fecha]={};
    for(var central in this.dataDiaria[fecha]){
      rutas[fecha][central]={};
      for(var ruta in this.dataDiaria[fecha][central]){
        rutas[fecha][central][ruta]=1;
        count++;
      }
    }
    rutas[fecha].count=count;
  }
  return rutas;
};
TraficoDiario.prototype.cuentaData=function(){
  var res={cfecha:0, ccentral:0, crutas:0, cdias:0}
  for(var fecha in this.dataDiaria){
    res.cfecha++;
    for(var central in this.dataDiaria[fecha]){
      res.ccentral++;
      for(var ruta in this.dataDiaria[fecha][central]){
        res.crutas++;
        for(var dias in this.dataDiaria[fecha][central][ruta]){
          res.cdias++;
        }
      }
    }
  }
  return res;
};
TraficoDiario.prototype.AddTrafico=function(trafico){
  var data=trafico.dataDiaria;
  for(var fecha in data){
    for(var central in data[fecha]){
      for(var ruta in data[fecha][central]){
        for(var dia in data[fecha][central][ruta]){
          var objDia=this.AgregaDataDiaria(fecha, central, ruta, dia);
          this.dataDiaria[fecha][central][ruta][dia]=Object.assign({}, data[fecha][central][ruta][dia]);
        }
      }
    }
  }
  for(var i=0;i<trafico.arrErrores.length;i++){
    this.arrErrores.push(trafico.arrErrores[i]);
  }

  for(var i=0;i<trafico.arrWarnings.length;i++){
    this.arrWarnings.push(trafico.arrWarnings[i]);
  }
};

TraficoDiario.prototype.getObjetoRuta=function(fecha, central, ruta){
  if(typeof this.dataDiaria[fecha]=='undefined'){
    return;
  }
  if(typeof this.dataDiaria[fecha][central]=='undefined'){
    return;
  }
  if(typeof this.dataDiaria[fecha][central][ruta]=='undefined'){
    return;
  }
  return this.dataDiaria[fecha][central][ruta];
};
