function Menu(contenedor,dataMenu, onSelectedMenu){
  this.cont=contenedor;
  this.dataMenu=dataMenu;
  this.onSelectedMenu=onSelectedMenu;
  this.init();
}

Menu.prototype.show=function(dataSelected, x,y){
  this.dataSelected=dataSelected;
  var a=Object.assign({},this.contMenu.class);
  a=Object.assign({},this.contMenu.style);
  this.contMenu.style.top=y+'px';
  this.contMenu.style.left=x+'px';
  this.contMenu.style.display='block';

  var a=Object.assign({},this.contMenu.class);
  a=Object.assign({},this.contMenu.style);

};
Menu.prototype.hide=function(){
  this.contMenu.style.display='none';
};
Menu.prototype.init=function(){
  var dis=this;
  this.contMenu=document.createElement('div');
  this.contMenu.setAttribute('class', 'menu');
  this.contMenu.onmouseleave=function(){
    dis.hide();
  };
  this.hide();
  this.cont.appendChild(this.contMenu);
  if(typeof this.dataMenu.titulo !='undefined'){
      var titulo = document.createElement('label');
      titulo.setAttribute('class', 'menu');
      titulo.innerHTML=this.dataMenu.titulo;
      this.contMenu.appendChild(titulo);
      this.contMenu.appendChild(document.createElement('br'));
  }
  for(var data in this.dataMenu){
    var item = document.createElement('button');
    item.style.display='block';
    item.setAttribute('class', 'menu');
    item.innerHTML=data;
    item.opcion=this.dataMenu[data];
    item.dataSelected=this.dataSelected;
    this.contMenu.appendChild(item);
    item.onclick=function(){
      if (typeof dis.onSelectedMenu != 'undefined'){
        dis.hide();
        dis.onSelectedMenu(dis.dataSelected, this.opcion, this.innerHTML)
      }
    };
  }
};

Menu.prototype.Destroy=function(){
  if(typeof this.contMenu=='undefined'){
    return;
  }
  while(this.contMenu.firstChild){
    this.contMenu.removeChild(this.contMenu.firstChild);
  }
  delete this.contMenu;
};
