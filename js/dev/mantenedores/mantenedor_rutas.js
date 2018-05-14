function MantenedorRutas(bd, objCentral, objNemo, config){
  this.bd=bd;
  this.fecha=config.fecha;
  this.msg=config.msg;
  this.fsCentralesRutas=config.fsCentralesRutas;
  this.cbCentrales=config.cbCentrales;
  this.cbRutas=config.cbRutas;
  this.contRutas=config.contRutas;
  this.btnCargaRutas=config.btnCargaRutas;
  this.btnBorraRutas=config.btnBorraRutas;
  this.btnComparaRutas=config.btnComparaRutas;
  this.fsCargaRutas=config.fsCargaRutas;
  this.cbCentralesCarga=config.cbCentralesCarga;
  this.cbErroresCarga=config.cbErroresCarga;
  this.cbWarningsCarga=config.cbWarningsCarga;
  this.fileRutas=config.fileRutas;
  this.msgCarga=config.msgCarga;
  this.btnCargaArchivoEnBD=config.btnCargaArchivoEnBD;
  this.contCargaRutas=config.contCargaRutas;
  this.fsResultadosCarga=config.fsResultadosCarga;
  this.fsComparaRutas=config.fsComparaRutas;
  this.msgComparaRutas=config.msgComparaRutas;

  this.rbRutasDetalle=config.rbRutasDetalle;

  this.rbRutasPRI=config.rbRutasPRI;
  this.rbRutasSIP=config.rbRutasSIP;
  this.rbRutasS7=config.rbRutasS7;
  this.rbRutasCambioParametros=config.rbRutasCambioParametros;
  this.rbRutasAgregadas=config.rbRutasAgregadas;
  this.rbRutasEliminadas=config.rbRutasEliminadas;
  this.rbRutasErroresS7=config.rbRutasErroresS7;
  this.rbRutasSinNemo=config.rbRutasSinNemo;

  this.contTablaComparacion=config.contTablaComparacion;
  this.rutas=new Rutas(bd);
  this.rutas_temporal = new Rutas(bd);
  this.rutas_mes_anterior=new Rutas(bd);
  console.log(this.rutas);
  if ((objCentral == null) || (typeof objCentral=='undefined')){
    this.objCentral=new Centrales(bd);
    this.objCentral.getCentrales(function(){
    }, function(e){
    });
  }else{
    this.objCentral=objCentral;
  }
  if ((objNemo==null)||(typeof objNemo=='undefined')){
    this.objNemo=new Nemos(bd);
    this.objNemo.getNemosFromBD(function(){}, function(e){});
  }else{
    this.objNemo=objNemo;
  }
  this.init();
}

MantenedorRutas.prototype.initcbCentrales=function(){
  var dis=this;
  this.cbCentrales.onchange=function(){
    console.log('initcbCentrales:onchange');
    console.log(dis.cbCentrales.options.length);
    if (dis.cbCentrales.options.length<=0){
      return;
    }
    var central=dis.cbCentrales.options[dis.cbCentrales.selectedIndex].value;
    var fecha = dis.fecha.value.split('-');
    dis.UpdateListaRutas(dis.cbRutas, dis.rutas.dataRutas, Number(fecha[0])+'-'+Number(fecha[1]), central);
  };
};


MantenedorRutas.prototype.UpdateListaCentrales=function(cb, dataRuta, fecha){
  LimpiaComboBox(cb);
  for(var central in dataRuta[fecha]){
    AddOption2Cb(cb, central, "", central);
  }
  if(cb.options.length >0){
    cb.value=cb.options[0].value;
    cb.onchange();
  }
};

MantenedorRutas.prototype.UpdateListaRutas=function(cb, dataRutas, fecha, central){
  LimpiaComboBox(cb);
  for(var ruta in dataRutas[fecha][central]){
    AddOption2Cb(cb, ruta, "", ruta);
  }
  if(cb.options.length >0){
    cb.selectedIndex=0;
    cb.onchange();
  }
};

