function MantenedorTrafico(bd, config){
  this.bd=bd;
  this.fecha=config.fecha;
  this.msg=config.msg;
  this.fsTraficoBD=config.fsTraficoBD;
  this.cbCentralesBD=config.cbCentralesBD;
  this.cbRutasBD=config.cbRutasBD;
  this.cbDiasBD=config.cbDiasBD;
  this.fsTraficoMes=config.fsTraficoMes;
  this.contTraficoMes=config.contTraficoMes;
  this.fsTraficoDia=config.fsTraficoDia;
  this.contTraficoDia=config.contTraficoDia;
  this.fsEstadisticaMensual=config.fsEstadisticaMensual;
  this.contEstadisticaMensual=config.contEstadisticaMensual;
  this.fsAcciones=config.fsAcciones;
  this.btnCargarArchivo=config.btnCargarArchivo;
  this.btnEliminarTraficoCentral=config.btnEliminarTraficoCentral;
  this.btnAnalizarTrafico=config.btnAnalizarTrafico;
  this.btnGenerarEstadisticaMensual=config.btnGenerarEstadisticaMensual;
  this.btnGrabarEstadisticaMensual=config.btnGrabarEstadisticaMensual;
  this.fsCargarArchivo=config.fsCargarArchivo;
  this.fileTrafico=config.fileTrafico;
  this.pbCargaArchivo=config.pbCargaArchivo;
  this.msgCargaArchivo=config.msgCargaArchivo;
  this.fsResultadoCargaArchivo=config.fsResultadoCargaArchivo;
  this.cbErrores=config.cbErrores;
  this.cbWarnings=config.cbWarnings;
  this.msgResultadoArchivo=config.msgResultadoArchivo;
  this.cbCentralesArchivo=config.cbCentralesArchivo;
  this.cbFechaArchivo=config.cbFechaArchivo;
  this.cbRutasArchivo=config.cbRutasArchivo;
  this.cbDiasArchivo=config.cbDiasArchivo;
  this.btnCargaArchivoEnBD=config.btnCargaArchivoEnBD;
  this.msgResultadoCargaArchivo=config.msgResultadoCargaArchivo;
  this.fsResultadoDatosMes=config.fsResultadoDatosMes;
  this.lgResultadoDatosMes=config.lgResultadoDatosMes;
  this.contResultadoDatosMes=config.contResultadoDatosMes;
  this.fsResultadoDatosDia=config.fsResultadoDatosDia;
  this.lgResultadoDatosDia=config.lgResultadoDatosDia;
  this.contResultadoDatosDia=config.contResultadoDatosDia;
  this.fsAnalisis=config.fsAnalisis;
  this.rbDetalleTrafico=config.rbDetalleTrafico;
  this.rbRutasSinTrafico=config.rbRutasSinTrafico;
  this.rbDetalleEstadisticas=config.rbDetalleEstadisticas;
  this.msgAnalisis=config.msgAnalisis;
  this.contAnalisis=config.contAnalisis;
  this.fsCargaArchivoError=config.fsCargaArchivoError;
  this.fsCargaArchivoOK=config.fsCargaArchivoOK;
  this.pbSaveInBD=config.pbSaveInBD;
  this.rutas=new Rutas(bd);
  this.erlangs=new Erlangs(bd);
  this.erlangs.getErlangsFromBD(function(){}, function(e){
    this.msg.innerHTML='Se produjo un error al recuperar los Erlangs desde la base de datos. Por favor, vuelva a cargar la página';
    console.error(e);
  });
  this.TraficoDiario=new TraficoDiario(bd);
  this.TraficoDiario_temporal=new TraficoDiario(bd);
  this.EstadisticaMensual=new TraficoMensual(bd);
  this.init();
}

MantenedorTrafico.prototype.getFecha=function(){
  var arrFecha=this.fecha.value.split('-');
  return {ano: Number(arrFecha[0]), mes:Number(arrFecha[1]), dia:Number(arrFecha[2])}
};

MantenedorTrafico.prototype.initHideAllFS=function(){
  this.fsTraficoBD.style.display='none';
  this.fsCargarArchivo.style.display='none';
  this.fsAcciones.style.display='none';
  this.fsAnalisis.style.display='none';
  LimpiaComboBox(this.cbCentralesBD);
  LimpiaComboBox(this.cbRutasBD);
  LimpiaComboBox(this.cbDiasBD);
  RemoveChilds(this.contTraficoMes);
  RemoveChilds(this.contTraficoDia);
  RemoveChilds(this.contAnalisis);
  RemoveChilds(this.contEstadisticaMensual);
  this.msg.innerHTML='';
};

