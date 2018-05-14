'use strict'
function ReporteMensual(bd, config){
  'use strict'
  this.bd=bd;
  //this.fsFecha=config.fsFecha;
  this.Fecha=config.Fecha;
  //this.fsNemos=config.fsNemos;
  this.cbNemos=config.cbNemos;
  //this.fsAreas=config.fsAreas;
  this.cbAreas=config.cbAreas;
  //this.fsZonas=config.fsZonas;
  this.cbSenalizacion=config.cbSenalizacion;
  this.cbZonas=config.cbZonas;
  //this.fsTipoTroncal=config.fsTipoTroncal;
  this.cbTipoTroncal=config.cbTipoTroncal;
  //this.fsCentrales=config.fsCentrales;
  this.cbCentrales=config.cbCentrales;
  //this.fsRutas=config.fsRutas;
  this.cbRutas=config.cbRutas;

  this.contSeleccion=config.contSeleccion;

  this.fsOpcionesGrafico=config.fsOpcionesGrafico;
  this.rbIntentos=config.rbIntentos;
  this.rbOcupacion=config.rbOcupacion;
  this.rbNivelesOcupacion=config.rbNivelesOcupacion
  this.rbAsr=config.rbAsr;


  //checkbox de carga
  this.checkboxCentrales=config.checkboxCentrales;
  this.checkboxErlangs=config.checkboxErlangs;
  this.checkboxNemos=config.checkboxNemos;
  this.checkboxRutas=config.checkboxRutas;
  this.checkboxRutas_1=config.checkboxRutas_1;
  this.checkboxEstadisticas=config.checkboxEstadisticas;
  this.checkboxEstadisticas_1=config.checkboxEstadisticas_1;
  this.checkboxEstadisticas_2=config.checkboxEstadisticas_2;
  this.checkboxDatosDiario=config.checkboxDatosDiario;

  //*************contenedores de elementos del sistema*********

  //Contenedores Principales
  this.contenedorTrafico=config.contenedorTrafico;
  this.contenedorBienvenida=config.contenedorBienvenida;
  this.contenedorCargaDatos=config.contenedorCargaDatos;

  //Contenedores secundarios de contenedor de tráfico
  this.contenedorGraficoDiario=config.contenedorGraficoDiario;//siempre habilitado
  this.contenedorMenu=config.contenedorMenu; //siempre habilitado
  this.contenedorGraficos=config.contenedorGraficos;
  this.contenedorTraficoDiario=config.contenedorTraficoDiario;
  this.contenedorRutas=config.contenedorRutas;
  this.contenedorPuntosCodigo=config.contenedorPuntosCodigo;
  this.contenedorAyuda=config.contenedorAyuda;

  //contenedores dentro de contenedor de gráfico
  this.contTablaDatosMensual=config.contTablaDatosMensual;
  this.cvGraf1=config.cvGraf1;
  this.cvGraf2=config.cvGraf2;
  this.cvGraf3=config.cvGraf3;
  this.cvGraf4=config.cvGraf4;



  this.EstadisticaMensual=new TraficoMensual(bd);
  this.EstadisticaMensual_1=new TraficoMensual(bd);
  this.EstadisticaMensual_2=new TraficoMensual(bd);
  this.Centrales=new Centrales(bd);
  this.Nemos=new Nemos(bd);
  this.Rutas=new Rutas(bd);
  this.Rutas_1=new Rutas(bd);
  this.Erlangs=new Erlangs(bd);
  this.RutasSeleccionadas={};
  this.traficoDiario=new TraficoDiario(bd);
  this.init();
}

ReporteMensual.prototype.initFecha=function(){
  var dis=this;
  this.Fecha.onchange=function(){
    dis.checkboxRutas.checked=false;
    dis.checkboxRutas_1.checked=false;
    dis.checkboxEstadisticas.checked=false;
    dis.checkboxEstadisticas_1.checked=false;
    dis.checkboxEstadisticas_2.checked=false;
    dis.checkboxDatosDiario.checked=false;
    dis.displayVentanaCargaDatos();
    var fecha=dis.getFecha();
    var fecha_1=new Date(fecha.ano, fecha.mes-2, 1);
    var fecha_2=new Date(fecha.ano, fecha.mes-3, 1);

    dis.Rutas=dis.getRutas(fecha.ano, fecha.mes, dis.checkboxRutas);
    dis.Rutas_1=dis.getRutas(fecha_1.getFullYear(), fecha_1.getMonth()+1, dis.checkboxRutas_1);
    dis.EstadisticaMensual=dis.getEstadisticaMensual(fecha.ano, fecha.mes, dis.checkboxEstadisticas);
    dis.EstadisticaMensual_1=dis.getEstadisticaMensual(fecha_1.getFullYear(), fecha_1.getMonth()+1, dis.checkboxEstadisticas_1);
    dis.EstadisticaMensual_2=dis.getEstadisticaMensual(fecha_2.getFullYear(), fecha_2.getMonth()+1, dis.checkboxEstadisticas_2);
    dis.EstadisticaDiaria=dis.getEstadisticaDiaria(fecha.ano, fecha.mes, dis.checkboxDatosDiario);
  };
};
ReporteMensual.prototype.getEstadisticaDiaria=function(ano, mes, checkbox){
  var dis=this;
  var estadistica=new TraficoDiario(this.bd);
  estadistica.getDataMesFromBD(ano, mes, function(){
    checkbox.checked=true;
    dis.ventanaCarga.show();
  },function(e){
    console.log('getEstadisticaDiaria:ERROR: fecha:'+ano+'-'+mes);
    console.log(e);
    dis.SendMsg2User('No pude rescatar las estadísticas diarias de la fecha '+ano+"-"+mes+'. Por favor, reintenta más tarde');
  });
  return estadistica;
};

