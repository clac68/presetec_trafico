function Trafico(document, window){
  this.document = document;
  this.window=document;
  this.contador = 0;
  this.totRegistros = 0;
  this.arrErrores = [];
  this.arrWarnings = [];
  this.dataDiaria = [];
}

trafico.prototype.getError(){
  return this.arrErrores;
}

trafico.prototype.getWarnings(){
  return this.arrWarnings;
}

trafico.prototype.getData(){
  return this.dataDiaria;
}

trafico.prototype.procesaHtml(nombreArchivo, htmlData){
  this.filename=nombreArchivo;
  var parser, htmlDoc, eltosTR, eltosTD;
  try{
    parser = new DOMParser();
    htmlDoc=parser.parseFromString(htmlData, "text/html")
    eltosTR = htmlDoc.getElementsByTagName("tr");
    eltosTD = htmlDoc.getElementsByTagName("td");
  } catch(e){
    this.AgregaError(nombreArchivo, "Error al leer archivo html:" + e);
    console.log("DataTrafico: cargaHtml: " + nombreArchivo + ":Error al leer archivo html:" + e);
    return false;
  }
  if ((eltosTD.length==0) ||(eltosTR.length==0)){
    this.AgregaError(nombreArchivo, "Error al leer archivo: No es el archivo Html esperado. No tiene datos");
    return false;
  }
  if ( eltosTD.length != eltosTR.length * 23 ){
    this.AgregaError(nombreArchivo, "Error: el archivo no tiene 23 columans");
    return this;
  }
  var central, ruta, fecha, ano, mes, dia, hora;
  var DataxHora=[];
  for(var i=1; i<eltosTR.length;i++){
    if (i>1){
      central = eltosTD[(i-1)*23+5].textContent.trim();
      ruta = eltosTD[(i-1)*23+7].textContent.trim();
      ano = parseInt(eltosTD[(i-1)*23+1].textContent.trim());
      mes = parseInt(eltosTD[(i-1)*23+2].textContent.trim());
      dia=parseInt(eltosTD[(i-1)*23+3].textContent.trim());
      hora=parseInt(eltosTD[(i-1)*23+4].textContent.split(":",2)[0].trim());

      var dataTrafico={
        cic1: getNumber(eltosTD[(i-1)*23+8].textContent),
        cic2: getNumber(eltosTD[(i-1)*23+9].textContent),
        int: getNumber(eltosTD[(i-1)*23+10].textContent),
        dbd: getNumber(eltosTD[(i-1)*23+11].textContent),
        n98: getNumber(eltosTD[(i-1)*23+12].textContent),
        con: getNumber(eltosTD[(i-1)*23+13].textContent),
        c70: getNumber(eltosTD[(i-1)*23+14].textContent),
        rsp: getNumber(eltosTD[(i-1)*23+15].textContent),
        totu: getNumber(eltosTD[(i-1)*23+16].textContent),
        totue: getNumber(eltosTD[(i-1)*23+17].textContent),
        mbu: getNumber(eltosTD[(i-1)*23+18].textContent),
        sbu: getNumber(eltosTD[(i-1)*23+19].textContent),
        tru: getNumber(eltosTD[(i-1)*23+20].textContent),
        coli: getNumber(eltosTD[(i-1)*23+21].textContent),
        ocp: getNumber(eltosTD[(i-1)*23+22].textContent)
      };
      if (this.ValidaData(nombreArchivo, i, central, ruta, ano, mes, dia, hora, dataTrafico)){
        this.AgregaDataXHora(DataxHora, nombreArchivo, i, central, ruta, ano, mes, dia, hora, dataTrafico);
      }
    }
  }
  //console.log(DataxHora);
  this.CalculaTraficoDiario(DataxHora);
  return true;
}

