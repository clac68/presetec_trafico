function TraficoMensual(document, window){
var errores=[];
var warnings=[];
var DataMensual={};
}

//procesa información proveniente de la Base de Datos
TraficoMensual.prototype.procesaDataDiariaBD(ano, mes, snapshot){
  //snapshot contiene toda la información
  dataMesXDia={};
  dataMesXDia[ano+"-"+mes]={};
  var obFecha = dataMesXDia[ano+"-"+mes];
  snapshot.forEach(function(sDia){
    sDia.forEach(function(sCentral){
      sCentral.forEach(function(sRuta){
        if (typeof objFecha[sCentral.key] == "undefined"){
          objFecha[sCentral.key]={};
        }
        objCentral=objFecha[sCentral.key];
        if (typeof objCentral[sRuta.key] == "undefined"){
          objCentral[sRuta.key]={};
        }
        objRuta=objCentral[sRuta.key];
        if (typeof objRuta[sDia] == "undefined"){
          objRuta[sDia]={};
        }
        objDia = objRuta[sDia];
        sRuta.forEach(function(dRuta){
          if(dRuta.key == "data"){
            objDia.data=dRuta.val();
          }
          if(dRuta.key == "stat"){
            dRuta.forEach(function(dStat){
              switch(dStat.key){
                case "int":
                  objDia.stat.int=dStat.val();
                  break;
                case "asr":
                  objDia.stat.asr=dStat.val();
                  break;
                case "ocup":
                  objDia.stat.ocup=dStat.val();
                  break;
              }
            })
          }
        })
      })
    })
  })
}

TraficoDiario.prototype.CalculaEstadisticaMensual= function(dataMesXDia){

  for(var fecha in dataMesXDia){
    var objFecha = dataMesXDia[fecha];
    for(var central in objFecha){
      var objCentral=objFecha[central];
      for(var ruta in objCentral){
        var objRuta=objCentral[ruta];
        var maxInt=0;
        var diaMaxInt=0;
        var objMaxInt={};
        var minAsr=
        var statInt={dia:dia, max:0, prom:0, sum:0};
        var statAsr={dia:dia, min:0, prom:0, sum:0};
        var statInt={dia:dia, max:0, prom:0, sum:0};
        for(var dia in objRuta){
          var objDia= objRuta[dia];

          if(objDia.stat.int.max >= maxint){
            objMaxInt=objDia.data;
            statInt.max=objDia.stat.int.max;
            statInt.sum+=objDia.stat.int.sum;
          }
          if(objDia.stat.asr.min <= minAsr){
            objMaxInt=objDia.data;
            statInt.max=objDia.stat.int.max;
            statInt.sum+=objDia.stat.int.sum;
          }
        }
      }
    }
  }
}

TraficoDiario.prototype.getDataConsultaDiariaDelMes= function(ano, mes){
  return ("/tDiario/"+ ano + "/" + mes + "/");
};

TraficoDiario.prototype.setDataDiariadelMes = function(ano, mes, dataBD){
  var dataMes ={};
  dataBD
};
