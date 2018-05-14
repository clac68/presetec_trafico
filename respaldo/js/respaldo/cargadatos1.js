/*****
DataxHora contendrá la información rescatada del html de vtr. Tiene un formato:
central{
  ruta{
    fecha
    circuitos
    etc..
}
}
*/
(function(window, document){
  'use strict'
  var inicio=function(){
    var DataCarga = {
      cargaRutas: function(central, fecha, rutas){
        for(var i=0; i<rutas.length;i++){
          firebase.database().ref( "tm/" + fecha + "/" + central + "/"+ ruta[i][0] ).set({
            circ: ruta[i][1],
            sen: ruta[i][2],
            nem: ruta[i][3],
            tipo: ruta[i][4],
            dir: ruta[i][5],
            area: ruta[i][6],
            cod: ruta[i][7],
            inf: ruta[i][8],
            pco: ruta[i][9],
            pcd: ruta[i][10],
            sis: ruta[i][11],
          });
        }
      },
      cargaHtml:function(htmlData){
        var fechaIni = new Date();
        console.log("cargaHtml: Inicio:"+fechaIni);
        this.iniciaFirebase();
        var parser, htmlDoc, eltosTR, eltosTD;
        try{
          parser = new DOMParser();
          htmlDoc=parser.parseFromString(htmlData, "text/html")
          eltosTR = htmlDoc.getElementsByTagName("tr");
          eltosTD = htmlDoc.getElementsByTagName("td");
        } catch(e){
          console.log("Error Parsing html:" + e);
          return this;
        }
        if ( eltosTD.length != eltosTR.length * 23 ){
          console.log("Error Parsing html:" + "Archivo no tiene el formato esperado");
          return this;
        }
        var central, ruta, fecha, hora;
        for(var i=1; i<eltosTR.length;i++){
          if (i>1){
            central = eltosTD[(i-1)*23+5].textContent.trim();
            ruta = eltosTD[(i-1)*23+7].textContent.trim();
            fecha = eltosTD[(i-1)*23+1].textContent.trim()+"-"+eltosTD[(i-1)*23+2].textContent.trim()+"-"+eltosTD[(i-1)*23+3].textContent.trim();
            hora=eltosTD[(i-1)*23+4].textContent.split(":",2)[0].trim();
            firebase.database().ref( "th/" + central + "/"+ ruta + "/" + fecha + "/" + hora).set({
              fec: fecha,
              hor: hora,
              cic1: eltosTD[(i-1)*23+8].textContent,
              cic2: eltosTD[(i-1)*23+9].textContent,
              int: eltosTD[(i-1)*23+10].textContent,
              dbd: eltosTD[(i-1)*23+11].textContent,
              n98: eltosTD[(i-1)*23+12].textContent,
              con: eltosTD[(i-1)*23+13].textContent,
              c70: eltosTD[(i-1)*23+14].textContent,
              rsp: eltosTD[(i-1)*23+15].textContent,
              totu: eltosTD[(i-1)*23+16].textContent,
              totue: eltosTD[(i-1)*23+17].textContent,
              mbu: eltosTD[(i-1)*23+18].textContent,
              sbu: eltosTD[(i-1)*23+19].textContent,
              tru: eltosTD[(i-1)*23+20].textContent,
              coli: eltosTD[(i-1)*23+21].textContent,
              ocp: eltosTD[(i-1)*23+22].textContent,
            });
          }
        }
        var fechaFin = new Date();
        console.log("cargaHtml: Segundos de Carga: "+(fechaFin.getMilliseconds()-fechaIni.getMilliseconds())/1000);
        return this;
      },
      iniciaFirebase: function(){
        if (!firebase.apps.length) {
          console.log("inciando BD Firebase. clac");
          var config = {
            apiKey: "AIzaSyBoosEXeXS9Yk_8zPseFwplT7DD8sJTgZ4",
            authDomain: "trafico-bca90.firebaseapp.com",
            databaseURL: "https://trafico-bca90.firebaseio.com",
            projectId: "trafico-bca90",
            storageBucket: "trafico-bca90.appspot.com",
            messagingSenderId: "256756269027"
          };
          firebase.initializeApp(config);
        }
        return this;
      }
    }
    return DataCarga;
  }

  if (typeof window.DataCarga === 'undefined'){
      window.DataCarga = inicio();
  }else {
      console.log("La librería está siendo llamada nuevamente");
  }
})(window, document);