MantenedorRutas.prototype.getRutasMes=function(){
  var dis=this;
  var fecha = dis.fecha.value.split('-');
  dis.msg.innerHTML="Estamos recuperando la información de rutas para la fecha "+ dis.fecha.value;
  dis.rutas.getDataFromBD(Number(fecha[0]), Number(fecha[1]), function(data){
    var cont = dis.CuentaDatos(data);
    if (cont.cCentrales==0){
      dis.msg.innerHTML="No hay rutas en la base de datos para la fecha "+dis.fecha.value;
    }else{
      dis.msg.innerHTML="Se recuperaron "+cont.cCentrales+' centrales y ' +cont.cRutas+ ' rutas desde la base de datos';
    }
    console.log('getRutasMes');
    console.log(data);
    dis.fsCentralesRutas.style.display='block';
    dis.UpdateListaCentrales(dis.cbCentrales, data, Number(fecha[0])+"-"+Number(fecha[1]));
  }, function(e){
    this.msg.innerHTML="Error. No fue posible obtener la información de la base de datos"
  });

  var fechaAnt=new Date(Number(fecha[0]), Number(fecha[1])-2, 1);
  dis.rutas_mes_anterior.getDataFromBD(fechaAnt.getFullYear(), fechaAnt.getMonth()+1, function(data){
    console.log(data);
  }, function(e){
    this.msg.innerHTML="Error. No fue posible obtener la información del mes anterior desde la base de datos. Por favor, reinice.";
  });
};
MantenedorRutas.prototype.CuentaDatos=function(dataRutas){
  var cCentral=0;
  var cRuta=0;
  for(var fecha in dataRutas){
    for(var central in dataRutas[fecha]){
      cCentral++;
      for(var ruta in dataRutas[fecha][central]){
        cRuta++;
      }
    }
  }
  return {cCentrales: cCentral, cRutas: cRuta};
};

MantenedorRutas.prototype.initFecha=function(){
  var dis=this;

  this.LimpiaRutasCargadas();
  this.fecha.onchange=function(){

    dis.fsComparaRutas.style.display='none';
    dis.fsCargaRutas.style.display='none';
    dis.fsCentralesRutas.style.display='none';
    dis.fsResultadosCarga.style.display='none';
    dis.LimpiaRutasCargadas();
    dis.getRutasMes();
  };
};

MantenedorRutas.prototype.initbtnCargaRutas=function(){
  var dis=this;
  this.btnCargaRutas.onclick=function(){

    LimpiaComboBox(dis.cbCentralesCarga);
    dis.fsComparaRutas.style.display='none';
    dis.fsResultadosCarga.style.display='none';
    dis.fsCargaRutas.style.display='block';
    for(var central in dis.objCentral.centrales){
      AddOption2Cb(dis.cbCentralesCarga, central, "", central);
    }

  };
}

MantenedorRutas.prototype.initfileRutas=function(){
  var dis=this;
  this.fileRutas.onchange=function(e){
    LimpiaComboBox(dis.cbErroresCarga);
    LimpiaComboBox(dis.cbWarningsCarga);
    var archivo = e.target.files[0];
    if (archivo){
      var lector = new FileReader();
      lector.onload = function(e) {
        console.log('initfileRutas:lector.onload');
        dis.rutas_temporal=new Rutas(dis.bd);
        console.log(dis.rutas_temporal);
        var fecha = dis.fecha.value.split('-');
        var central=dis.cbCentralesCarga.options[dis.cbCentralesCarga.selectedIndex].value;
        dis.rutas_temporal.getDataFromFile(Number(fecha[0]), Number(fecha[1]), central, e.target.result, function(data){
          if (typeof dis.objNemo.nemos[data]=='undefined'){
            return 'indefinido';
          }else{
            return dis.objNemo.nemos[data];
          }
        });
        dis.fsResultadosCarga.style.display='block';
        dis.Visualizacion="COMPARACION_ARCHIVO";
        dis.fsComparaRutas.style.display='block';
        LimpiaComboBox(dis.cbErroresCarga);
        LimpiaComboBox(dis.cbWarningsCarga);
        for(var i=0; i<dis.rutas_temporal.errores.length;i++){
          AddOption2Cb(dis.cbErroresCarga, dis.rutas_temporal.errores[i], "", dis.rutas_temporal.errores[i]);
        }

        for(var j=0; j<dis.rutas_temporal.warnings.length;j++){
          AddOption2Cb(dis.cbWarningsCarga, dis.rutas_temporal.warnings[j], "", dis.rutas_temporal.warnings[j]);
        }

        dis.msgCarga.innerHTML="Al procesar el archivo se obtuvieron "+dis.rutas_temporal.errores.length+" errores y " +dis.rutas_temporal.warnings.length+" warrnings";
        dis.rbRutasDetalle.onchange();
        dis.rbRutasDetalle.checked=true;

      }
      lector.readAsText(archivo);
    }
  };
};

