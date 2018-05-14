function Tabla(objParent){
  this.parent = objParent;
  while(objParent.childNodes.length>0){
    objParent.removeChild(objParent.childNodes[0]);
  }
  this.contTabla=document.createElement('div');
  this.contTabla.width='100%';
  this.contTabla.overflow='auto';
  this.contMenu=document.createElement('div');

  this.table=document.createElement('TABLE');
  this.contTabla.appendChild(this.table);
  this.table.miobj=this;

  this.parent.appendChild(this.contMenu);
  this.parent.appendChild(this.contTabla);
}

Tabla.prototype.enableMenu=function(filename){
  var dis=this;
  this.filename=filename;
  if(typeof this.menu != 'undefined'){
    delete this.menu;
  }
  this.menu=new Menu(this.parent,{'descargar':1}, function(){
    dis.exportTableToCSV(dis.filename+'.csv');
  });
  this.contTabla.oncontextmenu=function(e){
    e.preventDefault();
    e.stopPropagation();
    dis.menu.show({}, e.pageX, e.pageY);
  };
};
Tabla.prototype.Show=function(arrTitulo, arrData){
  this.AddRow(true, arrTitulo);
  for (var i=0; i<arrData.length;i++){
    if (arrTitulo.length=arrData[i].length){
      this.AddRow(false, arrData[i]);
    }
  }
  return this;
}

Tabla.prototype.AddRow=function(titulo, arrData){

  var row=document.createElement('TR');
  this.table.appendChild(row);
  for(var i=0; i<arrData.length;i++){
    if(titulo){
      var td=document.createElement('TH');
    }else{
      var td=document.createElement('TD');
    }
    //td.setAttribute('style', 'background-color: blue;color:red;')
    row.appendChild(td);
    var cell = document.createTextNode(arrData[i]);
    if (titulo){
      var negrita=document.createElement('b');
      negrita.appendChild(cell);
      td.appendChild(negrita);
    }else{
      td.appendChild(cell);
    }
  }
};

Tabla.prototype.Delete=function(){
  while(this.table.rows.length>0){
    this.table.deleteRow(0);
  }
  return this;
};

Tabla.prototype.Test=function(columnas, filas){
  var arrTitulo=[];
  for(var i=0; i<columnas;i++){
    arrTitulo.push('Tit'+i);
  }
  var arrData=[];
  for(var i=0; i<filas;i++){
    arrData[i]=[];
    for(var j=0;j<columnas;j++){
      arrData[i][j]='dato'+i+j;
    }
  }
  this.Show(arrTitulo, arrData);
};

Tabla.prototype.exportTableToCSV=function(filename) {
    var csv = [];
    for(var i=0; i<this.table.childNodes.length;i++){
      var arrData=[];
      var row=this.table.childNodes[i];
      for (var j=0;j<row.childNodes.length;j++){
        var campo=row.childNodes[j];
        for(var k=0; k<campo.childNodes.length;k++){
          if(campo.childNodes[k].nodeType==3){
            arrData.push(campo.childNodes[k].textContent);
          }
        }

      }
      csv.push(arrData.join(","));
    }
    //decodeURIComponent(
    //console.log(csv);
    // Download CSV file
    downloadCSV(csv.join('\r\n'), filename);
}

Tabla.prototype.putTitulo=function( objTitulo ){
  var row=document.createElement('TR');
  this.table.appendChild(row);
  for(var param in objTitulo){
    this.createTH(row, objTitulo[param]);
  }
};

Tabla.prototype.putData=function(objData, objTitulo ){
  var row=document.createElement('TR');
  this.table.appendChild(row);
  for(var param in objTitulo){
    if (typeof objData[param] != 'undefined'){
      this.createTD(row, objData[param]);
    }else{
      this.createTD(row, "ERROR");
    }
  }
};

Tabla.prototype.createTD=function(row, data){
    var td=document.createElement('TD');
    row.appendChild(td);
    var cell = document.createTextNode(data);
    td.appendChild(cell);
};

Tabla.prototype.createTH=function(row, data){
    var td=document.createElement('TH');
    row.appendChild(td);
    var cell = document.createTextNode(data);
    td.appendChild(cell);
};