MantenedorTrafico.prototype.initfecha=function(){
  var dis=this;
  this.fecha.onchange=function(){
    dis.initHideAllFS();
    dis.TraficoDiario=new TraficoDiario(bd);
    dis.EstadisticaMensual=new TraficoMensual(bd);
    var objfecha=dis.getFecha();
    dis.msg.innerHTML='Recuperando los datos de la base de datos.';

    dis.EstadisticaMensual.getDataMensualFromBD(objfecha.ano, objfecha.mes, function(){
      dis.msg.innerHTML="Se cargó las estadísticas mensuales desde la base de datos.";

    }, function(e){
      console.log('initfecha:onchange:getDataMensualFromBD:ERROR');
      dis.msg.innerHTML='No he podido recuperar las estadísticas mensuales desde la Base de Datos. Por favor revisa tu conexión Internet e intenta más tarde';
    });

    dis.TraficoDiario.getDataMesFromBD(objfecha.ano, objfecha.mes, function(data){
      dis.msg.innerHTML="Se cargó el tráfico desde la base de datos.";
      dis.ShowDataBD();
    },function(e){
      console.log('initfecha:onchange:getDataMesFromBD:ERROR');
      dis.msg.innerHTML='No he podido recuperar el tráfico diario desde la Base de Datos. Por favor revisa tu conexión Internet e intenta más tarde';
    });
  };
};

MantenedorTrafico.prototype.ShowDataBD=function(){
  this.fsTraficoBD.style.display='block';
  this.fsTraficoBD.style.display='block';
  this.fsAcciones.style.display='block';
  this.fsAnalisis.style.display='none';
  this.fsCargarArchivo.style.display='none';
  LimpiaComboBox(this.cbCentralesBD);
  for(var fecha in this.TraficoDiario.dataDiaria){
    for(var central in this.TraficoDiario.dataDiaria[fecha]){
      AddOption2Cb(this.cbCentralesBD, central, "", central);
    }
  }

  if(this.cbCentralesBD.options.length > 0){
    this.cbCentralesBD.value=this.cbCentralesBD.options[0].value;
    this.cbCentralesBD.onchange();
  }

};
MantenedorTrafico.prototype.initcbCentralesBD=function(){
  var dis=this;
  this.cbCentralesBD.onchange=function(){
    if(dis.cbCentralesBD.selectedIndex<0){
      return;
    }
    var central=dis.cbCentralesBD.options[dis.cbCentralesBD.selectedIndex].value;
    var objfecha=dis.getFecha();
    var fecha=objfecha.ano+"-"+objfecha.mes;
    LimpiaComboBox(dis.cbRutasBD);
    for(var ruta in dis.TraficoDiario.dataDiaria[fecha][central]){
      AddOption2Cb(dis.cbRutasBD, ruta, "", ruta);
    }
    if (dis.cbRutasBD.options.length>0){
      dis.cbRutasBD.value=dis.cbRutasBD.options[0].value;
      dis.cbRutasBD.onchange();
    }
  };
};

MantenedorTrafico.prototype.initcbRutasBD=function(){
  var dis=this;
  this.cbRutasBD.onchange=function(){
    if (dis.cbRutasBD.selectedIndex<0){
      return;
    }
    var objfecha=dis.getFecha();
    var fecha=objfecha.ano+"-"+objfecha.mes;
    var central=dis.cbCentralesBD.options[dis.cbCentralesBD.selectedIndex].value;
    var ruta=dis.cbRutasBD.options[dis.cbRutasBD.selectedIndex].value;
    LimpiaComboBox(dis.cbDiasBD);
    for(var dia in dis.TraficoDiario.dataDiaria[fecha][central][ruta]){
      AddOption2Cb(dis.cbDiasBD, dia,"", dia);
    }
    var diasMes=getDiasDelMes(objfecha.ano, objfecha.mes);
    dis.setTablaMes(dis.contTraficoMes,dis.TraficoDiario.dataDiaria[fecha][central][ruta], diasMes);
    var tabla=new Tabla(dis.contEstadisticaMensual);

    dis.setTablaEstadisticaMensual(true, tabla, fecha, central, ruta);
    if(dis.cbDiasBD.options.length>0){
      dis.cbDiasBD.value=dis.cbDiasBD.options[dis.cbDiasBD.selectedIndex].value;
      dis.cbDiasBD.onchange();
    }
  };
};