MantenedorRutas.prototype.DisplayDataInTable=function(dataRutas, tabla){
  console.log('DisplayDataInTable');
  var objTitulo={fecha:'Fecha', central: 'Central', ruta:'Ruta', circ:'Circuitos', nem:'Nemo', sen:'Señalización', pco:'PCO', pcd:'PCD', sis:'SIST', inf: 'INFORMACIÖN'};
  tabla.putTitulo(objTitulo);
  var count=0;
  for(var fecha in dataRutas){
    for(var central in dataRutas[fecha]){
      for(var ruta in dataRutas[fecha][central]){
        count++;
        var objData=Object.assign({},dataRutas[fecha][central][ruta]);
        objData.fecha=fecha;
        objData.central=central;
        objData.ruta=ruta;
        tabla.putData(objData,objTitulo);
      }
    }
  }
  console.log('DisplayDataInTable');
  this.msgComparaRutas.innerHTML='La tabla contiene ' + count+ ' registros';
};

MantenedorRutas.prototype.initbtnBorraRutas=function(){
  var dis=this;
  this.btnBorraRutas.onclick=function(){
    var fecha=dis.fecha.value.split('-');
    if (dis.cbCentrales.options.length <=0){
      return;
    }
    var central=dis.cbCentrales.options[dis.cbCentrales.selectedIndex].value;
    if (!confirm('Estás a punto de eiminar todas las rutas de la central '+ central+'. Deseas continuar?')){
      return;
    }
    dis.rutas.deleteRutasDeCentral(Number(fecha[0]), Number(fecha[1]), central, function(){
      dis.msg.innerHTML="Se eliminaron correctamnete las rutas de central "+central;
      dis.fecha.onchange();
    }, function(e){
      dis.msg.innerHTML="Error al eliminar rutas de central "+central+". Por favor, intente más tarde.";
    });
  };
};
MantenedorRutas.prototype.initcbRutas=function(){
  var dis=this;
  this.cbRutas.onchange=function(){
    if ((dis.cbCentrales.options.length<=0)||(dis.cbRutas.options.length<=0)){
      return;
    }
    var arrFecha=dis.fecha.value.split('-');
    var fecha=Number(arrFecha[0])+'-'+Number(arrFecha[1]);
    central=dis.cbCentrales.options[dis.cbCentrales.selectedIndex].value;
    ruta=dis.cbRutas.options[dis.cbRutas.selectedIndex].value;
    var data=dis.rutas.dataRutas[fecha][central][ruta];
    console.log('initcbRutas:onchange');
    var tabla=new Tabla(dis.contRutas);
    tabla.Delete;
    var objTitulo={central: 'Central', ruta:'Ruta',  nem:'Nemo', circ: 'Circuitos', sen: 'Señalización', pco:'pco', pcd:'pcd', sis: 'sis', tipo:'Tipo', dir:'dir', area:'area', cod:'cod', inf:'inf'};
    tabla.putTitulo(objTitulo);
    data.central=central;
    data.ruta=ruta;
    tabla.putData(data, objTitulo);
  };
};

MantenedorRutas.prototype.initrbRutasDetalle=function(){
  var dis=this;
  this.rbRutasDetalle.onchange=function(){
    console.log('initrbRutasDetalle:onchange');
    var tabla=new Tabla(dis.contCargaRutas);
    tabla.Delete();
    if(  dis.Visualizacion=="TODAS"){
      dis.DisplayDataInTable(dis.rutas.dataRutas, tabla);
    }else{
      dis.DisplayDataInTable(dis.rutas_temporal.dataRutas, tabla);
    }

  };
};