trafico.prototype.AgregaDataXHora(DataxHora, nombreArchivo, i, central, ruta, ano, mes, dia, hora, dataTrafico){

    hora=parseInt(hora);
    var fecha=ano+"-"+mes+"-"+dia;
    var objHora, objFecha, objRuta, objCentral;

    //console.log("central/ruta/fecha/hora:"+central+"/"+ruta+"/"+fecha+"/"+hora);
    for(var i=0; i<DataxHora.length;i++){
      objFecha=DataxHora[i];
      if (objFecha.fecha.includes(fecha)){
        for(var j=0;j<objFecha.centrales.length;j++){
          objCentral = objFecha.centrales[j];
          if (objCentral.central.includes(central)){
            for(var k=0; k<objCentral.rutas.length;k++){
              objRuta=objCentral.rutas[k];
              if (objRuta.ruta.includes(ruta)){;
                for(var l=0;l<objRuta.horas.length;l++){
                  objHora=objRuta.horas[l];
                  if (objHora.hora==hora){
                    console.log("Se encontraron 2 registros con la misma hora");
                    this.AgregaWarning(nombreArchivo, "Encontré 2 registros del archivo con la misma hora (dejé el último valor). Central="+ central + "-ruta="+ruta+"-fecha:"+fecha+"-hora="+hora);
                    objHora.data=dataTrafico;
                    return;
                  }
                }
                //No encuentra registro con la misma hora
                objRuta.horas.push(getObjHora(hora, dataTrafico));
                return;
              }
            }
            //la ruta no existe en la central
            objCentral.rutas.push(getObjRuta(ruta, getObjHora(hora, dataTrafico)));
            return;
          }
        }
        //La central no existe para la fecha indicada
        objFecha.centrales.push(getObjCentral(central, getObjRuta(ruta, getObjHora(hora, dataTrafico))));
        return;
      }
    }
    //No encontró un registro con la misma fecha
    DataxHora.push(getObjFecha(fecha, getObjCentral(central, getObjRuta(ruta, getObjHora(hora, dataTrafico)))));
}

trafico.prototype.CalculaTraficoDiario(DataxHora){
    var maxIntentos=0;
    var prom=0;
    var horapick;
    var objCentral, objRuta, objFecha, objHora;
    for(var i=0;i<DataxHora.length;i++){
      objFecha=DataxHora[i];
      for(var j=0; j<objFecha.centrales.length;j++){
        objCentral=objFecha.centrales[j];
        for(var k=0; k<objCentral.rutas.length;k++){
          objRuta=objCentral.rutas[k];
          prom=0;
          maxIntentos = 0;
          horapick=null;
          for(var l=0; l<objRuta.horas.length;l++){
            objHora=objRuta.horas[l];
            prom+=objHora.data.int;
            if (maxIntentos<=objHora.data.int){
              horapick=objHora;
              maxIntentos=objHora.data.int;

            }
          }
          objRuta.stat.int.max=maxIntentos;
          objRuta.stat.int.prom=(prom/24).toFixed(2);
          if (objRuta.horas.length>0){
            objRuta.stat.int.prom1=(prom/objRuta.horas.length).toFixed(2);
          }else{
            objRuta.stat.int.prom1=0;
          }
          while(objRuta.horas.length>0){
            objRuta.horas.pop();
          }
          objRuta.horas.push(horapick);
        }
      }
    }
    this.dataDiaria=DataxHora;
  }