MantenedorTrafico.prototype.setTablaMes=function(contenedor, data,diasMes){
  var tabla=new Tabla(contenedor);
  tabla.Delete();
  var objTitulo={0:'Parámetro'};
  var objDataInt={0:'Intentos'};
  var objDataASR={0:'ASR'};
  var objDataOcup={0:'Ocupación'};
  for(var i=1;i<=diasMes;i++){
    objTitulo[i]=i;
    if(typeof data[i]!='undefined'){
      objDataInt[i]=data[i].stat.int.max;
      objDataASR[i]=data[i].stat.asr.min;
      objDataOcup[i]=data[i].stat.ocup.max;
    }else{
      objDataInt[i]="";
      objDataASR[i]='';
      objDataOcup[i]='';
    }
  }
  tabla.putTitulo(objTitulo);
  tabla.putData(objDataInt,objTitulo);
  tabla.putData(objDataASR,objTitulo);
  tabla.putData(objDataOcup,objTitulo);
};
MantenedorTrafico.prototype.initcbDiasBD=function(){
    var dis=this;
    this.cbDiasBD.onchange=function(){
      if(dis.cbDiasBD.options.length<0){
        return;
      }
      var objfecha=dis.getFecha();
      var fecha=objfecha.ano+"-"+objfecha.mes;
      var central=dis.cbCentralesBD.options[dis.cbCentralesBD.selectedIndex].value;
      var ruta=dis.cbRutasBD.options[dis.cbRutasBD.selectedIndex].value;
      var dia=dis.cbDiasBD.options[dis.cbDiasBD.selectedIndex].value;
      dis.setTablaDia(dis.contTraficoDia, dis.TraficoDiario.dataDiaria[fecha][central][ruta][dia]['data']);
    };
};
MantenedorTrafico.prototype.setTablaDia=function(contenedor, data){
  var tabla=new Tabla(contenedor);
  tabla.Delete();
  var objTitulo={h:"hora", int:"intentos", asr:'ASR',con:'Conectados', ocup:"Ocupación", rsp:'Respuestas', coli:'Colisiones', totu:'Totu', totue:'TotuE', cic:'Circuitos', cice:'CircuitosE', mbu:'MBU', dbd:'Desborde', n98:'N99_98%', c70:'c90_70%'};
  var objdata=Object.assign({}, data);
  tabla.putTitulo(objTitulo);
  tabla.putData(objdata, objTitulo);
};

MantenedorTrafico.prototype.setTablaEstadisticaMensual=function(conTitulo, tabla, fecha, central, ruta){

  var contenedor=tabla.parentElement;
  if(conTitulo){
    tabla.Delete();
  }
  if((typeof this.EstadisticaMensual.DataMensual[fecha]=='undefined')||(typeof this.EstadisticaMensual.DataMensual[fecha][central]=='undefined')||(typeof this.EstadisticaMensual.DataMensual[fecha][central][ruta]=='undefined')){
    console.log('setTablaEstadisticaMensual:No hay Estadísticas mensuales');
    AddMsg2Contenedor(contenedor, 'No hay estadísticas para la ruta '+ruta);
    return;
  }
  var objDataRuta=this.EstadisticaMensual.DataMensual[fecha][central][ruta];

  var objTitulo={fecha:'Fecha', central: 'Central', ruta: 'Ruta'};
  var objdata={fecha:fecha, central:central, ruta:ruta}

  objTitulo=Object.assign(objTitulo,{dInt:'Día Int', hInt:"Hora Int", int:"Int Máx", int_prom: 'Int Prom'});
  objdata=Object.assign(objdata,{dInt:objDataRuta.stat.int.d, hInt:objDataRuta.stat.int.h, int:objDataRuta.stat.int.max, int_prom:objDataRuta.stat.int.prom});

  objTitulo=Object.assign(objTitulo,{dAsr:'Día Asr', hAsr:"Hora Asr", asr:"Asr Min", asr_prom: 'Asr Prom'});
  objdata=Object.assign(objdata,{dAsr:objDataRuta.stat.asr.d, hAsr:objDataRuta.stat.asr.h, asr:objDataRuta.stat.asr.min, asr_prom:objDataRuta.stat.asr.prom});

  objTitulo=Object.assign(objTitulo,{dOcup:'Día Ocup', hOcup:"Hora Ocup", ocup:"Ocup Máx", ocup_prom: 'Ocup Prom'});
  objdata=Object.assign(objdata,{dOcup:objDataRuta.stat.ocup.d, hOcup:objDataRuta.stat.ocup.h, ocup:objDataRuta.stat.ocup.max, ocup_prom:objDataRuta.stat.ocup.prom});
  if(conTitulo){
    tabla.putTitulo(objTitulo);
  }
  tabla.putData(objdata, objTitulo);
};