MantenedorRutas.prototype.initrbRutasCambioParametros=function(){
  var dis=this;
  this.rbRutasCambioParametros.onchange=function(){
    if(  dis.Visualizacion=="TODAS"){
      var dataActual=dis.rutas.dataRutas;
      var dataAnterior=dis.rutas_mes_anterior.dataRutas;
      var res=dis.rutas.getRutasDiferentes(dataActual, dataAnterior);
    }else{
      var dataActual=dis.rutas_temporal.dataRutas;
      var dataAnterior=dis.rutas_mes_anterior.dataRutas;
      var res=dis.rutas_temporal.getRutasDiferentes(dataActual, dataAnterior);
    }
    var tabla=new Tabla(dis.contCargaRutas);
    tabla.Delete();
    var objTitulo={fecha:'Fecha', central: 'Central', ruta:'Ruta', circ: 'Circuitos', sen: 'Señalización', pco:'pco', pcd:'pcd', sis: 'sis', nem:'Nemo', tipo:'Tipo', dir:'dir', area:'area', cod:'cod', inf:'inf'};
    tabla.putTitulo(objTitulo);
    for(var fechaAnt in dataAnterior){
    }
    var count=0;
    for(var fecha in res){
      for(var central in res[fecha]){
        for(var ruta in res[fecha][central]){
          count++;
          var data=Object.assign({}, dataActual[fecha][central][ruta]);
          data.fecha=fecha;
          data.central=central;
          data.ruta=ruta;
          console.log(data);
          tabla.putData(data, objTitulo);
          var dataAnt=dataAnterior[fechaAnt][central][ruta];
          dataAnt.fecha=fechaAnt;
          dataAnt.central=central;
          dataAnt.ruta=ruta;
          tabla.putData(dataAnt, objTitulo);
        }
      }
    }
    if (count == 0){
      dis.msgComparaRutas.innerHTML='No se encontraron diferencias en los parámetros de las rutas con el mes anterior';
    }else{
      dis.msgComparaRutas.innerHTML='Se encontraron ' + count+ ' rutas con parámetros diferentes';
    }
  };
};

MantenedorRutas.prototype.initbtnCargaArchivoEnBD=function(){
  var dis=this;
  this.btnCargaArchivoEnBD.onclick=function(){
    if(!confirm('Vas a grabar los datos en la Base de Datos. Estás seguro?')){
      return;
    }
    console.log(dis.rutas_temporal);
    dis.rutas_temporal.saveDataInBD(function(){
      dis.msgCarga.innerHTML='Los datos fueron cargados exitosamente en la base de datos';
      dis.getRutasMes();
      dis.fsCargaRutas.style.display='none';
    }, function(e){
      dis.msgCarga.innerHTML='Se produjo un error al momento de cargar los datos en la Base de DAtos. Por favor, reintente más tarde.';
    });
  };
};

MantenedorRutas.prototype.LimpiaRutasCargadas=function(){
  LimpiaComboBox(this.cbCentrales);
  LimpiaComboBox(this.cbRutas);
  var tabla=new Tabla(this.contRutas);
  tabla.Delete();
};

MantenedorRutas.prototype.LimpiaCargaRutas=function(){
  LimpiaComboBox(this.cbCentrales);
  LimpiaComboBox(this.cbRutas);
  var tabla=new Tabla(this.contRutas);
  tabla.Delete();
};

MantenedorRutas.prototype.initrbRutasAgregadas=function(){
  var dis=this;
  this.rbRutasAgregadas.onchange=function(){
    var count=0;
    var tabla=new Tabla(dis.contCargaRutas);
    tabla.Delete();
    var objTitulo={fecha:'Fecha', central: 'Central', ruta:'Ruta', circ: 'Circuitos', sen: 'Señalización', pco:'pco', pcd:'pcd', sis: 'sis', nem:'Nemo', tipo:'Tipo', dir:'dir', area:'area', cod:'cod', inf:'inf'};
    tabla.putTitulo(objTitulo);
    if(  dis.Visualizacion=="TODAS"){
      var dataActual=dis.rutas.dataRutas;
      var dataAnt=dis.rutas_mes_anterior.dataRutas;
      var res=dis.rutas.getRutasAgregadas(dataActual, dataAnt);
    }else{
      var dataActual=dis.rutas_temporal.dataRutas;
      var dataAnt=dis.rutas_mes_anterior.dataRutas;
      var res=dis.rutas_temporal.getRutasAgregadas(dataActual, dataAnt);
    }
    for(var fecha in res){
      for(var central in res[fecha]){
        for(var ruta in res[fecha][central]){
          count++;
          var data=Object.assign({},dataActual[fecha][central][ruta]);
          data.fecha=fecha;
          data.central=central;
          data.ruta=ruta;
          tabla.putData(data, objTitulo);
        }
      }
    }
    if (count==0){
      dis.msgComparaRutas.innerHTML='No se encontraron rutas nuevas con respecto al mes anterior';
    }else{
      dis.msgComparaRutas.innerHTML='Se encontraron ' + count+ ' rutas nuevas con respecto al mes anterior';
    }
  }
};

