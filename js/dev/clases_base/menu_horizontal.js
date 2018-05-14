'use strict'
function MenuHorizontal(contenedor, dataMenu, cb_menu){
  'use strict'
  this.cont=contenedor;
  this.contTodo=document.createElement('div');
  this.contTodo.setAttribute('class', 'menu_horizontal');
  this.cont.appendChild(this.contTodo);
  this.dataMenu=dataMenu;
  this.cb_menu=cb_menu;//calbback function-> return id menu
  this.contMenu=document.createElement('div');

  this.contMenu.setAttribute('class', 'menu_horizontal');
  this.contTodo.appendChild(this.contMenu);
  this.init();
  this.contMenu.style.display='block';
  console.log(this.contMenu);
}
MenuHorizontal.prototype.click=function(){
  var labels=this.contMenu.getElementsByTagName('label');
  for(var i=0;i<labels.length;i++){
    if(labels[i].className=='selected'){
      this.cb_menu(labels[i].idmenu);
      return
    }
  }
};
MenuHorizontal.prototype.init=function(){
  for(var item in this.dataMenu){
    var ul=document.createElement('ul');
    this.contMenu.appendChild(ul);
    ul.setAttribute('class', 'menu_horizontal');
    for(var subitem in this.dataMenu[item]){
      var li=document.createElement('li');
      ul.appendChild(li);
      var label=document.createElement('label');
      label.menuId=this.dataMenu[item][subitem].id;
      label.appendChild(document.createTextNode(subitem));
      li.appendChild(label);
      if(typeof this.dataMenu[item][subitem]['selected'] != 'undefined'){
        if (this.dataMenu[item][subitem]['selected']){
          label.className='selected';
        }
      }
      label.idmenu=this.dataMenu[item][subitem].id;
      var dis=this;
      label.onclick=function(){
        var labels=dis.contMenu.getElementsByTagName('label');
        for(var i=0;i<labels.length;i++){
          if(labels[i]!==this){
            labels[i].className='';
          }
        }
        this.className='selected';
        dis.cb_menu(this.idmenu);
      };
      label.onmouseover=function(){
      };
      label.onmouseout=function(){
        /*
        var labels=document.getElementsByTagName('label');
        for(var i=0;i<labels.length;i++){
          if(labels[i].selected){
            this.className='selected';
            console.log(labels[i]);
          }else{
            labels[i].className='';
          }
        }
        */
      };

    }
  }
};
