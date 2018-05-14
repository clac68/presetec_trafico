function VentanaDatosTraficoDiario(contenedor,centrales, rutas, traficoMensual, traficoDiario, erlangs){
  this.contenedor=contenedor;
  while(this.contenedor.firstChild){
    this.contenedor.removeChild(this.contenedor.firstChild);
  }

  this.centrales=centrales;
  this.rutas=rutas;
  this.traficoMensual=traficoMensual;
  this.traficoDiario=traficoDiario
  this.erlangs=erlangs;
  this.contInput=document.createElement('div');
  this.contInput.setAttribute('class', 'ventana_datos_trafico_diario');
  this.contOpciones=document.createElement('div');
  this.contOutput=document.createElement('div');
  this.contOutput.setAttribute('class', 'ventana_datos_trafico_diario');
  this.contOutput.overflow='auto';
  this.contenedor.appendChild(this.contInput);
  this.contenedor.appendChild(this.contOpciones);
  this.contenedor.appendChild(this.contOutput);
  this.initInput();
  this.initOutput();
  this.initData();
}
VentanaDatosTraficoDiario.prototype.initInput=function(){
  var label = document.createElement('label');
  label.innerHTML='Tipo de Troncal';
  this.cbTipoRuta = document.createElement('select');
  label.appendChild(this.cbTipoRuta);
  this.contInput.appendChild(label);

  label = document.createElement('label');
  label.innerHTML='Central';
  this.cbCentrales = document.createElement('select');
  label.appendChild(this.cbCentrales);
  this.contInput.appendChild(label);

  label = document.createElement('label');
  label.innerHTML='Ruta';
  this.cbRutas = document.createElement('select');
  label.appendChild(this.cbRutas);
  this.contInput.appendChild(label);
  this.initOptions();
};
VentanaDatosTraficoDiario.prototype.initOptions=function(){
  var dis=this;
  this.rb={};
  this.rb['tDiario']=AddRadioButton(this.contOpciones, 'opciones_ventana_datos_trafico', '', 'Tráfico Diario');
  this.rb['tDiario'].onchange=function(){
    dis.showTable('DATOS1');
  };
  this.rb['t3Meses']=AddRadioButton(this.contOpciones, 'opciones_ventana_datos_trafico', '', 'Tráfico 3 meses');
  this.rb['t3Meses'].onchange=function(){
    dis.showTable('DATOS2');
  };
  this.rb['tMes']=AddRadioButton(this.contOpciones, 'opciones_ventana_datos_trafico', '', 'Tráfico del mes');
  this.rb['tMes'].onchange=function(){
    dis.showTable('DATOS3');
  };

};
VentanaDatosTraficoDiario.prototype.initOutput=function(){
  this.tabla= new Tabla(this.contOutput);
  this.tabla.Delete();
};

VentanaDatosTraficoDiario.prototype.initData=function(){
  this.dataCentralesRutas=this.rutas.getCentralesyRutasXTipo();
  this.initcbTipoRuta();
  this.initcbCentrales();
  this.initcbRutas();
  LimpiaComboBox(this.cbTipoRuta);
  for(var tipoRuta in this.dataCentralesRutas){
    AddOption2Cb(this.cbTipoRuta, tipoRuta,'', tipoRuta);
  }
  if(this.cbTipoRuta.options.length>0){
    this.cbTipoRuta.value=this.cbTipoRuta.options[0].value;
    this.cbTipoRuta.onchange();
  }
};
VentanaDatosTraficoDiario.prototype.initcbTipoRuta=function(){
  var dis=this;
  this.cbTipoRuta.onchange=function(){
    LimpiaComboBox(dis.cbCentrales);
    if(dis.cbTipoRuta.selectedIndex < 0){
      return;
    }
    var tipoRuta=dis.cbTipoRuta.options[dis.cbTipoRuta.selectedIndex].value;
    if(typeof dis.dataCentralesRutas[tipoRuta]=='undefined'){
      console.error('Error de programación. No se encontró el tipo de ruta '+tipoRuta );
      return;
    }
    dis.dataSelected = dis.dataCentralesRutas[tipoRuta];
    AddOption2Cb(dis.cbCentrales, 'TODAS','', 'TODAS');
    for(var central in dis.dataSelected){
      if(typeof dis.centrales.centrales[central] != 'undefined'){
        AddOption2Cb(dis.cbCentrales, central,'', dis.centrales.centrales[central].nombre);
      }else{
        console.error('No fue posible encontrar la central para el código '+central);
        console.error(dis.centrales);
      }
    }
    dis.cbCentrales.value='TODAS';
    dis.cbCentrales.onchange();
  };
};