MantenedorRutas.prototype.initrbRutasEliminadas=function(){
    var dis=this;
    this.rbRutasEliminadas.onchange=function(){
      var count=0;
      var tabla=new Tabla(dis.contCargaRutas);
      tabla.Delete();
      var objTitulo={fecha:'Fecha', central: 'Central', ruta:'Ruta', circ: 'Circuitos', sen: 'Señalización', pco:'pco', pcd:'pcd', sis: 'sis', nem:'Nemo', tipo:'Tipo', dir:'dir', area:'area', cod:'cod', inf:'inf'};
      tabla.putTitulo(objTitulo);

      if(  dis.Visualizacion=="TODAS"){
        var dataActual=dis.rutas.dataRutas;
        var dataAnt=dis.rutas_mes_anterior.dataRutas;
        var res=dis.rutas.getRutasAgregadas(dataAnt,dataActual);
      }else{
        var dataActual=dis.rutas_temporal.dataRutas;
        var dataAnt=dis.rutas_mes_anterior.dataRutas;
        var res=dis.rutas_temporal.getRutasAgregadas(dataAnt,dataActual);
      }
      var centralSel="";
      for(var fechaMes in dataActual){
        for(centralSel in dataActual[fechaMes]){
        }
      }
      for(var fecha in res){
        for(var central in res[fecha]){
          for(var ruta in res[fecha][central]){
            var agregar=false;
            if (dis.Visualizacion=="TODAS"){
              agregar=true;
            }else{
              if(central==centralSel){
                agregar=true;
              }
            }
            if (agregar){
              count++;
              var data=Object.assign({},dataAnt[fecha][central][ruta]);
              data.fecha=fecha;
              data.central=central;
              data.ruta=ruta;
              tabla.putData(data, objTitulo);
            }
          }
        }
      }
      if (count==0){
        dis.msgComparaRutas.innerHTML='No se encontraron rutas eliminadas con respecto al mes anterior';
      }else{
        dis.msgComparaRutas.innerHTML='Se encontraron ' + count+ ' rutas eliminadas con respecto al mes anterior';
      }
    };
};

