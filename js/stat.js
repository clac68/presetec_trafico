function statDiaria(stat){
  this.valmin=9999999999;
  this.valmax=0;
  this.prom=0;
  this.suma=0;
  this.contador=0;
  this.hora=25;
  if (typeof stat=="undefined"){
    return;
  }
  if (typeof stat.min != "undefined"){
    this.valmin=stat.min;
  }
  if (typeof stat.max != "undefined"){
    this.valmax=stat.min;
  }
  if (typeof stat.prom != "undefined"){
    this.valmin=stat.min;
  }
  if (typeof stat.min != "undefined"){
    this.valmin=stat.min;
  }
  if (typeof stat.min != "undefined"){
    this.valmin=stat.min;
  }
}

statDiaria.prototype.setValMin=function(valor){
  this.suma+=valor;
  this.contador++;
  if (this.valmin > valor){
    this.valmin=valor;
    return true;
  }
  return false;
};

statDiaria.prototype.setValMax=function(valor){
  this.suma+=valor;
  this.contador++;
  if (this.valmax < valor){
    this.valmax = valor;
    return true;
  }
  return false;
};

statDiaria.prototype.getObjMax=function(){

};
