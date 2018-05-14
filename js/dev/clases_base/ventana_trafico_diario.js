function VentanaTraficoDiario(contenedor, titulo, dataGrafico, dataTabla ){
  this.contenedor=contenedor;
  //this.contenedor.className='ventana';
  this.contVentana=document.createElement('div');
  this.contenedor.appendChild(this.contVentana);
  this.contVentana.estaPulsado=false;
  this.divTitulo=document.createElement('div');
  this.divTitulo.setAttribute('class', 'titulo_ventana');
  this.divTitulo.ventana=this;
  this.contVentana.appendChild(this.divTitulo);
  this.div=document.createElement('div');
  this.contVentana.appendChild(this.div);
  this.div.style.overflow='auto';

  //this.div.setAttribute('class', 'ventana');

  //this.div.setAttribute('class', 'ventana');
  this.CreaBotonEliminar();
  this.CreaTitulo(titulo);
  this.CreaGrafico(dataGrafico);
  this.CreaTabla(dataTabla);
  this.AddListeners();

  this.contVentana.setAttribute('class', 'ventana');
  this.contVentana.style.display='block';
}
VentanaTraficoDiario.prototype.CreaTabla=function(dataTabla){
  if(typeof dataTabla == 'undefined'){
    return;
  }

  this.divTabla=document.createElement('div');
  this.contVentana.appendChild(this.divTabla);
  this.divTabla.style.overflow='auto';
  var tabla=new Tabla(this.divTabla);
  tabla.Delete();
  tabla.putTitulo(dataTabla.titulo);
  for(var i=0;i<dataTabla.data.length;i++){
    tabla.putData(dataTabla.data[i], dataTabla.titulo);
  }
};
VentanaTraficoDiario.prototype.CreaTitulo=function(titulo){
  var label=document.createElement('label');
  //label.setAttribute('class','ventana');
  label.appendChild(document.createTextNode(titulo));
  this.divTitulo.appendChild(label);
};
VentanaTraficoDiario.prototype.AddListeners=function(){
  if (this.divTitulo.addEventListener){
    this.divTitulo.addEventListener("mousedown", this.ratonPulsado, false);
    this.divTitulo.addEventListener("mouseup", this.ratonSoltado, false);
    document.addEventListener("mousemove", this.ratonMovido, false);
  } else { //Para IE
    this.div.attachEvent('onmousedown', this.ratonPulsado);
    this.div.attachEvent('onmouseup', this.ratonSoltado);
    document.attachEvent('onmousemove', this.ratonMovido);
  }
};
VentanaTraficoDiario.prototype.DeleteListeners=function(){
  this.divTitulo.removeEventListener("mousedown", this.ratonPulsado);
  this.divTitulo.removeEventListener("mouseup", this.ratonSoltado);
  document.removeEventListener("mousemove", this.ratonMovido);
};



VentanaTraficoDiario.prototype.CreaGrafico=function(dataGrafico){
  this.divGrafico=document.createElement('div');
  this.div.appendChild(this.divGrafico);
  this.grafico=new Grafico("", this.divGrafico, dataGrafico.titulo, true, true);
  this.grafico.AddLabels(dataGrafico.labels);
  this.grafico.AddData(dataGrafico.data.arr, dataGrafico.data.nombre,'');
  this.grafico.IniciaGrafico();
};

VentanaTraficoDiario.prototype.CreaBotonEliminar=function(){
  this.botonEliminar=document.createElement('div');
  this.botonEliminar.setAttribute('class', 'ventana_chica');
  var img=document.createElement('img');
  img.src="/images/XRoja.png"
  this.botonEliminar.appendChild(img);
  this.botonEliminar.ventana=this;
  this.botonEliminar.onclick=function(){
    this.ventana.Destroy();
  };
  this.divTitulo.appendChild(this.botonEliminar);
};
VentanaTraficoDiario.prototype.Destroy=function(){
  this.DeleteListeners();
  while(this.contVentana.firstChild){
    this.contVentana.removeChild(this.contVentana.firstChild);
  }
  this.contVentana.style.display='none';
  delete this.contVentana;
};
VentanaTraficoDiario.prototype.ratonPulsado=function(evt){
  this.ventana.contVentana.xInic = evt.clientX;
  this.ventana.contVentana.yInic = evt.clientY;
  this.ventana.contVentana.estaPulsado = true;
  this.ventana.divTitulo.unselectable = true;
  document.ventanaTraficoDiario=this.ventana;
};

VentanaTraficoDiario.prototype.ratonSoltado=function(evt){
  if(typeof document.ventanaTraficoDiario == 'undefined'){
    return;
  }
  document.ventanaTraficoDiario.contVentana.estaPulsado = false;
  //this.contVentana.estaPulsado = false;
};

VentanaTraficoDiario.prototype.ratonMovido=function(evt){
  if(typeof document.ventanaTraficoDiario == 'undefined'){
    return;
  }
  var ventana=document.ventanaTraficoDiario;
  if(!ventana.contVentana.estaPulsado){
    return;
  }
  if(ventana.contVentana.estaPulsado) {

      //Calcular la diferencia de posición
      var xActual = evt.clientX;
      var yActual = evt.clientY;
      var xInc = xActual-ventana.contVentana.xInic;
      var yInc = yActual-ventana.contVentana.yInic;
      ventana.contVentana.yInic = yActual;
      ventana.contVentana.xInic = xActual;

      //Establecer la nueva posición
      var position = ventana.getPosicion(ventana.contVentana);
      ventana.contVentana.style.top = (position[0] + yInc) + "px";
      ventana.contVentana.style.left = (position[1] + xInc) + "px";
  }
};

VentanaTraficoDiario.prototype.getPosicion=function(elemento){
  var posicion = new Array(2);
  if(document.defaultView && document.defaultView.getComputedStyle) {
      posicion[0] = parseInt(document.defaultView.getComputedStyle(elemento, null).getPropertyValue("top"))
      posicion[1] = parseInt(document.defaultView.getComputedStyle(elemento, null).getPropertyValue("left"));
  } else {
      //Para Internet Explorer
      posicion[0] = parseInt(elemento.currentStyle.top);
      posicion[1] = parseInt(elemento.currentStyle.left);
  }
  return posicion;
};