MantenedorRutas.prototype.initbtnComparaRutas=function(){
  var dis=this;
  this.btnComparaRutas.onclick=function(){
    dis.Visualizacion="TODAS";
    dis.fsComparaRutas.style.display='block';
    dis.rbRutasAgregadas.checked=true;
    dis.rbRutasAgregadas.onchange();
  };
};
MantenedorRutas.prototype.initrbRutasErroresS7=function(){
  var dis=this;
  this.rbRutasErroresS7.onchange=function(){
    var count=0;
    var tabla=new Tabla(dis.contCargaRutas);
    tabla.Delete();
    var objTitulo={fecha:'Fecha', central: 'Central', ruta:'Ruta', circ: 'Circuitos', sen: 'Señalización', pco:'pco', pcd:'pcd', sis: 'sis', nem:'Nemo', tipo:'Tipo', dir:'dir', area:'area', cod:'cod', inf:'inf'};
    tabla.putTitulo(objTitulo);
    if(  dis.Visualizacion=="TODAS"){
      var dataActual=dis.rutas.dataRutas;
    }else{
      var dataActual=dis.rutas_temporal.dataRutas;
    }
    console.log('initrbRutasSinNemo:onchange');
    console.log(dataActual);
    for(var fecha in dataActual){
      for(var central in dataActual[fecha]){
        for(var ruta in dataActual[fecha][central]){
          if((dataActual[fecha][central][ruta]['sen']=='S7')&&(dataActual[fecha][central][ruta]['pco']==0)){
            count++;
            var data=Object.assign({},dataActual[fecha][central][ruta]);
            data.fecha=fecha;
            data.central=central;
            data.ruta=ruta;
            tabla.putData(data, objTitulo);
          }
        }
      }
    }
    if (count==0){
      dis.msgComparaRutas.innerHTML='No se encontraron rutas con inconsistencias S7';
    }else{
      dis.msgComparaRutas.innerHTML='Se encontraron ' + count+ ' rutas con señalización S7 e inconsistencias en su definición';
    }
  };
};
MantenedorRutas.prototype.initrbRutasSinNemo=function(){
  var dis=this;
  this.rbRutasSinNemo.onchange=function(){
    var count=0;
    var tabla=new Tabla(dis.contCargaRutas);
    tabla.Delete();
    var objTitulo={fecha:'Fecha', central: 'Central', ruta:'Ruta', circ: 'Circuitos', sen: 'Señalización', pco:'pco', pcd:'pcd', sis: 'sis', nem:'Nemo', tipo:'Tipo', dir:'dir', area:'area', cod:'cod', inf:'inf'};
    tabla.putTitulo(objTitulo);
    if(  dis.Visualizacion=="TODAS"){
      var dataActual=dis.rutas.dataRutas;
    }else{
      var dataActual=dis.rutas_temporal.dataRutas;
    }
    console.log('initrbRutasSinNemo:onchange');
    console.log(dataActual);
    for(var fecha in dataActual){
      for(var central in dataActual[fecha]){
        for(var ruta in dataActual[fecha][central]){
          if(dataActual[fecha][central][ruta]['nem']=='indefinido'){
            count++;
            var data=Object.assign({},dataActual[fecha][central][ruta]);
            data.fecha=fecha;
            data.central=central;
            data.ruta=ruta;
            tabla.putData(data, objTitulo);
          }
        }
      }
    }
    if (count==0){
      dis.msgComparaRutas.innerHTML='No se encontraron rutas sin nemos';
    }else{
      dis.msgComparaRutas.innerHTML='Se encontraron ' + count+ ' rutas sin nemos';
    }
  };
};
MantenedorRutas.prototype.init=function(){
  console.log('init');
  this.fsComparaRutas.style.display='none';
  this.fsCargaRutas.style.display='none';
  this.fsCentralesRutas.style.display='none';
  this.fsResultadosCarga.style.display='none';
  this.initFecha();
  this.initcbCentrales();
  this.initcbRutas();
  this.initbtnCargaRutas();
  this.initbtnBorraRutas();
  this.initrbRutasDetalle();
  this.initrbRutasPRI();
  this.initrbRutasSIP();
  this.initrbRutasS7();
  this.initrbRutasCambioParametros();
  this.initrbRutasAgregadas();
  this.initrbRutasEliminadas();
  this.initbtnCargaArchivoEnBD();
  this.initbtnComparaRutas();
  this.initrbRutasErroresS7();
  this.initrbRutasSinNemo();
  this.initfileRutas();
};
MantenedorRutas.prototype.showDataConSenalizacion=function(senalizacion){
    var tabla=new Tabla(this.contCargaRutas);
    tabla.Delete();
    if(  this.Visualizacion=="TODAS"){
      var dataActual=this.rutas.dataRutas;
    }else{
      var dataActual=this.rutas_temporal.dataRutas;
    }
    var count=0;
    var objTitulo={fecha:'Fecha', central: 'Central', ruta:'Ruta', circ: 'Circuitos', sen: 'Señalización', pco:'pco', pcd:'pcd', sis: 'sis', nem:'Nemo', tipo:'Tipo', dir:'dir', area:'area', cod:'cod', inf:'inf'};
    tabla.putTitulo(objTitulo);
    for(var fecha in dataActual){
      for(var central in dataActual[fecha]){
        for(var ruta in dataActual[fecha][central]){
          if(dataActual[fecha][central][ruta]['sen']==senalizacion){
            count++;
            var data=Object.assign({},dataActual[fecha][central][ruta]);
            data.fecha=fecha;
            data.central=central;
            data.ruta=ruta;
            tabla.putData(data, objTitulo);
          }
        }
      }
    }
    if (count==0){
      this.msgComparaRutas.innerHTML='No se encontraron rutas con señalización '+senalizacion;
    }else{
      this.msgComparaRutas.innerHTML='Se encontraron ' + count+ ' rutas con señalización '+senalizacion;
    }
};

MantenedorRutas.prototype.initrbRutasPRI=function(){
  var dis=this;
  this.rbRutasPRI.onchange=function(){
    dis.showDataConSenalizacion("PRI");
  }
};
MantenedorRutas.prototype.initrbRutasSIP=function(){
  var dis=this;
  this.rbRutasSIP.onchange=function(){
    dis.showDataConSenalizacion("SIP");
  }
};
MantenedorRutas.prototype.initrbRutasS7=function(){
  var dis=this;
  this.rbRutasS7.onchange=function(){
    dis.showDataConSenalizacion("S7");
  }
};
