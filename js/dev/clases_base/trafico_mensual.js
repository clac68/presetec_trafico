'use strict'
//Constructor a partir de un trafico diario.
//No definir trafico para inicializarlo desde la base de datos.
function TraficoMensual(bd){
  this.bd=bd;
  this.DataMensual={};
}
TraficoMensual.prototype.CalculaTraficoMensual=function(TraficoDiario){
  console.log('CalculaTraficoMensual');
  console.log(TraficoDiario);
  for(var fecha in TraficoDiario.dataDiaria){
    var objFecha = TraficoDiario.dataDiaria[fecha];
    for (var central in objFecha){
      var objCentral=objFecha[central];
      for (var ruta in objCentral){
        var objRuta=objCentral[ruta];
        var objMaximoInt={};
        var objMensual=this.getRegistroDataMensual(fecha, central, ruta);
        for(var dia in objRuta){
          var objDia=objRuta[dia];
          this.ActualizaRegistroMes(fecha, dia, objDia, objMensual );
        }
      }
    }
  }
  this.CalculaPromedio();
};

TraficoMensual.prototype.deleteMantencion=function(ano,mes, cb_ok, cb_error){
  var path='';
  if (typeof mes == 'undefined'){
    path= '/tMensual/'+ano;
  }else{
    path= '/tMensual/'+ano+'/'+mes;
  }
  this.bd.deleteData(path, function(){
    cb_ok();
  }, function(e){
    cb_error(e);
  });
};

TraficoMensual.prototype.deleteDataMensual=function(ano, mes, cb_ok, cb_error){
  var count=0;
  for(var fecha in thisData.DataMensual){
    count++;
  }
  var countOK=0;
  var countError=0;
  for(var fecha in thisData.DataMensual){
    var arrFecha=fecha.split('-');
    var path='/tMensual/'+arrFecha[0]+"/"+arrFecha[1];
    this.bd.deleteData(ref, function(){
      count--;
      countOK++;
      delete thisData.DataMensual[fecha];
      if (count==0){
        if (countError > 0){
          cb_error("No se borraron toso los registros");
        }else{
          cb_ok();
        }
      }
    }, function(e){
      count--;
      countError++;
      if (count==0){
        if (countError > 0){
          cb_error("No se borraron toso los registros");
        }else{
          cb_ok();
        }
      }
    });
  }
}

TraficoMensual.prototype.getDataMensualFromBD=function(ano, mes, cb_ok, cb_error){
  var dis=this;
  var fecha=ano+"-"+mes;
  this.DataMensual[fecha]={};
  this.bd.getData('/tMensual/'+ano+'/'+mes, function(snapshot){
    snapshot.forEach(function(central){
      central.forEach(function(ruta){
        var objRuta=dis.getRegistroDataMensual(fecha, central.key, ruta.key);
        ruta.forEach(function(param){
          if (param.key=='data'){
            objRuta.data=SnapShot2Object(param);
          }
          if (param.key=='stat'){
            param.forEach(function(stat){
              objRuta.stat[stat.key]=SnapShot2Object(stat);
            })
          }
        })
      })
    })
    cb_ok();
  }, function(e){
    console.log('getDataMensualFromBD:ERROR');
    console.log(e);
    cb_error(e);
  });
};

TraficoMensual.prototype.saveDataMensual=function(cb_ok, cb_error){
  var count=0;
  for(var fecha in this.DataMensual){
    count++;
  }
  var countOK=0;
  var countError=0;
  for(var fecha in this.DataMensual){
    var arrFecha=fecha.split('-');
    var mes;
    this.deleteMantencion(arrFecha[0]-3,mes, function(){}, function(e){});
    var path='/tMensual/'+arrFecha[0]+"/"+arrFecha[1];
    this.bd.setData(path, this.DataMensual[fecha], function(){
      count--;
      countOK++;
      if (count==0){
        if (countError>0){
          cb_error("No se cargaron todos los datos");
        }else{
          cb_ok();
        }
      }
    }, function(e){
      count--;
      countError++;
      if (count==0){
        if (countError>0){
          cb_error("No se cargaron todos los datos");
        }else{
          cb_ok();
        }
      }
    });
  }
};

TraficoMensual.prototype.CalculaPromedio=function(){
  for(var fecha in this.DataMensual){
    var arrFecha = fecha.split("-");
    var diasMes=getDiasDelMes(Number(arrFecha[0]), Number(arrFecha[1]));
    var objFecha = this.DataMensual[fecha];
    for (var central in objFecha){
      var objCentral=objFecha[central];
      for (var ruta in objCentral){
        var objRuta = objCentral[ruta];
        if(objRuta.stat.int.num > 0){
          objRuta.stat.int.prom=Number((objRuta.stat.int.sum/(objRuta.stat.int.num)).toFixed(2));
          objRuta.stat.asr.prom=Number((objRuta.stat.asr.sum/(objRuta.stat.int.num)).toFixed(2));
          objRuta.stat.ocup.prom=Number((objRuta.stat.ocup.sum/(objRuta.stat.int.num)).toFixed(2));
        }else{
          objRuta.stat.int.prom=0;
          objRuta.stat.asr.prom=0;
          objRuta.stat.ocup.prom=0;
        }
        objRuta.stat.int.sum=Number(objRuta.stat.int.sum.toFixed(2));
        objRuta.stat.asr.sum=Number(objRuta.stat.asr.sum.toFixed(2));
        objRuta.stat.ocup.sum=Number(objRuta.stat.ocup.sum.toFixed(2));
      }
    }
  }
};