VentanaDatosTraficoDiario.prototype.initcbCentrales=function(){
  var dis=this;
  this.cbCentrales.onchange=function(){
    LimpiaComboBox(dis.cbRutas);
    if(dis.cbCentrales.selectedIndex<0){
      return;
    }
    var centralSelected=dis.cbCentrales.options[dis.cbCentrales.selectedIndex].value;
    AddOption2Cb(dis.cbRutas, 'TODAS','','TODAS');
    if(centralSelected!='TODAS'){
      if(typeof dis.dataSelected[centralSelected]!='undefined'){
        if(typeof dis.centrales.centrales[centralSelected]!='undefined'){
          var objCentral=dis.centrales.centrales[centralSelected];
          for(var ruta in dis.dataSelected[centralSelected]){
            var strRuta=objCentral.shortname + '-'+ruta;
            AddOption2Cb(dis.cbRutas, strRuta,'',strRuta);
          }
        }else{
          console.error('No fue posible obtener la central '+ centralSelected+' dentro del listado de centrales');
          console.error(dis.centrales.centrales);
        }
      }else{
        console.error('No fue posible encontrar la central seleccionada '+ centralSelected);
        console.error(dis.dataSelected);
      }
    }else{
      for(var central in dis.dataSelected){
        if(typeof dis.centrales.centrales[central]!='undefined'){
          var objCentral=dis.centrales.centrales[central];
          for(var ruta in dis.dataSelected[central]){
            var strRuta=objCentral.shortname + '-'+ruta;
            AddOption2Cb(dis.cbRutas, strRuta,'',strRuta);
          }
        }else{
          console.error('No fue posible obtener la central '+ centralSelected+' dentro del listado de centrales');
          console.error(dis.centrales.centrales);
        }
      }
    }
    dis.cbRutas.value='TODAS';
    dis.cbRutas.onchange();
  };
};
VentanaDatosTraficoDiario.prototype.showTable=function(reporte){
  this.tabla.Delete();
  this.dataTabla=this.getDataTabla(reporte);
  if(this.dataTabla!='undefined'){
    this.tabla.putTitulo(this.dataTabla.titulo);
  }else{
    console.error('No se encontraron los datos necesarios para lenar tabla.');
    return;
  }
  if(this.cbRutas.selectedIndex<0){
    return;
  }
  var rutaSelected=this.cbRutas.options[this.cbRutas.selectedIndex].value;
  if(rutaSelected!='TODAS'){
    this.setDataReporte(reporte, rutaSelected);
  }else{
    for(var i=0; i<this.cbRutas.options.length;i++){
      var ruta=this.cbRutas.options[i];
      if(ruta.value != 'TODAS'){
        this.setDataReporte(reporte, ruta.value);
      }
    }
  }
};
VentanaDatosTraficoDiario.prototype.initcbRutas=function(){
  var dis=this;
  this.cbRutas.onchange=function(){
    dis.rb['tDiario'].checked=true;
    dis.rb['tDiario'].onchange();
  };
};
VentanaDatosTraficoDiario.prototype.getDataTabla=function(reporte){
  var dataTabla={titulo:{}, data:{}};
  switch (reporte) {
    case 'DATOS1':
      if(typeof this.tabla != 'undefined'){
        this.tabla.enableMenu('Datos1');
      }
      return this.getDataYTituloReporte1();
    case 'DATOS3':
      if(typeof this.tabla != 'undefined'){
        this.tabla.enableMenu('Datos3');
      }
      return this.getDataYTituloReporte2Y3();
      break;
    case'DATOS2':
      if(typeof this.tabla != 'undefined'){
        this.tabla.enableMenu('Datos2');
      }
      return this.getDataYTituloReporte2Y3();
      break;
    default:
  }
};
VentanaDatosTraficoDiario.prototype.getDataYTituloReporte1=function(){
  var objTitulo={};
  var objData={};
  objTitulo={fecha:'FECHA', hhmm:'HHMM', dia:'DIA', hora: 'HORA', central:'CENTRAL', troncal:'TRONCAL',
      nemo:'NEMO', class:'CLASS', tipo:'TIPO', sign:'SIGN', zona:'ZONA', circ:'CTOS', circ_e:'CTOS_E',
      intentos: 'INTENTOS', desbordes:'DESBORDES', conectados:'CONECTADOS', respuesta:'RESPUESTA',
      totu: 'TOTU', totu_e: 'TOTU_E', ocup:'Ocupación_Troncal(%)', asr:'ASR(%)'};

  objData={fecha:'S/F', hhmm:'', dia:'', hora:'', central:'', troncal:'',
      nemo:'', class:'', tipo:'', sign:'', zona:'', circ:'0', circ_e:'0',
      intentos: '0', desbordes:'0', conectados:'0', respuesta:'0',
      totu: '0', totu_e: '0', ocup:'0', asr:'0'};
  return {titulo:objTitulo, data:objData};
};
VentanaDatosTraficoDiario.prototype.getDataYTituloReporte2Y3=function(){
  var objTitulo={};
  var objData={};
  objTitulo={fecha:'FECHA', sitio:'SITIO', nemo:'TRKNEMO', troncal:'TRONCAL', clase:'CLASS', mindate:'MINDATE',
      maxdate:'MAXDATE', difdate:'DIFDATE', circ:'CTOS', circ_e:'CTOS_E', e1s: 'E1s', totue:'TOTU_E_MED',
      ocup:'OCUP_MED', asr:'ASR_MED', zona:'ZONA', area: 'AREA', tdm:'TDM_SIP', cia:'COMPAÑÍA', central:'CENTRAL',
      nivel_ocup: 'OCUPACIÓN'};

  objData={fecha:'S/F', sitio:'', nemo:'', troncal:'', clase:'', mindate:'',
      maxdate:'', difdate:'', circ:'0', circ_e:'0', e1s: '0', totue:'0',
      ocup:'0', asr:'0', zona:'', area: '', tdm:'', cia:'', central:'',
      nivel_ocup: 0};
  return {titulo:objTitulo, data:objData};
}
VentanaDatosTraficoDiario.prototype.setDataReporte=function(reporte, ruta){
  switch (reporte) {
    case 'DATOS1':
      var objDatos=this.getData1(ruta, this.traficoDiario);
      if(typeof objDatos!='undefined'){
        for(var dia in objDatos){
          this.tabla.putData(objDatos[dia], this.dataTabla.titulo);
        }
      }else{
        //console.error('No se incluyó la ruta:'+ruta);
      }
      break;
    case 'DATOS3':
      var objData=this.getData3(ruta, this.traficoMensual.mesActual);
      if(typeof objData!='undefined'){
        this.tabla.putData(objData, this.dataTabla.titulo);
      }else{
        console.error('No se incluyó la ruta:'+ruta);
      }
      break;
    case 'DATOS2':
      if(typeof this.traficoMensual.mesActual == 'undefined'){
        console.error('No encontré los datos del tráfico mensual');
        return;
      }
      if(typeof this.traficoMensual.mes_1 == 'undefined'){
        console.error('No encontré los datos del tráfico mensual anterior');
        return;
      }
      if(typeof this.traficoMensual.mes_2 == 'undefined'){
        console.error('No encontré los datos del tráfico mensual de hace 2 meses');
        return;
      }
      var objData=this.getData3(ruta, this.traficoMensual.mesActual);
      this.tabla.putData(objData, this.dataTabla.titulo);
      objData=this.getData3(ruta, this.traficoMensual.mes_1);
      this.tabla.putData(objData, this.dataTabla.titulo);
      objData=this.getData3(ruta, this.traficoMensual.mes_2);
      this.tabla.putData(objData, this.dataTabla.titulo);
      break;
    default:
  }
};
VentanaDatosTraficoDiario.prototype.getData1=function(ruta, TraficoDiario){
  var arrRuta=ruta.split('-');
  var objDatos={};
  for(var fechaReporte in TraficoDiario.dataDiaria){};
  var arrFechaReporte=fechaReporte.split('-');
  var central=this.centrales.getCentralFromShortName(arrRuta[0]);
  var objRuta=this.rutas.dataRutas[fechaReporte][central][arrRuta[1]];
  var objRutaTrafico=TraficoDiario.getObjetoRuta(fechaReporte, central, arrRuta[1]);
  if(typeof objRutaTrafico=='undefined'){
    return;
  }
  //console.log(objRuta);
  for(var dia in objRutaTrafico){
    var objDia=objRutaTrafico[dia];
    var objData=Object.assign({}, this.dataTabla.data)
    objData.fecha=dia+'-'+arrFechaReporte[1]+'-'+arrFechaReporte[0];
    objData.hhmm=objDia.data.h+':00';
    objData.dia='D'+dia;
    objData.hora='H'+objDia.data.h;
    objData.central=central;
    objData.troncal=arrRuta[1];
    objData.nemo=arrRuta[1].substring(0,4);
    objData.class=this.cbTipoRuta.value;
    objData.tipo=objRuta.tipo;
    objData.sign=objRuta.sen;
    objData.zona=objRuta.cod;
    objData.circ=objDia.data.cic;
    objData.circ_e=this.erlangs.CalculaErlang(objDia.data.cic);
    objData.intentos=objDia.data.int;
    objData.desbordes=objDia.data.dbd;
    objData.conectados=objDia.data.con;
    objData.respuesta=objDia.data.rsp;
    objData.totu=objDia.data.totu;
    objData.totu_e=(objDia.data.totu/36).toFixed(2);
    objData.ocup=objDia.data.ocup;
    objData.asr=objDia.data.asr;
    objDatos[dia]=objData;
  }
  return objDatos;
};
VentanaDatosTraficoDiario.prototype.getData3=function(ruta, objTraficoMensual){
  var arrRuta=ruta.split('-');
  var objData=Object.assign({}, this.dataTabla.data)
  for(var fechaReporte in this.rutas.dataRutas){};
  for(var fecha in objTraficoMensual.DataMensual){};
  var central=this.centrales.getCentralFromShortName(arrRuta[0]);
  var objRuta=this.rutas.dataRutas[fechaReporte][central][arrRuta[1]];
  var objrutaTrafico=this.getRutaTrafico(objTraficoMensual, fecha, central, arrRuta[1]);

  objData.fecha=fecha;
  objData.sitio=arrRuta[0];
  objData.nemo=arrRuta[1].substring(0, 6);
  objData.troncal=ruta;
  objData.clase=this.cbTipoRuta.options[this.cbTipoRuta.selectedIndex].value
  var arrFecha=fecha.split('-');
  var arrFechaReporte=fechaReporte.split('-');
  objData.mindate='01-'+arrFecha[1]+'-'+arrFecha[0];
  var diasMes=getDiasDelMes(arrFecha[0], arrFecha[1]);
  objData.maxdate=diasMes+'-'+arrFecha[1]+'-'+arrFecha[0];
  objData.difdate=diasMes;
  if(typeof objRuta == 'undefined'){
    console.log('No se encontró la ruta '+arrRuta[1]+' de la central '+central+' con fecha ' +fecha);
    return objData;
  }
  if(typeof objrutaTrafico == 'undefined'){
    //console.log('No se encontró tráfico mensual para la ruta '+arrRuta[1]+' de la central '+central+' con fecha ' +fecha);
    //console.log(this.traficoMensual);
    return objData;
  }
  objData.circ=objrutaTrafico.data.cic;
  objData.circ_e=this.erlangs.CalculaErlang(objrutaTrafico.data.cic);
  var e1s=Math.trunc(objRuta.circ/31);
  if (e1s*31 < objRuta.circ){
    e1s++;
  }
  objData.e1s=e1s;
  objData.totue=objrutaTrafico.data.totue;
  objData.ocup=objrutaTrafico.stat.ocup.prom;
  objData.asr=objrutaTrafico.stat.asr.prom;
  objData.zona=objRuta.area;
  objData.area=objRuta.cod;
  objData.tdm=objRuta.sen;
  objData.cia=objRuta.nem;
  objData.central=this.centrales.centrales[central].nombre;
  objData.nivel_ocup=this.getNivelOcupacion(objrutaTrafico);
  return objData;
};
VentanaDatosTraficoDiario.prototype.getNivelOcupacion=function(objrutaTrafico){
  if(objrutaTrafico.stat.ocup.prom <= 0){
    return 'SIN_TRAFICO';
  }
  if(objrutaTrafico.stat.ocup.prom < 60){
    return 'MENOR_A_60';
  }
  if(objrutaTrafico.stat.ocup.prom < 80){
    return 'ENTRE_60_80';
  }

  if(objrutaTrafico.stat.ocup.prom <= 100){
    return 'ENTRE_80_100';
  }
  return 'MAYOR_100';
};
VentanaDatosTraficoDiario.prototype.getRutaTrafico=function(objTraficoMensual, fecha, central, ruta){
  if(typeof objTraficoMensual.DataMensual=='undefined'){
    return;
  }
  if(typeof objTraficoMensual.DataMensual[fecha]=='undefined'){
    return;
  }
  if(typeof objTraficoMensual.DataMensual[fecha][central]=='undefined'){
    return;
  }
  if(typeof objTraficoMensual.DataMensual[fecha][central][ruta]=='undefined'){
    return;
  }
  return objTraficoMensual.DataMensual[fecha][central][ruta];
};