MantenedorTrafico.prototype.initbtnCargarArchivo=function(){
  var dis=this;
  this.btnCargarArchivo.onclick=function(){
    dis.fsCargarArchivo.style.display='block';
    dis.pbCargaArchivo.style.display='none';
    dis.msgCargaArchivo.innerHTML="";
    dis.fsAnalisis.style.display='none';
    dis.fsResultadoCargaArchivo.style.display='none';
  };
};
MantenedorTrafico.prototype.initbtnEliminarTraficoCentral=function(){
  var dis=this;
  this.btnEliminarTraficoCentral.onclick=function(){
    dis.fsCargarArchivo.style.display='none';
    if(dis.cbCentralesBD.selectedIndex<0){
      return;
    }
    var central=dis.cbCentralesBD.options[dis.cbCentralesBD.selectedIndex].value;
    if(!confirm('Vas a eliminar los datos de tráfico de la central '+central+'. Deseas continuar?')){
      return;
    }
    var fecha=dis.getFecha();
    dis.TraficoDiario.deleteDataCentral(fecha.ano, fecha.mes, central, function(){
      dis.msg.innerHTML='Se borraron los datos de la central '+central;
      dis.fecha.onchange();
    }, function(e){
      dis.msg.innerHTML='Se produjo un error al borrar os datos de la central '+central+". Por favor, reintente más tarde";
    });
  };
};