ReporteMensual.prototype.getEstadisticaMensual=function(ano, mes, checkbox){
  var dis=this;
  var estadistica=new TraficoMensual(this.bd);
  estadistica.getDataMensualFromBD(ano, mes, function(){
    checkbox.checked=true;
    dis.ventanaCarga.show();
  }, function(e){
    console.log('getEstadisticaMensual:ERROR: fecha:'+ano+'-'+mes);
    console.log(e);
    dis.SendMsg2User('No pude rescatar las estadísticas de la fecha '+ano+"-"+mes+'. Por favor, reintenta más tarde');
  });
  return estadistica;
};

ReporteMensual.prototype.getRutas=function(ano, mes, checkbox){
  var dis=this;
  var rutas=new Rutas(bd);
  rutas.getDataFromBD(ano, mes, function(){
    checkbox.checked=true;
    dis.ventanaCarga.show();
  }, function(e){
    console.log('getRutas:ERROR: fecha:'+ano+'-'+mes);
    console.log(e);
    dis.SendMsg2User('No pude obtener las rutas desde la Base de Datos. Por favor, intenta más tarde');
  })
  return rutas;
};
ReporteMensual.prototype.initcbBase=function(cb){
  var dis=this;
  cb.onchange=function(){
    dis.ShowDataSelected();
  };
};
ReporteMensual.prototype.ShowDataSelected=function(){
  var parametros=this.getParametrosDeRutasSeleccionadas();
  if(typeof parametros=='undefined'){
    console.log("ERROR: Parámetros indefinido");
    return;
  }
  switch (parametros.tipo) {
    case "EXTERNAS":
      this.RutasSeleccionadas=this.getRutasTipo(parametros, {c:'C', l:'L', p:'P'});
      break;
    case "INTERNAS":
      this.RutasSeleccionadas=this.getRutasTipo(parametros, {x:'X', i:'I'});
      break;
    case 'TANDEM':
      parametros.tipo='T';
      this.RutasSeleccionadas=this.Rutas.getRutasConParametros(parametros);
      break;
    default:
      this.RutasSeleccionadas=this.Rutas.getRutasConParametros(parametros);
      break;
  }

  LimpiaComboBox(this.cbCentrales);
  AddOption2Cb(this.cbCentrales, "TODAS","", "TODAS");
  for(var fecha in this.RutasSeleccionadas){
    for(var central in this.RutasSeleccionadas[fecha]){
      AddOption2Cb(this.cbCentrales, central,"", this.Centrales.centrales[central].nombre);
    }
  }
  this.cbCentrales.value="TODAS";
  this.cbCentrales.onchange();
};
ReporteMensual.prototype.getRutasTipo=function(parametros, tipos){
  var res={};
  for(var tipo in tipos){
    parametros.tipo=tipos[tipo];
    res[tipo]=this.Rutas.getRutasConParametros(parametros);
  }
  var data=this.AddRutas(res);

  return data;
};
ReporteMensual.prototype.AddRutas=function(res){
  var result={};
  for(var data in res){
    for(var fecha in res[data]){
      if(typeof result[fecha]=='undefined'){
        result[fecha]={};
      }
      for(var central in res[data][fecha]){
        if(typeof result[fecha][central]=='undefined'){
          result[fecha][central]={};
        }
        for(var ruta in res[data][fecha][central]){
          if(typeof result[fecha][central][ruta]=='undefined'){
            result[fecha][central][ruta]={};
          }
        }
      }
    }
  }
  return result;
};
ReporteMensual.prototype.getParametrosDeRutasSeleccionadas=function(){
  var parametros={};
  if(this.cbNemos.selectedIndex<0){
    return;
  }
  var nemo=this.cbNemos.options[this.cbNemos.selectedIndex].value;
  if(nemo != 'TODOS'){
    parametros.nem=nemo;
  }

  if(this.cbAreas.selectedIndex<0){
    return;
  }
  var area=this.cbAreas.options[this.cbAreas.selectedIndex].value;
  if(area != 'TODAS'){
    parametros.area=area;
  }

  if(this.cbZonas.selectedIndex<0){
    return;
  }
  var zona=this.cbZonas.options[this.cbZonas.selectedIndex].value;
  if(zona != 'TODAS'){
    parametros.cod=zona;
  }
  if(this.cbTipoTroncal.selectedIndex<0){
    return;
  }
  var tipo=this.cbTipoTroncal.options[this.cbTipoTroncal.selectedIndex].value;
  if(tipo != 'TODOS'){
    parametros.tipo=tipo;
  }
  if(this.cbSenalizacion.selectedIndex<0){
    return;
  }
  var sen=this.cbSenalizacion.options[this.cbSenalizacion.selectedIndex].value;
  if(sen !='TODAS'){
    parametros.sen=sen;
  }
  return parametros;
};


