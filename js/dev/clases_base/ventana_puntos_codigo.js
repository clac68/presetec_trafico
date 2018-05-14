function VentanaPuntosCodigo(contenedor, centrales, rutas){
  this.cont=contenedor;
  while(this.cont.firstChild){
    this.cont.removeChild(this.cont.firstChild);
  }
  this.centrales=centrales;
  this.rutas=rutas;
  this.init();
}

VentanaPuntosCodigo.prototype.init=function(){
  this.contInput=document.createElement('div');
  this.contInput.setAttribute('class','ventana_puntos_codigo');
  this.cont.appendChild(this.contInput);

  this.contOutput=document.createElement('div');
  this.contOutput.setAttribute('class','ventana_puntos_codigo');
  this.cont.appendChild(this.contOutput);

  this.InitInput();
  this.initOutput();
  this.initData();
  this.contInput.style.display='block';
};

VentanaPuntosCodigo.prototype.InitInput=function(){
  var label = document.createElement('label');
  //label.setAttribute('class','puntos_codigo');
  this.contInput.appendChild(label);
  label.innerHTML='Sistema';
  this.cbSistemas=document.createElement('select');
  this.cbSistemas.setAttribute('class','ventana_puntos_codigo');
  label.appendChild(this.cbSistemas);

  label = document.createElement('label');
  //label.setAttribute('class','puntos_codigo');
  this.contInput.appendChild(label);
  label.innerHTML='Troncales';
  this.cbTroncales=document.createElement('select');
  this.cbTroncales.setAttribute('class','ventana_puntos_codigo');
  label.appendChild(this.cbTroncales);
  this.initcbSistemas();
  this.initcbTroncales();
};
VentanaPuntosCodigo.prototype.initOutput=function(){
  this.tabla=new Tabla(this.contOutput);
  this.tabla.Delete();
};
VentanaPuntosCodigo.prototype.initcbSistemas=function(){
  var dis=this;
  this.cbSistemas.onchange=function(){
    if(dis.cbSistemas.selectedIndex <0){
      return;
    }
    var sistema=dis.cbSistemas.options[dis.cbSistemas.selectedIndex].value;
    LimpiaComboBox(dis.cbTroncales);
    AddOption2Cb(dis.cbTroncales, 'TODAS','', 'TODAS');
    var rutas=dis.getRutasFromSistema(sistema);
    rutas.forEach(function(item,index){
      AddOption2Cb(dis.cbTroncales, item,'', item);
    })
    dis.cbTroncales.value='TODAS';
    dis.cbTroncales.onchange();
  };
};
VentanaPuntosCodigo.prototype.getRutasFromSistema=function(sistema){
  var arrRutas=[];
  for(var fecha in this.rutas.dataRutas){
    for(var central in this.rutas.dataRutas[fecha]){
      for(var ruta in this.rutas.dataRutas[fecha][central]){
        var objCentral=this.centrales.centrales[central];
        if(typeof objCentral!='undefined'){
          var sist=objCentral.shortname+'-'+this.rutas.dataRutas[fecha][central][ruta].sis;
          if(sistema!='TODOS'){
            if(sist==sistema){
                arrRutas.push(objCentral.shortname+"-"+ruta);
            }
          }else{
            if(this.rutas.dataRutas[fecha][central][ruta].sis.length>0){
              arrRutas.push(objCentral.shortname+"-"+ruta);
            }
          }
        }else{
          console.error('No se encontró central:'+central);
          console.error(this.centrales);
          console.error(this.rutas);
        }
      }
    }
  }
  return arrRutas;
};

VentanaPuntosCodigo.prototype.initcbTroncales=function(){
    var dis=this;
    this.cbTroncales.onchange=function(){
      console.log('initcbTroncales:onchange');
      if(dis.cbTroncales.selectedIndex<0){
        return;
      }
      var objTitulo={troncal:'TRONCAL', sistema:'SISTEMA', pco:'PC-ORIG', pcd:'PC-DEST'};
      dis.tabla.Delete();

      dis.tabla.enableMenu('Puntos de Codigo');

      dis.tabla.putTitulo(objTitulo);
      var troncal=dis.cbTroncales.options[dis.cbTroncales.selectedIndex].value;
      if(troncal=='TODAS'){
        for(var i=0;i<dis.cbTroncales.options.length;i++){
          var item=dis.cbTroncales.options[i].value;
          if(item!='TODAS'){
            var ruta=dis.getRuta(item);
            if(typeof ruta!='undefined'){
              var objData={troncal:item, sistema: ruta.sis, pco: ruta.pco, pcd: ruta.pcd};
              dis.tabla.putData(objData, objTitulo);
            }else{
              console.error('No encontré la troncal '+item+' dentro de las rutas');
            }
          }
        }
      }else{
        var ruta=dis.getRuta(troncal);
        if(typeof ruta != 'undefined'){
          var objData={troncal:item, sistema: ruta.sis, pco: ruta.pco, pcd: ruta.pcd};
          dis.tabla.putData(objData, objTitulo);
        }else{
          console.error('No encontré la troncal '+troncal+' dentro de las rutas');
        }
      }
    };
};

VentanaPuntosCodigo.prototype.getRuta=function(troncal){
  var arrTroncal=troncal.split('-');
  var centralSel=this.centrales.getCentralFromShortName(arrTroncal[0]);
  if(typeof centralSel == 'undefined'){
    console.log(troncal);
    console.error('No encontré el la central cuyo nombre corto es:'+arrTroncal[0]);
    return;
  }
  for(var fecha in this.rutas.dataRutas){
    if(typeof this.rutas.dataRutas[fecha][centralSel]!='undefined'){
      if(typeof this.rutas.dataRutas[fecha][centralSel][arrTroncal[1]]!='undefined'){
        return this.rutas.dataRutas[fecha][centralSel][arrTroncal[1]];
      }
    }
  }
  console.log(troncal);
  console.log(arrTroncal);
  console.log(centralSel);
  console.log(this.centrales);
  console.log(this.rutas);
  return;
};
VentanaPuntosCodigo.prototype.initData=function(){
  LimpiaComboBox(this.cbSistemas);
  LimpiaComboBox(this.cbTroncales);
  var sistemas=this.getSistemas();
  AddOption2Cb(this.cbSistemas, 'TODOS', '', 'TODOS');
  for(var sist in sistemas){
    AddOption2Cb(this.cbSistemas, sist, '', sist);
  }
  this.cbSistemas.value='TODOS';
  this.cbSistemas.onchange();
};

VentanaPuntosCodigo.prototype.getSistemas=function(){
  var sistemas=[];
  for(var fecha in this.rutas.dataRutas){
    for(var central in this.rutas.dataRutas[fecha]){
      for(var ruta in this.rutas.dataRutas[fecha][central]){
        var objRuta=this.rutas.dataRutas[fecha][central][ruta];
        if(typeof this.centrales.centrales[central]!='undefined'){
          if(objRuta.sis.length>0){
            var sist=this.centrales.centrales[central].shortname+'-'+objRuta.sis;
            sistemas[sist]=sist;
          }
        }
      }
    }
  }
  return sistemas;
};
