var http=require('http');
var manejador=function(solicitud, respuesta){
  //console.log(solicitud);
  respuesta.end('Felicitaciones CLAC');
};
var servidor=http.createServer(manejador);
servidor.listen(9000);