TraficoMensual.prototype.ActualizaRegistroMes=function(fecha, dia, objRutaDia, objRutaMes){
  objRutaMes.stat.int.sum+=objRutaDia.stat.int.sum;
  objRutaMes.stat.int.num+=objRutaDia.stat.int.num;
  if (objRutaDia.stat.int.max >= objRutaMes.stat.int.max){
    objRutaMes.stat.int.max=objRutaDia.stat.int.max;
    objRutaMes.data=objRutaDia.data;
    objRutaMes.stat.int.d=Number(dia);
    objRutaMes.stat.int.h=objRutaDia.stat.int.h;
    objRutaMes.data.d=Number(dia);

  }
  objRutaMes.stat.asr.sum+=objRutaDia.stat.asr.sum;
  objRutaMes.stat.asr.num+=objRutaDia.stat.asr.num;
  if (objRutaDia.stat.asr.min <= objRutaMes.stat.asr.min){
    objRutaMes.stat.asr.min=objRutaDia.stat.asr.min;
    objRutaMes.stat.asr.d=Number(dia);
    objRutaMes.stat.asr.h=objRutaDia.stat.asr.h;
  }
  objRutaMes.stat.ocup.sum+=objRutaDia.stat.ocup.sum;
  objRutaMes.stat.ocup.num+=objRutaDia.stat.ocup.num;
  if (objRutaDia.stat.ocup.max >= objRutaMes.stat.ocup.max){
    objRutaMes.stat.ocup.max=objRutaDia.stat.ocup.max;
    objRutaMes.stat.ocup.d=Number(dia);
    objRutaMes.stat.ocup.h=objRutaDia.stat.ocup.h;
  }
};

TraficoMensual.prototype.getRegistroDataMensual=function(fecha, central, ruta){

  if(typeof this.DataMensual[fecha] == "undefined"){
    this.DataMensual[fecha]={};
  }
  var objFecha=this.DataMensual[fecha];
  if (typeof objFecha[central] == 'undefined'){
    objFecha[central]={};
  }
  var objCentral=objFecha[central];
  if (typeof objCentral[ruta] == 'undefined'){
    objCentral[ruta]={};
  }
  var objRuta = objCentral[ruta];
  objRuta.stat={int:{d:0, num:0, h:0, max:0, prom:0, sum:0}, asr:{d:0, h:0, num:0, min:10000,prom:0, sum:0}, ocup:{d:0, h:0, num:0, max:0, prom:0, sum:0}};
  objRuta.data={};

  return objRuta;
};

TraficoMensual.prototype.getDiferenciasTraficoMensual=function(dataMesAnterior){
  var res={nuevas:{}, eliminadas:{}, warnings:{}}
  ComparaTraficoMensual("nuevas", this.DataMensual, dataMesAnterior, res.nuevas, res.warnings);
  ComparaTraficoMensual("eliminadas", dataMesAnterior, this.DataMensual, res.eliminadas, res.warnings);
  return res;
};

TraficoMensual.prototype.ComparaTraficoMensual=function(tipo, dataMes1, dataMes2, diferencia, warnings){
  for (var fecha in dataMes1){
    var objFecha = dataMes1[fecha];
    for(var central in objFecha){
      var objCentral=objFecha[central];
      for(var ruta in objCentral){
        var objRuta=objCentral[ruta];
        if(typeof dataMes2[fecha][central][ruta] == 'undefined'){
          this.NuevaRuta(diferencia, fecha, central, ruta);
        }else{
          var int=objRuta[stat][int][max];
          var int1=dataMes2[fecha][central][ruta][stat][int][max];
          if ((int>100) && ((int>2*int1)||(int1>2*int))){
            var warning=this.NuevaRuta(warnings, fecha, central, ruta)
            var msg="";
            if (tipo=="nuevas"){
              msg="El número de intentos superó el umbral respecto del mes anterior. Actual-Anterior:"+int+"-"+int1;
            }else{
              msg="El número de intentos bajó el umbral respecto del mes anterior. Actual-Anterior:"+int1+"-"+int;
            }
            warning.info=msg;
          }
        }
      }
    }
  }
};

TraficoMensual.prototype.NuevaRuta=function(nuevas, fecha, central, ruta){
  if(typeof nuevas[fecha]=='undefined'){
    nuevas[fecha]={};
  }
  var objFecha=nuevas[fecha];
  if(typeof objFecha[central]=='undefined'){
    objFecha[central]={};
  }
  var objCentral=objFecha[central];
  if (typeof objCentral[ruta]=='undefined'){
    objCentral[ruta]="";
  }
  return objCentral[ruta];
};
