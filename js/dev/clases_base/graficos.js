'use strict'
function Grafico(id, objParent, titulo, conBoton, mostrarTabla ){
  'use strict'
  this.id=id;
  this.objParent=objParent;
  this.titulo=titulo;
  this.data=[];
  this.labels=[];
  this.dataGrafico=[];
  this.conBoton=conBoton;

  this.grafico={};
  this.mostrarTabla=mostrarTabla;


  this.contGrafico=document.createElement('div');
  this.contGrafico.style.overflow='auto';
  this.contGrafico.setAttribute('class', 'contenedor_grafico');
  this.objParent.appendChild(this.contGrafico);

  this.contTabla=document.createElement('div');
  this.contTabla.style.overflow='auto';
  this.contTabla.setAttribute('class', 'contenedor_tabla');
  this.tabla=new Tabla(this.contTabla);
  this.objParent.appendChild(this.contTabla);
  if(typeof this.mostrarTabla == 'undefined'){
    this.contTabla.style.display='none';
  }else{
    if(this.mostrarTabla){
      this.contTabla.style.display='block';
    }else{
      this.contTabla.style.display='none';
    }
  }
}

Grafico.prototype.setMenu=function(dataMenu, onMenuSelected){
  this.dataMenu=dataMenu;
  this.onMenuSelected=onMenuSelected;
};
Grafico.prototype.onclick=function(label, datasetLabel, x, y, e){
  console.log(label);
  console.log(datasetLabel);
  console.log(e);
}
Grafico.prototype.Reset=function(){
  this.data=[];
  this.labels=[];
}
Grafico.prototype.AddData =function(arrData, nombre, central){
  this.data.push({nombre:nombre, data:arrData, central:central});
};

Grafico.prototype.AddLabels =function(arrLabel){
  this.labels=arrLabel;
};


Grafico.prototype.IniciaGrafico=function(){
  this.RemoveGraficos();
  var dis=this;
  if(typeof this.dataMenu!='undefined'){
    this.menu= new Menu(this.contGrafico,this.dataMenu, function(dataSelected, opcion, descripcion){
      if(typeof dis.onMenuSelected != undefined){
        var res={id:dis.id, dataSelected: dataSelected, menu:{opcion:opcion, descripcion:descripcion}}
        if(typeof dis.onMenuSelected !='undefined'){
          dis.onMenuSelected(res);
        }
      }
    });
  }
  this.getWindowParameters();
  this.window=0;
  this.GraficaDatos();
};
Grafico.prototype.GraficaDatos=function(){
  posIni=this.window*this.maxgrafico;
  if((this.window) > this.windowMax){
    console.error('GraficaDatos: Se llegó a la venta máxima');
    return;
  }
  if(typeof this.chart != 'undefined'){
    this.chart.destroy();
  }

  this.tabla.Delete();
  var posIni=this.window*this.windowSize;
  var posFin=(this.window+1)*this.windowSize;
  if(posFin > this.labels.length){
    posFin =this.labels.length;
  }
  var labels=[];
  var datasets=[];
  var objTitulo={titulo:this.titulo};

  for(var i=posIni;i<posFin;i++){
    labels.push(this.labels[i]);
    objTitulo[this.labels[i]]=this.labels[i];
  }
  this.tabla.putTitulo(objTitulo);
  for(var i=0; i<this.data.length;i++){
    var dataset=[];
    var objData={};
    for(var j=posIni;j<posFin;j++){
      objData['titulo']=this.data[i].nombre;
      if(typeof this.data[i].data[j] != 'undefined'){
        objData[this.labels[j]]=this.data[i].data[j];
        dataset.push(this.data[i].data[j]);
      }else{
        console.log('GraficaDatos: Dato indefinido. this.data.data['+i+']'+'['+j+']');
        objData[this.labels[j]]=0;
        dataset.push(0);
      }
    }
    this.tabla.putData(objData, objTitulo);
    datasets.push(this.getDataSet(this.data[i].nombre, dataset, this.getColor(i)));
  }
  var data=this.getDataGrafico(labels, datasets);
  this.DisplayGrafico(data);
};

