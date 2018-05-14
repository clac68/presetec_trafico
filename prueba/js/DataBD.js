'use strict'

function Central(idCentral, nombreCentral){
  //var rutas = new Array();
  var idCentral, nombreCentral;
  this.idCentral = idCentral;
  this.nombreCentral = nombreCentral;
  this.rutas = new Array();
  console.log("rutas=" + this.rutas);
}

Central.prototype.getId =  function(){
  return this.idCentral;
};

Central.prototype.getNombre = function(){
  return this.nombreCentral;
};

Central.prototype.getRutas = function(){

  console.log("rutas=" + this.rutas);
  return this.rutas;
};

/****************************************
idRuta es el nombre interno que se obtiene de los reportes de tráfico
nombreRuta: es el nombre que se muestra al usuario.
senalizacionRuta es el tipo de señalización: "S7"/"SIP"/"R2"
tipoRuta es una defición interna que toma tres valores: "TANDEM"/"INTERNA"/
*/
function Ruta(idRuta, nombreRuta, descripcionRuta, senalizacionRuta, tipoRuta){
  var id, nombre,descripcion,senalizacion,tipo;
  this.id=idRuta;
  this.nombre=nombreRuta;
  this.descripcion=descripcionRuta;
  this.senalizacion=senalizacionRuta;
  this.tipo=tipoRuta;
}

Ruta.prototype.getId=function(){
  return this.id;
};

Ruta.prototype.getNombre=function(){
  return this.nombre;
};
Ruta.prototype.getDescripcion=function(){
  return this.descripcion;
};
Ruta.prototype.getSenalizacion=function(){
  return this.senalizacion;
}
Ruta.prototype.getTipo=function(){
  return this.tipo;
};

function ListaTraficoXHora(){
  var arrTraficoXHora = new Array();
}

ListaTraficoXHora.prototype.getArray=function(){
  return this.arrTraficoxHora;
};

ListaTraficoXHora.prototype.Sort=function(){
  arrTraficoxHora.sort(function(a,b){
    if ((typeof a === "DataTraficoXHora") && (typeof b === "DataTraficoXHora")){
      return val(a.getHora())-val(b.getHora());
    }
  });
};

function DataTraficoXHora(central, ruta, fecha, hora, circuitos1, circuitos2, intentos, desborde, n98,conectados, c70, respuesta, totu, totue, mbu, sbu, tru, colisiones, ocupacion){

  this.central = central;
  this.ruta = ruta;
  this.fecha = fecha;
  this.hora=hora;
  this.circuitos1 = circuitos1;
  this.circuitos2 = circuitos2;
  this.intentos = intentos;
  this.desborde = desborde;
  this.n98 = n98;
  this.conectados = conectados;
  this.c70 = c70;
  this.respuesta = respuesta;
  this.totu = totu;
  this.totue = totue;
  this.mbu= mbu;
  this.sbu = sbu;
}

DataTraficoXHora.prototype.getCentral=function(){
  return this.central;
};
DataTraficoXHora.prototype.getRuta=function(){
  return this.ruta;
};
DataTraficoXHora.prototype.getFecha=function(){
  return this.fecha;
};
DataTraficoXHora.prototype.getHora=function(){
  return this.hora;
};
DataTraficoXHora.prototype.getCircuitos1=function(){
  return this.circuitos1;
};
DataTraficoXHora.prototype.getCircuitos2=function(){
  return this.circuitos2;
};
DataTraficoXHora.prototype.getIntentos=function(){
  return this.intentos;
};
DataTraficoXHora.prototype.getDesborde=function(){
  return this.desborde;
};
DataTraficoXHora.prototype.getN98=function(){
  return this.n98;
};
DataTraficoXHora.prototype.getConectados=function(){
  return this.conectados;
};
DataTraficoXHora.prototype.getC70=function(){
  return this.c70;
};
DataTraficoXHora.prototype.getRespuesta=function(){
  return this.respuesta;
};
DataTraficoXHora.prototype.getTotu=function(){
  return this.totu;
};
DataTraficoXHora.prototype.getTotue=function(){
  return this.totue;
};
DataTraficoXHora.prototype.getMbu=function(){
  return this.mbu;
};
DataTraficoXHora.prototype.getSbu=function(){
  return this.sbu;
};