ReporteMensual.prototype.getNewRutaSeleccionada=function(fecha, central, ruta){
  if (typeof this.RutasSeleccionadas[fecha]=='undefined'){
    this.RutasSeleccionadas[fecha]={};
  }
  if (typeof this.RutasSeleccionadas[fecha][central]=='undefined'){
    this.RutasSeleccionadas[fecha][central]={};
  }
  if(typeof this.RutasSeleccionadas[fecha][central][ruta]=='undefined'){
    this.RutasSeleccionadas[fecha][central][ruta]={};
  }
};
ReporteMensual.prototype.initcbCentrales=function(){
  var dis=this;
  this.cbCentrales.onchange=function(){
    if(dis.cbCentrales.selectedIndex<0){
      return;
    }
    var centralSeleccionada=dis.cbCentrales.options[dis.cbCentrales.selectedIndex].value;
    LimpiaComboBox(dis.cbRutas);
    AddOption2Cb(dis.cbRutas, "TODAS", "", "TODAS");
    var objFecha=dis.getFecha();
    var fecha=objFecha.ano+"-"+objFecha.mes;
    if (centralSeleccionada=="TODAS"){
      for(var central in dis.RutasSeleccionadas[fecha]){
        for(var ruta in dis.RutasSeleccionadas[fecha][central]){
          var nombre=dis.Centrales.centrales[central].shortname+"-"+ruta;
          var objRuta=dis.Rutas.dataRutas[fecha][central][ruta];
          var info='central:'+central+'-Nemo:'+objRuta.nem+'-Señalización:'+objRuta.sen
          +"-área:"+objRuta.area+"-zona:"+objRuta.cod+"-info:"+objRuta.inf;
          AddOption2Cb(dis.cbRutas, nombre, info, nombre);
        }
      }
    }else{
      for(ruta in dis.RutasSeleccionadas[fecha][centralSeleccionada]){
        var nombre=dis.Centrales.centrales[centralSeleccionada].shortname+"-"+ruta;
        var objRuta=dis.Rutas.dataRutas[fecha][centralSeleccionada][ruta];
        var info='central:'+central+'-Nemo:'+objRuta.nem+'-Señalización:'+objRuta.sen
        +"-área:"+objRuta.area+"-zona:"+objRuta.cod+"-info:"+objRuta.inf;
        AddOption2Cb(dis.cbRutas, nombre, "central:" + central+"-Ruta:"+ruta, nombre);
      }
    }
    dis.cbRutas.value="TODAS";
    dis.cbRutas.onchange();
  };
};

ReporteMensual.prototype.CalculaRutasSeleccionadas=function(){
  this.rutasSeleccionadas={};
  var count=0;
  for(var i=0; i<this.cbRutas.options.length;i++){
    if(this.cbRutas.options[i].selected){
      count++;
      this.rutasSeleccionadas[this.cbRutas.options[i].value]=1;
    }
  }
  if (count >0){
    this.SeleccionaRutasAGraficar(this.rutasSeleccionadas);
    this.rbOcupacion.checked=true;
    this.rbOcupacion.onchange();
  }
};

ReporteMensual.prototype.initcbRutas=function(){
  var dis=this;
  this.cbRutas.onchange=function(){

    dis.menu.click();
  };
};