Grafico.prototype.DisplayGrafico=function(data){
  if(typeof this.btnAnterior=='undefined'){
    this.btnAnterior=this.getBotonAnterior();
  }
  if (typeof this.btnSiguiente=='undefined'){
    this.btnSiguiente=this.getBotonSiguiente();
  }
  if (typeof this.span== 'undefined'){
    this.span=CreaSpan(document, "", "\t Gráfico 1 de "+this.windowMax+"\t");
    this.contGrafico.appendChild(this.btnAnterior);
    this.contGrafico.appendChild(this.span);
    this.contGrafico.appendChild(this.btnSiguiente);
  }
  if(!this.conBoton){
    this.btnAnterior.style.display='none';
    this.btnSiguiente.style.display='none';
    this.span.style.display='none';
  }
  if (typeof this.cv=='undefined'){
    this.cv =document.createElement("canvas");
    this.cv.setAttribute("class", 'grafico');

    this.cv.setAttribute("width", 300);
    this.cv.setAttribute("height", 80  );
    var dis=this;
    this.cv.oncontextmenu=function(e){
      e.preventDefault();
      e.stopPropagation();
      var elto = dis.chart.getElementAtEvent(e);
      console.log(elto);
      if(elto.length > 0){
        if (typeof dis.menu=='undefined'){
          return;
        };
        var id={label:elto[0]._view.label, dataName:elto[0]._view.datasetLabel};
        dis.menu.show(id, e.pageX, e.pageY );
        //dis.onclick(elto[0]._view.label, elto[0]._view.datasetLabel, elto[0]._view.x, elto[0]._view.y, e);
      }
    };
    this.contGrafico.appendChild(this.cv);
  }
  var ctx=this.cv.getContext("2d");
  var graf=new Chart(ctx, data);
  this.chart = graf;
};

Grafico.prototype.getWindowParameters=function(){
  if ((this.labels.length <=0)||(this.data.length<=0)){
    this.windowSize=10;
    this.windowMax=10;
  }else{
    this.windowSize=Math.trunc(32/this.data.length);
    if(this.windowSize<=0){
      this.windowSize=1;
    }
  }

  this.windowMax=Math.trunc((this.labels.length)/this.windowSize);
  if (this.windowMax <=0){
    this.windowMax=1;
  }
  if((this.windowMax*this.windowSize) <(this.labels.length*this.data.length)){
    this.windowMax++;
  }
};
Grafico.prototype.getMenorLongitudDatos=function(){
  var longitud=999999999;
  for(var i=0; i<this.data.length;i++){
    if(this.data[i].length < longitud){
      longitud=this.data[i].length;
    }
  }
  return longitud;
};

Grafico.prototype.RemoveGraficos=function(){
  while (this.contGrafico.childNodes.length ){
    this.contGrafico.remove(this.contGrafico.childNodes[0]);
  }
};

Grafico.prototype.Avanzar=function(){
  if(typeof this.btnSiguiente != 'undefined'){
    this.btnSiguiente.onclick();
  }
};

Grafico.prototype.Retroceder=function(){
  if(typeof this.btnAnterior != 'undefined'){
    this.btnAnterior.onclick();
  }
};

Grafico.prototype.onAvanzar=function(fAvanzar){
  this.fAvanzar=fAvanzar;
};

Grafico.prototype.onRetroceder=function(fRetroceder){
  this.fRetroceder=fRetroceder;
};

Grafico.prototype.getBotonAnterior=function(){
  var dis=this;
  var btnAnterior=CreaBotonConImagen(document, "", "/images/anterior.jpg", 15, 15);
  btnAnterior.onclick=function(){
    if (dis.window<=0){
      return;
    }
    dis.window--;
    if(typeof dis.onRetroceder != 'undefined'){
      dis.onRetroceder();
    }
    dis.span.childNodes[0].data="\tGráfico "+ (dis.window+1) + " de " + dis.windowMax+"\t";
    dis.GraficaDatos();
  };
  return btnAnterior;
};
Grafico.prototype.getBotonSiguiente=function(){
  var btnSiguiente=CreaBotonConImagen(document, "", "/images/siguiente.png", 15, 15);
  var dis=this;
  btnSiguiente.onclick=function(){
    if ((dis.window+1)>=dis.windowMax){
      return;
    }
    dis.window++;
    if(typeof dis.onAvanzar != 'undefined'){
      dis.onAvanzar();
    }
    dis.span.childNodes[0].data="\tGráfico "+ (dis.window+1) + " de " + dis.windowMax+"\t";
    dis.GraficaDatos();
  };
  return btnSiguiente;
};

