function VentanaCargaDatos(contenedor, cb_fin){
  this.cont=contenedor;
  this.cb_fin=cb_fin;
  this.checkboxes=[];
  this.progress=null;
  this.getEltos(this.cont);
  if(this.progress != null){
    this.progress.max=this.checkboxes.length;
    this.progress.value=0;
  }
  var dis=this;
  for(var i=0; i<this.checkboxes.length;i++){
    //this.checkboxes[i].disabled=true;
    this.checkboxes[i].onchange=function(){
      dis.show();
    };
  }
}


VentanaCargaDatos.prototype.getEltos=function(cont){
  for(var i=0; i<cont.childNodes.length;i++){

    var elto=cont.childNodes[i];
    if(elto.nodeType==1){
      //console.log(elto.type);
      if(elto.nodeName=='INPUT'){
        if(elto.type=='checkbox'){
          this.checkboxes.push(elto);
        }
      }
      if(elto.nodeName=='PROGRESS'){
        this.progress=elto;
      }
    }
    this.getEltos(elto);
  }
};

VentanaCargaDatos.prototype.show=function(){
  var contChecked=0;
  for(var i=0; i<this.checkboxes.length;i++){
    if(this.checkboxes[i].checked){
      contChecked++;
    }
  }
  if(this.progress != null ){
    this.progress.value=contChecked;
  }

  if(this.checkboxes.length==contChecked){
    if(typeof this.cb_fin=='function'){
      this.cb_fin();
    }
  }
};