ReporteMensual.prototype.SeleccionaRutasAGraficar=function(rutas){

  var todas=false;
  for(var ruta in rutas){
    if (ruta=='TODAS'){
      todas=true;
    }
  }
  var arrData=[];
  var fechas=this.getArrFechas3meses();
  var arrLabels=fechas;
  var NivelOcupacion={};
  if(todas){
    for(var i=0; i<this.cbRutas.options.length;i++){
      var opcion=this.cbRutas.options[i].value;
      if(opcion!='TODAS'){
        var arrOpcion=opcion.split('-');
        var central=this.getCentralFromShortName(arrOpcion[0]);
        arrData.push([opcion,this.getArrData(fechas, central, arrOpcion[1])]);
        this.ActualizaNivelOcupacion(NivelOcupacion,fechas, central, arrOpcion[1], opcion);
      }
    }
  }else{
    for(var ruta in rutas){
      var arrOpcion=ruta.split("-");
      var central=this.getCentralFromShortName(arrOpcion[0]);
      arrData.push([ruta,this.getArrData(fechas, central, arrOpcion[1])]);
      this.ActualizaNivelOcupacion(NivelOcupacion,fechas, central, arrOpcion[1], ruta);
    }
  }
  this.dataSelected={labels:arrLabels, data:arrData, nivelOcup:NivelOcupacion};

};
ReporteMensual.prototype.ActualizaNivelOcupacion=function(nivelOcupacion, fechas, central, ruta, troncal){
  if (typeof nivelOcupacion.labels == 'undefined'){
    nivelOcupacion.labels={nivel0:'0', nivel20:'0,1-20', nivel40:'20-40', nivel60:'40-60', nivel80:'60-80', nivel100:'80-100', nivelSobre100:'>100'};
    nivelOcupacion.data={};
  }
  for(var i=0; i<fechas.length;i++ ){
    if(typeof nivelOcupacion.data[fechas[i]]=='undefined'){
      nivelOcupacion.data[fechas[i]]={nivel0:[], nivel20:[], nivel40:[], nivel60:[], nivel80:[], nivel100:[], nivelSobre100:[]};
    }
    if(i==0){
      var EstadisticaMensual=this.EstadisticaMensual;
    }else if(i==1){
      var EstadisticaMensual=this.EstadisticaMensual_1;
    }else{
      var EstadisticaMensual=this.EstadisticaMensual_2;
    }
    if((typeof EstadisticaMensual.DataMensual[fechas[i]] == 'undefined')||
      (typeof EstadisticaMensual.DataMensual[fechas[i]][central] == 'undefined')||
      (typeof EstadisticaMensual.DataMensual[fechas[i]][central][ruta] == 'undefined')){

    }else{
      var objRuta=EstadisticaMensual.DataMensual[fechas[i]][central][ruta];
      if (objRuta.stat.ocup.prom >100){
        nivelOcupacion.data[fechas[i]].nivelSobre100.push({central:central, ruta:ruta, troncal:troncal});
      }else if(objRuta.stat.ocup.prom >=80){
        nivelOcupacion.data[fechas[i]].nivel100.push({central:central, ruta:ruta, troncal:troncal});
      }else if (objRuta.stat.ocup.prom >=60) {
        nivelOcupacion.data[fechas[i]].nivel80.push({central:central, ruta:ruta, troncal:troncal});
      }else if (objRuta.stat.ocup.prom >=40) {
        nivelOcupacion.data[fechas[i]].nivel60.push({central:central, ruta:ruta, troncal:troncal});
      }else if (objRuta.stat.ocup.prom >20) {
        nivelOcupacion.data[fechas[i]].nivel40.push({central:central, ruta:ruta, troncal:troncal});
      }else if (objRuta.stat.ocup.prom >0) {
        nivelOcupacion.data[fechas[i]].nivel20.push({central:central, ruta:ruta, troncal:troncal});
      }else if (objRuta.stat.ocup.prom<=0) {
        nivelOcupacion.data[fechas[i]].nivel0.push({central:central, ruta:ruta, troncal:troncal});
      }
    }
  }
};
ReporteMensual.prototype.GraficaRutasSeleccionadas=function( parametro, ascendente){
  var dis=this;
  var fechas=this.getArrFechas3meses();
  var graficos = this.getGraficosIntOcupAsr(parametro);

  if(parametro!='nivel_ocupacion'){
    if(ascendente){
      this.dataSelected.data.sort(function(a, b){ return (b[1][parametro][fechas[0]]-a[1][parametro][fechas[0]])});
    }else{
      this.dataSelected.data.sort(function(a, b){ return (a[1][parametro][fechas[0]] -b[1][parametro][fechas[0]])});
    }
  }

  for(var param in graficos){
    if(param!='nivel_ocupacion'){
      var dataMenu={'Ver Gráfico Diario':1};
      graficos[param].setMenu(dataMenu, function(res){
        dis.ProcesaMenuGrafico(res);
      });
      var labels=[];
      var data={};
      for(var i=0;i< this.dataSelected.data.length;i++){
        for(var fecha in this.dataSelected.data[i][1][param]){
          if(typeof data[fecha]=='undefined'){
            data[fecha]=[];
          }
          data[fecha].push(this.dataSelected.data[i][1][param][fecha]);
        }
        labels.push(this.dataSelected.data[i][0]);
      }
      for(var fecha in data){
        graficos[param].AddData(data[fecha], fecha, '');
      }
      graficos[param].AddLabels(labels);
      graficos[param].IniciaGrafico();
    }else{
      var dataMenu={'Ver Ocupación de Troncales':1};
      graficos[param].setMenu(dataMenu, function(res){
        dis.ProcesaMenuNivelOcupación(res);
      });
      for(var fecha in this.dataSelected.nivelOcup.data){
        var dataOcup=[];
        for(var param in this.dataSelected.nivelOcup.labels){
          if(typeof this.dataSelected.nivelOcup.data[fecha][param]!='undefined'){
            dataOcup.push(this.dataSelected.nivelOcup.data[fecha][param].length);
          }
        }
        graficos.nivel_ocupacion.AddData(dataOcup, fecha, '');
      }
      var labels=[];
      for(var param in this.dataSelected.nivelOcup.labels){
        labels.push(this.dataSelected.nivelOcup.labels[param]);
      }
      /*
      labels.sort(function(a,b){
        var arrA=a.split('-');
        var arrB=b.split('-');
        return a[0]*100-b[0*100]+a[1]-b[1];
      });
      */
      graficos.nivel_ocupacion.AddLabels(labels);
      graficos.nivel_ocupacion.IniciaGrafico();
      this.cvGraf1.style.display='block';
    }
  }
  this.cvGraf1.style.display='block';
  this.cvGraf2.style.display='block';
  this.cvGraf3.style.display='block';
  //this.ShowTablaDatosGrafico(parametro);
};
ReporteMensual.prototype.ProcesaMenuNivelOcupación=function(res){

  var nivelSelected='';
  for(var label in this.dataSelected.nivelOcup.labels){
    if(this.dataSelected.nivelOcup.labels[label]==res.dataSelected.label){
      nivelSelected=label;
    }
  }
  var fecha=res.dataSelected.dataName;
  if(typeof this.dataSelected.nivelOcup.data[fecha]=='undefined'){
    console.error('ProcesaMenuNivelOcupación: No se encontró la fecha en los datos seleccionados. Fecha:'+fecha);
    console.error(this.dataSelected);
    return;
  }
  if(typeof this.dataSelected.nivelOcup.data[fecha][nivelSelected]=='undefined'){
    console.error('ProcesaMenuNivelOcupación: No se encontró el nivel en los datos seleccionados. Nivel Seleccionado:'+nivelSelected);
    console.error(this.dataSelected);
    return;
  }
  var labels=[];
  var data=[];
  var estadisticaMensual=this.getEstadisticaMensualSelected(fecha);
  if(estadisticaMensual==null){
    console.error('Estadistica Mensual es nulo. Fecha: '+fecha);
  }
  for(var i=0; i<this.dataSelected.nivelOcup.data[fecha][nivelSelected].length;i++){
    var objRuta=this.dataSelected.nivelOcup.data[fecha][nivelSelected][i];
    labels.push(objRuta.troncal);
    data.push(estadisticaMensual.DataMensual[fecha][objRuta.central][objRuta.ruta].stat.ocup.prom);
  }
  var dataGrafico={titulo: 'Troncales', labels:labels, data:{arr:data, nombre:fecha}}
  var ventana=new VentanaTraficoDiario(this.contenedorGraficoDiario, 'Troncales con Utilización '+res.dataSelected.label , dataGrafico);
  console.log(this.contenedorGraficoDiario);
};
ReporteMensual.prototype.getEstadisticaMensualSelected=function(fechaSelected){
  for(var fecha in this.EstadisticaMensual.DataMensual){
    if(fecha == fechaSelected){
      return this.EstadisticaMensual;
    }
  }
  for(var fecha in this.EstadisticaMensual_1.DataMensual){
    if(fecha == fechaSelected){
      return this.EstadisticaMensual_1;
    }
  }
  for(var fecha in this.EstadisticaMensual_2.DataMensual){
    if(fecha == fechaSelected){
      return this.EstadisticaMensual_2;
    }
  }
  return null;
};
ReporteMensual.prototype.ProcesaMenuGrafico=function(res){
  var fecha=res.dataSelected.dataName.split('-');
  var arrcentralRuta=res.dataSelected.label.split('-');
  var central=this.getCentralFromShortName(arrcentralRuta[0]);
  var ruta=arrcentralRuta[1];
  var dis=this;
  this.traficoDiario.getDataMesRutaFromBD(fecha[0], fecha[1], central, ruta, function(data){
    var diasMes=getDiasDelMes(fecha[0], fecha[1]);
    var objRuta=dis.traficoDiario.dataDiaria[res.dataSelected.dataName][central][ruta];
    var labels=[];
    var data=[];
    for(var i=1;i<=diasMes;i++){
      if(typeof objRuta[i]!='undefined'){
        data.push(objRuta[i].stat[res.id].prom);
        labels.push("D"+i+"-H"+objRuta[i].stat[res.id].h);
      }else{
        data.push(0);
        labels.push("D"+i);
      }
    }
    var dataGrafico={titulo: res.id, labels:labels, data:{arr:data, nombre:res.dataSelected.label}};
    var objTitulo={ruta:'Troncal',  circ:'Circuitos', tipo:'Tipo', dir:'Dirección', sen:'Señalización', pco:'PCO', pcd:'PCD', nem:'Cia', area:'Área', cod:'Zona', inf:'Información'};
    var objData=Object.assign({}, dis.Rutas.dataRutas[res.dataSelected.dataName][central][ruta]);
    objData.ruta=ruta;
    console.log(dis.Rutas);
    console.log(res.dataSelected.dataName);
    console.log(central);
    console.log(ruta);
    var data=[];
    data.push(objData);
    var dataTabla={titulo:objTitulo, data:data};
    console.log(dataTabla);
    var ventana=new VentanaTraficoDiario(dis.cvGraf1, dis.Centrales.centrales[central].nombre+"-"+ruta+":"+res.dataSelected.dataName, dataGrafico, dataTabla);
    console.log(dis.cvGraf1);
  },function(e){
    window.alert('No fue posible obtener el tráfico diario de la ruta'+res.dataSelected.label+". Reintente más tarde");
  });
};
ReporteMensual.prototype.ShowTablaDatosGrafico=function(parametro){
  var tabla=new Tabla(this.contTablaDatosMensual);
  var objTitulo={};
  tabla.Delete();
  if(parametro!='nivel_ocupacion'){
    objTitulo={troncal:'Troncal', };
  }else{

  }

  tabla.putTitulo(objTitulo);
};