Grafico.prototype.getDataGrafico=function(dataLabels, data){
  var data={
    type:'bar',
    data:{
      labels:dataLabels,
      datasets:data
    },
    options:{
      legend:{
        position:"bottom",
        labels:{
          fontColor:['black','yellow'],
          fontSize:15
        },
      },
      title:{
        text:this.titulo,
        position: 'top',
        display:true,
        fontSize: 20,
        fontColor:'blue'
      },
      scales: {
        xAxes: [{
          gridLines:{
            color:"rgba(0,255,0,1)",// Eje x color verde
            display: true
          },
          ticks: {
            fontColor: "green", // Cambiar color de labels
            fontSize:15
          }
        }],
        yAxes: [{
          gridLines:{
            color:"rgba(0,255,0,1)",// Eje x color verde
            display: true
          },
          ticks: {
            fontColor: "green", // Cambiar color de labels
            fontSize:15
          }
        }]
      }
    }
  };
  return data;
};

Grafico.prototype.getDataSet=function(nombre, data, color){
  var dataset={
    label:nombre,
    backgroundColor: color.bgcolor,
    borderColor: color.bdcolor,
    data: data,
    borderWidth:2,
    fill:false
  };
  return dataset;
};


Grafico.prototype.getColor=function(item){
  switch (item){

    case 0:
      return{bgcolor: 'rgba(30, 73, 138, 1)', bdcolor: 'rgba(11, 27, 50, 1)'};
      break;
    case 1:
      return{bgcolor: 'rgba(255, 148, 66, 1)', bdcolor: 'rgba(219, 95, 0, 1)'};
      break;
    case 2:
      return{bgcolor: 'rgba(34, 155, 72, 1)', bdcolor: 'rgba(11, 50, 31, 1)'};
      break;
    case 3:
      return{bgcolor: 'rgba(75, 192, 192, 0.2)', bdcolor: 'rgba(75, 192, 192, 1)'};
      break;
    case 4:
      return{bgcolor: 'rgba(153, 102, 255, 0.2)', bdcolor: 'rgba(153, 102, 255, 1)'};
      break;
    case 5:
      return{bgcolor: 'rgba(255, 159, 64, 0.2)', bdcolor: 'rgba(255, 159, 64, 1)'};
      break;
    case 6:
      return{bgcolor: 'rgba(176, 100, 60, 0.8)', bdcolor: 'rgba(176, 100, 62, 1)'};
      break;
    case 7:
      return{bgcolor: 'rgba(0, 85, 62, 0.6)', bdcolor: 'rgba(0, 85, 50, 1)'};
      break;
    case 8:
      return{bgcolor: 'rgba(0, 85, 149, 0.8)', bdcolor: 'rgba(0, 85, 157, 1)'};
      break;
    case 9:
      return{bgcolor: 'rgba(0, 157, 157, 0.7)', bdcolor: 'rgba(0, 157, 159, 1)'};
      break;
    case 10:
      return{bgcolor: 'rgba(168, 62, 150, 0.87)', bdcolor: 'rgba(229, 82, 205, 1)'};
      break;
    case 11:
      return{bgcolor: 'rgba(229, 91, 31, 0.75)', bdcolor: 'rgba(229, 91, 31, 1)'};
      break;
    case 12:
      return{bgcolor: 'rgba(230, 255, 5, 0.84)', bdcolor: 'rgba(202, 224, 0, 0.99)'};
      break;
    case 13:
      return{bgcolor: 'rgba(255, 99, 132, 0.2)', bdcolor: 'rgba(255,99,132,1)'};
      break;
    case 14:
      return{bgcolor: 'rgba(54, 162, 235, 0.2)', bdcolor: 'rgba(54, 162, 235, 1)'};
      break;
    case 15:
      return{bgcolor: 'rgba(255, 206, 86, 0.2)', bdcolor: 'rgba(255, 206, 86, 1)'};
      break;
    default:
      return{bgcolor: 'rgba(0, 213, 159, 1)', bdcolor: 'rgba(0, 128, 98, 0.84)'};
      break;


  }
}