function trafico.prototype.getObjDataDiaria(){

    var objFecha, objCentral, objRuta;
    var data=[];
    for(var i=0; i<dataDiaria.length;i++){
      var dataCentral={};
      objFecha=dataDiaria[i];
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
}

function trafico.prototype.ValidaData: function(nombreArchivo, linea, central, ruta, ano, mes, dia, hora, dataTrafico){

    if ((ano<2000) || (ano>2100)){
      this.AgregaError(nombreArchivo, ": registro "+i +". El año no es válido. Año:" + ano);
      return false;
    }
    if ((mes<=0) || (mes >12)){
      this.AgregaError(nombreArchivo, ": registro "+i+". El mes no es válido. Mes:" + mes);
      return false;
    }
    if ((dia<=0) || (dia>31)){
      this.AgregaError(nombreArchivo, ": registro "+i+". El día no es válido. Día:" + dia);
      return false;
    }
    if ((hora<0) || (hora>23)){
      this.AgregaError(nombreArchivo, ": registro "+i+". La hora no es válida. Hora:" + hora);
      return false;
    }
    if (dataTrafico.cic1 < 0){
      this.AgregaError(nombreArchivo, ": registro "+i+". El valor circuitos1 es negativo:" + dataTrafico.cic1);
      return false;
    }
    if (dataTrafico.cic2 < 0){
      this.AgregaError(nombreArchivo, ": registro "+i+". El valor circuitos2 es negativo:" + dataTrafico.cic2);
      return false;
    }
    if (dataTrafico.int < 0){
      this.AgregaError(nombreArchivo, ": registro "+i+". El valor intentos es negativo:" + dataTrafico.int);
      return false;
    }
    if (dataTrafico.dbd < 0){
      this.AgregaError(nombreArchivo, ": registro "+i+". El valor desborde es negativo:" + dataTrafico.dbd);
      return false;
    }
    if (dataTrafico.n98 < 0){
      this.AgregaError(nombreArchivo, ": registro "+i+". El valor N99_98% es negativo:" + dataTrafico.n98);
      return false;
    }
    if (dataTrafico.con < 0){
      this.AgregaError(nombreArchivo, ": registro "+i+". El valor Connect es negativo:" + dataTrafico.con);
      return false;
    }
    if (dataTrafico.c70 < 0){
      this.AgregaError(nombreArchivo, ": registro "+i+". El valor C90_70% es negativo:" + dataTrafico.c70);
      return false;
    }
    if (dataTrafico.rsp < 0){
      this.AgregaError(nombreArchivo, ": registro "+i+". El valor Respuesta es negativo:" + dataTrafico.rsp);
      return false;
    }
    if (dataTrafico.totu < 0){
      this.AgregaError(nombreArchivo, ": registro "+i+". El valor Totu es negativo:" + dataTrafico.totu);
      return false;
    }
    if (dataTrafico.totue < 0){
      this.AgregaError(nombreArchivo, ": registro "+i+". El valor Totu E es negativo:" + dataTrafico.totue);
      return false;
    }
    if (dataTrafico.mbu < 0){
      this.AgregaError(nombreArchivo, ": registro "+i+". El valor MBU es negativo:" + dataTrafico.mbu);
      return false;
    }
    if (dataTrafico.sbu < 0){
      this.AgregaError(nombreArchivo, ": registro "+i+". El valor SBU es negativo:" + dataTrafico.sbu );
      return false;
    }
    if (dataTrafico.tru < 0){
      this.AgregaError(nombreArchivo, ": registro "+i+". El valor TRU es negativo:" + dataTrafico.tru );
      return false;
    }
    if (dataTrafico.coli < 0){
      this.AgregaError(nombreArchivo, ": registro "+i+". El valor Colisiones es negativo:" + dataTrafico.coli );
      return false;
    }
    if (dataTrafico.ocp < 0){
      this.AgregaError(nombreArchivo, ": registro "+i+". El valor Ocupacion es negativo:" + dataTrafico.ocp );
      return false;
    }
    return true;
}

function trafico.prototype.AgregaError(msgError){
  arrErrores.push(this.filename + ":" + msgError);
}

function trafico.prototype.AgregaWarning(msgWarning){
  arrWarnings.push(this.filename + ":" + msgWarning);
}

function trafico.prototype.getObjRuta(ruta, objHora){
  var objRuta = {ruta: ruta, horas:[], stat:getObjEstadistica()};
  objRuta.horas.push(objHora);
  return objRuta;
}

function trafico.prototype.getObjCentral(central, objRuta){
  var objCentral = {central:central, rutas:[]};
  objCentral.rutas.push(objRuta);
  return objCentral;
}

function trafico.prototype.getObjFecha(fecha, objCentral){
  var objFecha={fecha:fecha, centrales:[] }
  objFecha.centrales.push(objCentral);
  return objFecha;
}

function trafico.prototype.getObjEstadistica(){
  var objIntentos={max:0, prom:0, prom1:0};
  var objASR={max:0, prom:0, prom1:0};
  var objEstadistica={int:objIntentos, asr:objASR}
  return objEstadistica;
}

function trafico.prototype.getNumber(strData){
  var strAux=strData.split(",");
  if (strAux.length<2){
    return Number(strData);
  }
  if (strAux[1].length == 1){
    return Number(strAux[0])+Number(strAux[1]/10);
  }
  return Number(strAux[0])+Number(strAux[1].slice(0,2))/100;
}