ReporteMensual.prototype.getGraficosIntOcupAsr=function(parametro){
  var graficos={}
  while (this.cvGraf1.firstChild) {
    this.cvGraf1.removeChild(this.cvGraf1.firstChild);
  }
  while (this.cvGraf2.firstChild) {
    this.cvGraf2.removeChild(this.cvGraf2.firstChild);
  }
  while (this.cvGraf3.firstChild) {
    this.cvGraf3.removeChild(this.cvGraf3.firstChild);
  }
  while (this.cvGraf4.firstChild) {
    this.cvGraf4.removeChild(this.cvGraf4.firstChild);
  }

  if(parametro=='int'){
    var graf1=new Grafico('int', this.cvGraf1, 'INTENTOS', true, true);
    var graf2=new Grafico('ocup', this.cvGraf2, 'OCUPACIÓN', false);
    var graf3=new Grafico('asr', this.cvGraf3, 'ASR', false);
    var graf4=new Grafico('nivel_ocup', this.cvGraf4, 'NIVEL DE OCUPACIÓN', false);
    graficos={int:graf1, ocup:graf2, asr:graf3, nivel_ocupacion: graf4};
  }
  if(parametro=='asr'){
    var graf1=new Grafico('asr', this.cvGraf1, 'ASR', true, true);
    var graf2=new Grafico('ocup', this.cvGraf2, 'OCUPACIÓN', false);
    var graf3=new Grafico('int', this.cvGraf3, 'Intentos', false);
    var graf4=new Grafico('nivel_ocup', this.cvGraf4, 'NIVEL DE OCUPACIÓN', false);
    graficos={int:graf3, ocup:graf2, asr:graf1, nivel_ocupacion: graf4};
  }
  if(parametro=='ocup'){
    var graf1=new Grafico('ocup',this.cvGraf1, 'OCUPACIÓN', true, true);
    var graf2=new Grafico('asr',this.cvGraf2, 'ASR', false);
    var graf3=new Grafico('int',this.cvGraf3, 'Intentos', false);
    var graf4=new Grafico('nivel_ocup',this.cvGraf4, 'NIVEL DE OCUPACIÓN', false);
    graficos={int:graf3, ocup:graf1, asr:graf2, nivel_ocupacion: graf4};
  }
  if(parametro=='nivel_ocupacion'){
    var graf1=new Grafico('ocup', this.cvGraf1, 'NIVEL DE OCUPACIÓN', false, true);
    var graf2=new Grafico('asr', this.cvGraf2, 'ASR', false);
    var graf3=new Grafico('int', this.cvGraf3, 'Intentos', false);
    var graf4=new Grafico('nivel_ocup', this.cvGraf4, 'OCUPACIÓN', false);
    graficos={int:graf4, ocup:graf2, asr:graf3, nivel_ocupacion: graf1 };
  }
  graf1.onAvanzar=function(){
    graf2.Avanzar();
    graf3.Avanzar();
  };
  graf1.onRetroceder=function(){
    graf2.Retroceder();
    graf3.Retroceder();
  };
  return graficos;
};
ReporteMensual.prototype.getArrData=function(arrFecha, central, ruta){
  var data={int:[], asr:[], ocup:[]};
  if((typeof this.EstadisticaMensual.DataMensual[arrFecha[0]] == 'undefined')||
    (typeof this.EstadisticaMensual.DataMensual[arrFecha[0]][central] == 'undefined')||
    (typeof this.EstadisticaMensual.DataMensual[arrFecha[0]][central][ruta] == 'undefined')){
      data.int[arrFecha[0]]=0;
      data.asr[arrFecha[0]]=0;
      data.ocup[arrFecha[0]]=0;
  }else{
    var objRuta=this.EstadisticaMensual.DataMensual[arrFecha[0]][central][ruta];
    data.int[arrFecha[0]]=objRuta.stat.int.prom;
    data.asr[arrFecha[0]]=objRuta.stat.asr.prom;
    data.ocup[arrFecha[0]]=objRuta.stat.ocup.prom;
  }
  if((typeof this.EstadisticaMensual_1.DataMensual[arrFecha[1]] == 'undefined')||
    (typeof this.EstadisticaMensual_1.DataMensual[arrFecha[1]][central] == 'undefined')||
    (typeof this.EstadisticaMensual_1.DataMensual[arrFecha[1]][central][ruta] == 'undefined')){
      data.int[arrFecha[1]]=0;
      data.asr[arrFecha[1]]=0;
      data.ocup[arrFecha[1]]=0;
  }else{
    var objRuta=this.EstadisticaMensual_1.DataMensual[arrFecha[1]][central][ruta];
    data.int[arrFecha[1]]=objRuta.stat.int.prom;
    data.asr[arrFecha[1]]=objRuta.stat.asr.prom;
    data.ocup[arrFecha[1]]=objRuta.stat.ocup.prom;
  }
  if((typeof this.EstadisticaMensual_2.DataMensual[arrFecha[2]] == 'undefined')||
    (typeof this.EstadisticaMensual_2.DataMensual[arrFecha[2]][central] == 'undefined')||
    (typeof this.EstadisticaMensual_2.DataMensual[arrFecha[2]][central][ruta] == 'undefined')){
      data.int[arrFecha[2]]=0;
      data.asr[arrFecha[2]]=0;
      data.ocup[arrFecha[2]]=0;
  }else{
    var objRuta=this.EstadisticaMensual_2.DataMensual[arrFecha[2]][central][ruta];
    data.int[arrFecha[2]]=objRuta.stat.int.prom;
    data.asr[arrFecha[2]]=objRuta.stat.asr.prom;
    data.ocup[arrFecha[2]]=objRuta.stat.ocup.prom;
  }
  return data;
};

