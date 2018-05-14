(function(window, document){
  'use strict'
  var inicio = function(){
    var snapshotData;
    var HayDatos = false;
    var libGetData = {
        getDataXHora: function(eltoLog,central, ruta, ano, mes, dia){
          HayDatos=false;
          var strRuta = "/th/"+central + "/" + ruta  + "/" + ano + "-" + mes + "-" + dia;
          document.getElementsByTagName("h2")[0].innerHTML=strRuta;
          eltoLog.innerHTML="Comenzando";
          try{
            firebase.database().ref(strRuta).once('value').then(function(snapshot){
              snapshotData=snapshot;

              snapshotData.forEach(function(childSnapshot){
                childSnapshot.forEach(function(grandchild){
                  //console.log(childSnapshot.key + ":" + grandchild.key+ ":" + grandchild.val());
                  eltoLog.innerHTML="Datos recuperados"
                  HayDatos=true;
                })});
            });
          } catch(e){
              console.log("error");
          }
            return this;
        },
        graficoxHora: function(eltoTitulo, eltoGrafico, tipoGrafico){
              if (HayDatos){
                snapshotData.forEach(function(childSnapshot){
                  childSnapshot.forEach(function(grandchild){
                    console.log(childSnapshot.key + ":" + grandchild.key+ ":" + grandchild.val());
                })});
              }
        },
        iniciaFirebase: function(){
          var config = {
            apiKey: "AIzaSyBoosEXeXS9Yk_8zPseFwplT7DD8sJTgZ4",
            authDomain: "trafico-bca90.firebaseapp.com",
            databaseURL: "https://trafico-bca90.firebaseio.com",
            projectId: "trafico-bca90",
            storageBucket: "trafico-bca90.appspot.com",
            messagingSenderId: "256756269027"
          };
          firebase.initializeApp(config);
          return this;
        }
    }
    return libGetData;
  }

    if (typeof window.libgetData === 'undefined'){
        window.libgetData = inicio();
    }else {
        console.log("La librería está siendo llamada nuevamente");
    }
})(window, document);
