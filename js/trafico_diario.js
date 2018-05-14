'use strict'
function TraficoDiario(document, window){
  this.document = document;
  this.window=document;
  this.contador = 0;
  this.totRegistros = 0;
  this.arrErrores = [];
  this.arrWarnings = [];
  this.dataDiaria = [];
  this.dataDiariaDelMes = [];
  this.filename="";
}

TraficoDiario.prototype.procesaHtml=function(nombreArchivo, htmlData){
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
  var DataxHora={};
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
      dataTraficoDiario.asr=100;
      if (dataTraficoDiario.int > 0){
        dataTraficoDiario.asr=Number((dataTraficoDiario.rsp/dataTraficoDiario.int*100).toFixed(2));
      }
      dataTraficoDiario.ocup=0;
      if(dataTraficoDiario.cice > 0){
        dataTraficoDiario.ocup=Number((dataTraficoDiario.totue/dataTraficoDiario.cice*100).toFixed(2));
      }
      dataTraficoDiario.h=hora;

      fecha=ano+"-"+mes+"-"+ dia;
      if (this.ValidaData(nombreArchivo, i, central, ruta, ano, mes, dia, hora, dataTraficoDiario)){
        var c={};
        var r={};
        var h={};
        h[hora]=dataTraficoDiario;
        r[ruta]={h:h, stat:{}};
        c[central]=r[ruta];
        if (typeof DataxHora[fecha] == 'undefined'){
          DataxHora[fecha]={};
          DataxHora[fecha][central] = {};
          DataxHora[fecha][central][ruta]={h:h, stat:{}};
        }else{
          if (typeof DataxHora[fecha][central] == 'undefined'){
            DataxHora[fecha][central]={};
            DataxHora[fecha][central][ruta]={h:h, stat:{}};
          }else{
            if (typeof DataxHora[fecha][central][ruta] == 'undefined'){
              DataxHora[fecha][central][ruta]={h:h, stat:{}};;
            }else{
              if (typeof DataxHora[fecha][central][ruta].h[hora] == 'undefined'){
                DataxHora[fecha][central][ruta].h[hora]=dataTraficoDiario;
              }else{
                this.AgregaError( "Error: el archivo tiene datos duplicados.");
                this.AgregaWarning("Error: el archivo tiene datos duplicados.");
              }
            }
          }
        }
      }
    }
  }
  //console.log(DataxHora);
  console.log(DataxHora);
  this.CalculaTraficoDiario(DataxHora);
  return true;
};

TraficoDiario.prototype.CalculaTraficoDiario=function(DataxHora){
    var maxIntentos=0;
    var prom=0;
    var horapick;
    var objCentral, objRuta, objFecha, objDia, objHora;
    for(var f in DataxHora){
      objFecha=DataxHora[f];
      for(var c in objFecha){
        objCentral=objFecha[c];
        for(var r in objCentral){
          objRuta=objCentral[r];
          var objMaximo={};
          var stat={int:{h:0, max:0, prom:0, sum:0}, asr:{h:0,min:10000,prom:0, sum:0}, ocup:{h:0, max:0, prom:0, sum:0}};
          for(var h in objRuta.h){
            objHora=objRuta.h[h];
            stat.int.sum+=objHora.int;
            stat.asr.sum+=objHora.asr;
            stat.ocup.sum+=objHora.ocup;
            if (stat.int.max <= objHora.int){
              objMaximo=objHora;
              stat.int.max=objHora.int;
              stat.int.h=Number(h);
            }
          }
          if(stat.asr.min >= objHora.asr){
            stat.asr.min=objHora.asr;
            stat.asr.h=Number(h);
          }
          if(stat.ocup.max <= objHora.ocup){
            stat.ocup.max=objHora.ocup;
            stat.ocup.h=Number(h);
          }
          delete objRuta.h;
          objRuta.data=objMaximo;
          stat.int.prom=Number((stat.int.sum/24).toFixed(2));
          stat.asr.prom=Number((stat.asr.sum/24).toFixed(2));
          stat.ocup.prom=Number((stat.ocup.sum/24).toFixed(2));
          objRuta.stat=stat;
        }
      }
    }
    this.dataDiaria=DataxHora;
  };


TraficoDiario.prototype.getDataDiaria2BD=function(){
  var arr = [];
  for(var fecha in this.dataDiaria){
    var objFecha=this.dataDiaria[fecha];
    var arrFecha=fecha.split("-");
    for(var central in objFecha){
      var objCentral=objFecha[central];
      var path="/tDiario/"+arrFecha[0]+"/"+arrFecha[1]+"/"+arrFecha[2]+"/"+ central +"/";
      arr.push({fecha: fecha, central: central, path: path, data: objCentral});
    }
  }
  return arr;
};

TraficoDiario.prototype.setDataDiariaFromBD=function(fecha, data){
  var dTrafico={};
  dTrafico[fecha]={};
  objFecha =dTrafico[fecha];
  data.forEach(function(cCentral){
    if (typeof objFecha[cCentral.key] == "undefined"){
      objFecha[cCentral.key]={};
    }
    objCentral=objFecha[cCentral.key];
    cCentral.forEach(function(cRuta){
      if (typeof objCentral[cRuta.key]=="undefined"){
        objCentral[cRuta.key]={};
      }
      var objRuta=objCentral[cRuta.key];
      cRuta.forEach(function(dataRuta){
        dataRuta.forEach(function(d){
          if (d.key=="data"){
            objRuta.data=d.val();
          }
          if (d.key=="stat"){
            objRuta.stat={};
            d.forEach(function(s){
              objRuta.stat[s.key]=s.val();
            })
          }
        })
      })
    })
  })
  return dTrafico;
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
  console.log("se agrego un eror");
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
    res = (parseInt(strAux[0])+(strAux[1]/10)).toFixed(2);
  }
  else{
    //res= (parseInt(strAux[0])+(strAux[1].slice(0,2)/100)).toFixed(2);
    res= (parseInt(strAux[0])+(strAux[1].slice(0,2)/100)).toFixed(2);
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