ReporteMensual.prototype.getCentralFromShortName=function(nombreCorto){
  for(var central in this.Centrales.centrales){
    if(this.Centrales.centrales[central].shortname==nombreCorto){
      return central;
    }
  }
};

ReporteMensual.prototype.getArrFechas3meses=function(){
  for(var fecha in this.EstadisticaMensual.DataMensual){}
  for(var fecha_1 in this.EstadisticaMensual_1.DataMensual){}
  for(var fecha_2 in this.EstadisticaMensual_2.DataMensual){}
  return [fecha, fecha_1, fecha_2];
};

ReporteMensual.prototype.EscondeContenedores=function(){

  this.contenedorGraficos.style.display='none';
  this.contenedorCargaDatos.style.display='none';
  this.contenedorBienvenida.style.display='none';
  this.contTablaDatosMensual.style.display='none';

  this.contenedorDatosTrafico.style.display='none';
  this.contenedorTrafico.style.display='none';
  this.contSeleccion.style.display='none';


};


ReporteMensual.prototype.creaMenu=function(){
  var data={};
  data['Graficos']={id:1, selected:true};
  data['Rutas del mes']={id:2};
  data['Puntos de Código']={id:3};
  data['Trafico Diario']={id:4};
  data['Ayuda']={id:5};
  var dataMenu={'nivel1':data};
  var dis=this;
  this.menu=new MenuHorizontal(this.contenedorMenu, dataMenu, function(id){
    switch (id) {
      case 1:
        dis.CalculaRutasSeleccionadas();
        dis.contSeleccion.style.display='block';
        dis.contenedorTraficoDiario.style.display='none';
        dis.contenedorRutas.style.display='none';
        dis.contenedorPuntosCodigo.style.display='none';
        dis.contenedorAyuda.style.display='none';
        dis.contenedorGraficos.style.display='block';
        break;
      case 2:
        dis.contSeleccion.style.display='none';
        dis.contenedorTraficoDiario.style.display='none';
        dis.contenedorRutas.style.display='block';
        dis.contenedorPuntosCodigo.style.display='none';
        dis.contenedorAyuda.style.display='none';
        dis.contenedorGraficos.style.display='none';
        break;
      case 3:
        dis.contSeleccion.style.display='none';
        dis.contenedorTraficoDiario.style.display='none';
        dis.contenedorRutas.style.display='none';
        dis.contenedorPuntosCodigo.style.display='block';
        dis.contenedorAyuda.style.display='none';
        dis.contenedorGraficos.style.display='none';
        break;
      case 4:
        dis.contSeleccion.style.display='none';
        dis.contenedorTraficoDiario.style.display='block';
        dis.contenedorRutas.style.display='none';
        dis.contenedorPuntosCodigo.style.display='none';
        dis.contenedorAyuda.style.display='none';
        dis.contenedorGraficos.style.display='none';
        break;
      case 5:
        dis.contenedorTraficoDiario.style.display='none';
        dis.contenedorRutas.style.display='none';
        dis.contenedorPuntosCodigo.style.display='none';
        dis.contenedorAyuda.style.display='block';
        dis.contenedorGraficos.style.display='none';
        break;
      default:
    }
  });
};
ReporteMensual.prototype.init=function(){
  var dis=this;
  //this.EscondeContenedores();
  this.ventanaCarga=new VentanaCargaDatos(this.contenedorCargaDatos, function(){
    dis.initSistemaTrafico();
  });
  this.creaMenu();


  this.initcbBase(this.cbNemos);
  this.initcbBase(this.cbAreas);
  this.initcbBase(this.cbZonas);
  this.initcbBase(this.cbSenalizacion);
  this.initcbBase(this.cbTipoTroncal);
  this.initrbIntentos();
  this.initrbOcupacion();
  this.initrbNivelesOcupacion();
  this.initrbAsr();
  this.initcbTipoTroncal();
  this.initcbCentrales();
  this.initcbRutas();
  this.getCentrales();
  this.getNemos();
  this.getErlangs();
  this.initFecha();
  this.contenedorBienvenida.style.display='block';
};