MantenedorTrafico.prototype.initbtnAnalizarTrafico=function(){
    var dis=this;
    this.btnAnalizarTrafico.onclick=function(){
      dis.fsResultadoCargaArchivo.style.display='none';
      dis.fsAnalisis.style.display='block';
      dis.pbCargaArchivo.style.display='none'
      dis.origenData='BD';
      dis.rbRutasSinTrafico.checked=true;
      dis.rbRutasSinTrafico.onchange();
    };
};
MantenedorTrafico.prototype.initfileTrafico=function(){
    var dis=this;
    this.fileTrafico.onchange=function(e){
      //dis.fsCargarArchivo.style.display='none';
      dis.fsAnalisis.style.display='none';
      dis.msgResultadoCargaArchivo.innerHTML="";
      dis.fsResultadoCargaArchivo.style.display='none';
      dis.TraficoDiario_temporal=new TraficoDiario(dis.bd);
      dis.pbCargaArchivo.style.display='inline';
      dis.pbCargaArchivo.value=0;
      dis.pbCargaArchivo.max=e.target.files.length;
      dis.files=[];
      for(var i=0;i<e.target.files.length;i++){
        var archivo = e.target.files[i];
        if (archivo){
          var lector = new FileReader();
          dis.files.push({filereader:lector, file:archivo});
          lector.onload = function(e) {
            var nombreArchivo=dis.getFileName(this);
            dis.msgCargaArchivo.innerHTML='Procesando archivo '+nombreArchivo;
            var tdiario=new TraficoDiario(dis.bd);
            tdiario.procesaHtml(nombreArchivo, e.target.result, function(num){
              if(typeof dis.erlangs.erlangs[num]=='undefined'){
                return num;
              }else{
                return dis.erlangs.erlangs[num];
              }
            });
            dis.TraficoDiario_temporal.AddTrafico(tdiario);
            dis.pbCargaArchivo.value++;
            if(dis.pbCargaArchivo.value==dis.pbCargaArchivo.max){
              dis.MuestraFinCargaArchivos();
              for(var fecha in dis.TraficoDiario_temporal.dataDiaria){
                AddOption2Cb(dis.cbFechaArchivo, fecha,'', fecha);
              }
              if(dis.cbFechaArchivo.options.length>0){
                dis.cbFechaArchivo.value=dis.cbFechaArchivo.options[dis.cbFechaArchivo.selectedIndex].value;
                dis.cbFechaArchivo.onchange();
              }
              dis.rbRutasSinTrafico.checked=true;
              dis.origenData=='FILE';
              dis.rbRutasSinTrafico.onchange();
            }

          }
          lector.readAsText(archivo);
        }
      }
    };
};
MantenedorTrafico.prototype.getFileName=function(filereader){
  for(var i=0; i<this.files.length;i++){
    if(filereader == this.files[i].filereader){
      return this.files[i].file.name;
    }
  }
  return "Error";
};
MantenedorTrafico.prototype.MuestraFinCargaArchivos=function(){
  this.msgCargaArchivo.innerHTML='Se cargaron '+this.pbCargaArchivo.max+" archivos";

  this.msgCargaArchivo.innerHTML='Se cargaron '+this.pbCargaArchivo.max+" archivos";
  LimpiaComboBox(this.cbErrores);
  LimpiaComboBox(this.cbWarnings);
  LimpiaComboBox(this.cbFechaArchivo);
  for(var i=0;i<this.TraficoDiario_temporal.arrErrores.length;i++){
    AddOption2Cb(this.cbErrores, this.TraficoDiario_temporal.arrErrores[i],'',this.TraficoDiario_temporal.arrErrores[i]);
  }
  for(var i=0; i<this.TraficoDiario_temporal.arrWarnings.length;i++){
    AddOption2Cb(this.cbWarnings, this.TraficoDiario_temporal.arrWarnings[i],'',this.TraficoDiario_temporal.arrWarnings[i]);
  }
  this.fsResultadoCargaArchivo.style.display='block';
  this.pbCargaArchivo.style.display='none';
  if((this.cbErrores.options.length>0)||(this.cbWarnings.options.length>0)){
    this.fsAnalisis.style.display='none';
    this.fsCargaArchivoError.style.display='block';
    this.fsCargaArchivoOK.style.display='none';
    this.msgResultadoArchivo.innerHTML='Se encontraron '+this.cbErrores.options.length+" errores y "+this.cbWarnings.options.length+" warnings";
  }else{
      this.fsAnalisis.style.display='block';
      this.fsCargaArchivoError.style.display='none';
      this.fsCargaArchivoOK.style.display='block';
  }
};
MantenedorTrafico.prototype.initcbFechaArchivo=function(){
  var dis=this;
  this.cbFechaArchivo.onchange=function(){
    if(dis.cbFechaArchivo.selectedIndex<0){
      return;
    }
    var fecha=dis.cbFechaArchivo.options[dis.cbFechaArchivo.selectedIndex].value;
    LimpiaComboBox(dis.cbCentralesArchivo);
    for(var central in dis.TraficoDiario_temporal.dataDiaria[fecha]){
      AddOption2Cb(dis.cbCentralesArchivo, central, '', central);
    }
    if(dis.cbCentralesArchivo.options.length>0){
      dis.cbCentralesArchivo.value=dis.cbCentralesArchivo.options[0].value;
      dis.cbCentralesArchivo.onchange();
    }
  };
};
MantenedorTrafico.prototype.initcbCentralesArchivo=function(){
  var dis=this;
  this.cbCentralesArchivo.onchange=function(){
    if(dis.cbCentralesArchivo.selectedIndex<0){
      return;
    }
    var fecha=dis.cbFechaArchivo.options[dis.cbFechaArchivo.selectedIndex].value;
    var central=dis.cbCentralesArchivo.options[dis.cbCentralesArchivo.selectedIndex].value;
    LimpiaComboBox(dis.cbRutasArchivo);
    for(var ruta in dis.TraficoDiario_temporal.dataDiaria[fecha][central]){
      AddOption2Cb(dis.cbRutasArchivo, ruta, '', ruta);
    }
    dis.msgResultadoCargaArchivo.innerHTML="La central "+central+" tiene "+dis.cbRutasArchivo.options.length+" rutas";
    if(dis.cbRutasArchivo.options.length>0){
      dis.cbRutasArchivo.value=dis.cbRutasArchivo.options[0].value;
      dis.cbRutasArchivo.onchange();
    }
  };
};
MantenedorTrafico.prototype.initcbRutasArchivo=function(){
  var dis=this;
  this.cbRutasArchivo.onchange=function(){
    if(dis.cbRutasArchivo.select<0){
      return;
    }
    var fecha=dis.cbFechaArchivo.options[dis.cbFechaArchivo.selectedIndex].value;
    var central=dis.cbCentralesArchivo.options[dis.cbCentralesArchivo.selectedIndex].value;
    var ruta=dis.cbRutasArchivo.options[dis.cbRutasArchivo.selectedIndex].value;
    LimpiaComboBox(dis.cbDiasArchivo);
    for(var dia in dis.TraficoDiario_temporal.dataDiaria[fecha][central][ruta]){
      AddOption2Cb(dis.cbDiasArchivo, dia, '', dia);
    }
    var arrFecha=fecha.split('-');
    var diasMes=getDiasDelMes(arrFecha[0], arrFecha[1]);
    dis.lgResultadoDatosMes.innerHTML='Parámetros Máximos/Mínimos de la ruta <b>'+ruta+'</b>';
    dis.setTablaMes(dis.contResultadoDatosMes,dis.TraficoDiario_temporal.dataDiaria[fecha][central][ruta], diasMes);
    if(dis.cbDiasArchivo.options.length>0){
      dis.cbDiasArchivo.value=dis.cbDiasArchivo.options[0].value;
      dis.cbDiasArchivo.onchange();
    }
  };
};
MantenedorTrafico.prototype.initcbDiasArchivo=function(){
  var dis=this;
  this.cbDiasArchivo.onchange=function(){
    if(dis.cbDiasArchivo.selectedIndex<0){
      return;
    }
    var fecha=dis.cbFechaArchivo.options[dis.cbFechaArchivo.selectedIndex].value;
    var central=dis.cbCentralesArchivo.options[dis.cbCentralesArchivo.selectedIndex].value;
    var ruta=dis.cbRutasArchivo.options[dis.cbRutasArchivo.selectedIndex].value;
    var dia=dis.cbDiasArchivo.options[dis.cbDiasArchivo.selectedIndex].value;
    dis.lgResultadoDatosDia.innerHTML='Datos de Ruta <b>'+ruta+'</b> para el día '+dia;
    dis.setTablaDia(dis.contResultadoDatosDia, dis.TraficoDiario_temporal.dataDiaria[fecha][central][ruta][dia]['data']);
    //console.log('initcbDiasArchivo:onchange');
  };
};
MantenedorTrafico.prototype.initbtnCargaArchivoEnBD=function(){
  var dis=this;
  this.pbSaveInBD.style.display='none';
  this.btnCargaArchivoEnBD.onclick=function(){
    if(!confirm('Estás a punto de cargar los datos en la base de datos. ¿Deseas proceder?')){
      return;
    }
    dis.pbSaveInBD.max=100;
    dis.pbSaveInBD.value=0;
    dis.pbSaveInBD.innerHTML='0%';
    dis.pbSaveInBD.style.display='inline';
    dis.TraficoDiario_temporal.savePartialDataInBD(function(){
      //dis.TraficoDiario.AddTrafico(dis.TraficoDiario_temporal);
      dis.pbSaveInBD.style.display='none';
      dis.fecha.onchange();
      dis.msg.innerHTML="Se actualizaron los datos con los datos recuperados de los archivos de tráfico";
    }, function(e){
      dis.pbSaveInBD.style.display='none';
      dis.msg.innerHTML="No fue posible cargar todo el tráfico en la base de datos. Por favor, reintenta más tarde.";
    }, function(cont){
      dis.pbSaveInBD.max=cont.max;
      dis.pbSaveInBD.value=cont.max-cont.cont;
      if(cont.max>0){
        dis.pbSaveInBD.innerHTML=((cont.max-cont.cont)/cont.max).toFixed(0)+"%";
      }else{
        dis.pbSaveInBD.innerHTML="0%";
      }
    });
  };
};
MantenedorTrafico.prototype.initrbDetalleTrafico=function(){
  var dis=this;
  this.rbDetalleTrafico.onchange=function(){

    if(dis.origenData=='BD'){
      var data=dis.TraficoDiario.dataDiaria;
    }else{
      var data=dis.TraficoDiario_temporal.dataDiaria;
    }
    dis.setDataMesAnalisis(data);
  };
};
MantenedorTrafico.prototype.setDataMesAnalisis=function(data){
  var tabla=new Tabla(this.contAnalisis);
  tabla.Delete();
  for(var fecha in data){
    var objTitulo={fecha: 'Fecha', central:'Central', ruta:'Ruta'};
    var arrFecha=fecha.split('-');
    var diasMes=getDiasDelMes(arrFecha[0], arrFecha[1]);
    for(var i=1; i<=diasMes;i++){
      objTitulo[i.toString()+"."]=i;
    }
    tabla.putTitulo(objTitulo);
    for(var central in data[fecha]){
      for(var ruta in data[fecha][central]){
        var objData={fecha: fecha, central:central, ruta:ruta};
        for(var i=1;i<=diasMes;i++){
          if(typeof data[fecha][central][ruta][i] != 'undefined'){
            objData[i.toString()+"."]=data[fecha][central][ruta][i].stat.int.max;
          }else{
            objData[i.toString()+"."]="";
          }
        }
        tabla.putData(objData,objTitulo);
      }
    }
  }
};
MantenedorTrafico.prototype.initrbRutasSinTrafico=function(){
  var dis=this;
  this.rbRutasSinTrafico.onchange=function(){
    if(dis.origenData=='BD'){
      var trafico=dis.TraficoDiario;
    }else{
      var trafico=dis.TraficoDiario_temporal;
    }
    var data=trafico.getRutasSinTrafico();
    dis.setDataMesAnalisis(data);
  };
};
MantenedorTrafico.prototype.initbtnGenerarEstadisticaMensual=function(){
  var dis=this;
  this.btnGenerarEstadisticaMensual.onclick=function(){
    dis.EstadisticaMensual.CalculaTraficoMensual(dis.TraficoDiario);
    dis.cbRutasBD.onchange();
  };
};
MantenedorTrafico.prototype.initbtnGrabarEstadisticaMensual=function(){
  var dis=this;
  this.btnGrabarEstadisticaMensual.onclick=function(){
    if(!confirm('Vas a generar las estadísticas del mes. ¿Deseas continuar?')){
      return;
    }
    dis.EstadisticaMensual.saveDataMensual(function(){
      dis.msg.innerHTML='Las estadísticas mensuales se guardaron exitosamente en la base de datos';
    }, function(e){
      dis.msg.innerHTML='Error. No fue posible guardar las estadísticas mensuales en la base de datos. Por  favor, intenta más tarde';
    });
  };
};

