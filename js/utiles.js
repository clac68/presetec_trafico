function LimpiaComboBox(cb){
  while(cb.options.length>0){
    cb.remove(0);
  }
}

function DisplayHide(obj, display){
  if (display){
    obj.style.display="initial";
    return;
  }
  obj.style.display="none";
}

function AddMsg2Contenedor(contenedor, msg){
  if (typeof contenedor != 'undefined'){
    contenedor.appendChild(document.createTextNode(msg));
  }
}

function RemoveChilds(contenedor){
  while(contenedor.childNodes.length>0){
    contenedor.removeChild(contenedor.childNodes[0]);
  }
}

function AddOption2Cb(cb, valor, desc, texto){

    var elto=document.createElement("option");
    elto.setAttribute("class", "opcClass");
    elto.setAttribute("value", valor);
    elto.setAttribute("title", desc);
    elto.appendChild(document.createTextNode(texto));
    cb.add(elto);
}

function getDiasDelMes(ano, mes){
  var primerDia = new Date(ano, mes-1, 1);
  var ultimoDia = new Date(ano, mes , 0);
  if (ultimoDia.getDate() <=0){
    return 30;
  }
  return ultimoDia.getDate();
}

function SnapShot2Object(snapshot){
  var obj={};
  snapshot.forEach(function(data){
    obj[data.key]=data.val();
  })
  return obj;
}

function CreaBotonConImagen(document, texto, imagen, alto, ancho){
  var btn=document.createElement("button");
  var img=document.createElement("img");
  img.setAttribute("src", imagen);
  img.setAttribute("height", alto);
  img.setAttribute("width", ancho);
  btn.appendChild(img);
  return btn;
}

function CreaCanvas(document, id, ancho, alto){
  var cv=document.createElement("canvas");
  cv.setAttribute("width", ancho);
  cv.setAttribute("height", alto);
  if (id.length>0){
    cv.setAttribute("id", id);
  }
  return cv;
}

function CreaSpan(document, id, texto){
  var span=document.createElement("span");
  if (id.length>0){
    span.setAttribute("id", id);
  }
  var nodotexto= document.createTextNode(texto);
  span.appendChild(nodotexto);
  return span;
}

function downloadCSV(csv, filename) {
    var csvFile;
    var downloadLink;

    // CSV file
    csvFile = new Blob([csv], {type: "text/csv"});

    // Download link
    downloadLink = document.createElement("a");

    // File name
    downloadLink.download = filename;

    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);
    console.log(downloadLink.href);
    console.log(downloadLink.href.HTMLMediaElement);

    // Hide download link
    downloadLink.style.display = "none";

    // Add the link to DOM
    document.body.appendChild(downloadLink);
    console.log(downloadLink);
    // Click download link
    downloadLink.click();
}

function AddRadioButton(contenedor, grupo, clase, texto){
  var label=document.createElement('label');
  label.className=clase;
  label.className+=', radio_button';
  label.appendChild(document.createTextNode(texto));
  var rb=document.createElement('input');
  rb.type='radio';
  rb.name=grupo;
  label.appendChild(rb);
  var span=document.createElement('span');
  span.className='checkmark'
  label.appendChild(span);
  contenedor.appendChild(label);
  console.log(label.className);
  return rb;
}