ReporteMensual.prototype.initcbTipoTroncal=function(){

};

ReporteMensual.prototype.initSistemaTrafico=function(){
  var trafmensual={mesActual:this.EstadisticaMensual, mes_1: this.EstadisticaMensual_1, mes_2:this.EstadisticaMensual_2};
  this.ventanaTraficoDiario=new VentanaDatosTraficoDiario(this.contenedorTraficoDiario,
    this.Centrales, this.Rutas, trafmensual, this.EstadisticaDiaria, this.Erlangs);
  this.ventanaRutas=new VentanaRutas(this.contenedorRutas,this.Centrales,this.Rutas, this.Rutas_1);
  this.ventanaPuntosCodigo=new VentanaPuntosCodigo(this.contenedorPuntosCodigo, this.Centrales, this.Rutas);
  this.displaySistemaTrafico();
  var res=this.Rutas.getParametrosRuta();
  this.setcbAreas(res.Areas);
  this.setcbZonas(res.Zonas);
  this.setcbNemos(res.Nemos);
  this.setSenalizacion(res.Senalizacion);
  this.setcbTipoTroncal(res.Tipos);
  if(this.cbTipoTroncal.options.length>0){
    this.cbTipoTroncal.value=this.cbTipoTroncal.options[0].value;
    this.cbTipoTroncal.onchange();
  }
};
ReporteMensual.prototype.setSenalizacion=function(senalizacion){
  LimpiaComboBox(this.cbSenalizacion);
  AddOption2Cb(this.cbSenalizacion, 'TODAS', '', 'TODAS');
  for(var sen in senalizacion){
    AddOption2Cb(this.cbSenalizacion, sen, '', sen);
  }
  this.cbSenalizacion.value='TODAS';
};
ReporteMensual.prototype.setcbTipoTroncal=function(tipos){
  LimpiaComboBox(this.cbTipoTroncal);
  //AddOption2Cb(this.cbTipoTroncal, "TODOS", '', 'TODOS');
  AddOption2Cb(this.cbTipoTroncal, 'EXTERNAS', '', 'EXTERNAS');
  AddOption2Cb(this.cbTipoTroncal, 'INTERNAS', '', 'INTERNAS');
  AddOption2Cb(this.cbTipoTroncal, 'TANDEM', '', 'TANDEM');
  this.cbTipoTroncal.value="EXTERNAS"
};