MantenedorTrafico.prototype.initrbDetalleEstadisticas=function(){
  var dis=this;
  this.rbDetalleEstadisticas.onchange=function(){
    var primero=true;
    var cont=0;
    var tabla=new Tabla(dis.contAnalisis);
    for(var fecha in dis.EstadisticaMensual.DataMensual){
      for(var central in dis.EstadisticaMensual.DataMensual[fecha]){
        for(var ruta in dis.EstadisticaMensual.DataMensual[fecha][central]){
          cont++;
          if(primero){
            dis.setTablaEstadisticaMensual(true, tabla, fecha, central, ruta);
            primero=false;
          }else{
            dis.setTablaEstadisticaMensual(false, tabla, fecha, central, ruta);
          }
        }
      }
    }
    if(cont<=0){
      dis.msgAnalisis.innerHTML="";
    }else{
      dis.msgAnalisis.innerHTML="La estadística contiene "+cont+' rutas.';
    }

  };
};

MantenedorTrafico.prototype.init=function(){
  this.fsTraficoBD.style.display='none';
  this.fsCargarArchivo.style.display='none';
  this.fsAcciones.style.display='none';
  this.fsAnalisis.style.display='none';
  this.initfecha();
  this.initcbCentralesBD();
  this.initcbRutasBD();
  this.initcbDiasBD();
  this.initbtnCargarArchivo();
  this.initbtnEliminarTraficoCentral();
  this.initbtnAnalizarTrafico();
  this.initbtnGenerarEstadisticaMensual();
  this.initbtnGrabarEstadisticaMensual();
  this.initfileTrafico();
  this.initcbCentralesArchivo();
  this.initcbFechaArchivo();
  this.initcbRutasArchivo();
  this.initcbDiasArchivo();
  this.initbtnCargaArchivoEnBD();
  this.initrbDetalleTrafico();
  this.initrbRutasSinTrafico();
  this.initrbDetalleEstadisticas();
};