ReporteMensual.prototype.getErlangs=function(){
  var dis=this;
  this.Erlangs.getErlangsFromBD(function(){
    dis.checkboxErlangs.checked=true;
    dis.ventanaCarga.show();
  }, function(e){
    console.error('getErlangs:ERROR');
    console.error(e);
    dis.SendMsg2User("No se pudo rescatar los erlangs desde la Base de Datos. Por favor, revise su conexión a Intenet.");
  });
};

ReporteMensual.prototype.getNemos=function(){
  var dis=this;
  this.Nemos.getNemosFromBD(function(){
    dis.checkboxNemos.checked=true;
    dis.ventanaCarga.show();
  }, function(e){
    console.error('getCentrales:ERROR');
    console.error(e);
    dis.SendMsg2User("No se pudo rescatar las compañías desde la Base de Datos. Por favor, revise su conexión a Intenet.");
  });
};

ReporteMensual.prototype.getCentrales=function(){
  var dis=this;
  this.Centrales.getCentrales(function(){
    dis.checkboxCentrales.checked=true;
    dis.ventanaCarga.show();
  }, function(e){
    console.error('getCentrales:ERROR');
    console.error(e);
    dis.SendMsg2User("No se pudo rescatar las centrales de la Base de Datos. Por favor, revise su conexión a Intenet.");
  });
};

ReporteMensual.prototype.setcbNemos=function(nemos){
  LimpiaComboBox(this.cbNemos);
  AddOption2Cb(this.cbNemos, 'TODOS', '', 'TODOS')

  for(var nemo in nemos){
    AddOption2Cb(this.cbNemos, nemo, '', nemo);
  }
  this.cbNemos.value="TODOS";
};

ReporteMensual.prototype.setcbAreas=function(areas){
  LimpiaComboBox(this.cbAreas);
  AddOption2Cb(this.cbAreas, 'TODAS', '', 'TODAS');
  for(var area in areas){
    AddOption2Cb(this.cbAreas, area, '', area);
  }
  this.cbAreas.value="TODAS";
};

ReporteMensual.prototype.setcbZonas=function(zonas){
    LimpiaComboBox(this.cbZonas);
    AddOption2Cb(this.cbZonas, 'TODAS', '', 'TODAS');
    for(var zona in zonas){
      AddOption2Cb(this.cbZonas, zona, '', zona);
    }
    this.cbAreas.value="TODAS";
};

ReporteMensual.prototype.MsgCarga=function(msg){
  console.log(msg);
};

ReporteMensual.prototype.getFecha=function(){
  var arrFecha=this.Fecha.value.split('-');
  return {ano: Number(arrFecha[0]), mes:Number(arrFecha[1]), dia:Number(arrFecha[2])}
};


ReporteMensual.prototype.initrbIntentos=function(){
  var dis=this;
  this.rbIntentos.onchange=function(){
    dis.GraficaRutasSeleccionadas( 'int', true);
  };
};
ReporteMensual.prototype.initrbOcupacion=function(){
  var dis=this;
  this.rbOcupacion.onchange=function(){
    dis.GraficaRutasSeleccionadas( 'ocup', true);
  };
};
ReporteMensual.prototype.initrbAsr=function(){
  var dis=this;
  this.rbAsr.onchange=function(){
    dis.GraficaRutasSeleccionadas( 'asr', true);
  };
};

ReporteMensual.prototype.initrbNivelesOcupacion=function(){
  var dis=this;
  this.rbNivelesOcupacion.onchange=function(){
    dis.GraficaRutasSeleccionadas( 'nivel_ocupacion', false);
  };
};

ReporteMensual.prototype.SendMsg2User=function(msg){
  window.alert(msg);
};
ReporteMensual.prototype.displayVentanaCargaDatos=function(){
  this.contenedorBienvenida.style.display='none';
  this.contenedorTrafico.style.display='none';
  this.contenedorCargaDatos.style.display='block';
};
ReporteMensual.prototype.displaySistemaTrafico=function(){
  this.contenedorBienvenida.style.display='none';
  this.contenedorCargaDatos.style.display='none';
  this.contSeleccion.style.display='block';
  this.EscondeDatosTrafico();
  this.contenedorMenu.style.display='block';
  this.contenedorTrafico.style.display='block';
};

ReporteMensual.prototype.EscondeDatosTrafico=function(){
  this.contenedorGraficos.style.display='none';
  this.contenedorTrafico.style.display='none';
  this.contenedorRutas.style.display='none';
  this.contenedorPuntosCodigo.style.display='none';
  this.contenedorAyuda.style.display='none';
};
