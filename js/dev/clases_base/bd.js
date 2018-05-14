(function(window, document){
  'use strict'
  var inicio=function(){
    var bd = {
      getData: function( ref, cb_ok, cb_error){
        this.iniciaFirebase();
        firebase.database().ref(ref).once('value').then(function(snapshot){
          cb_ok(snapshot);
        },function(e){
          cb_error(e)
        });
      },
      setData(ref, data, cbOK, cbError){
        this.iniciaFirebase();
        firebase.database().ref(ref).set(data, function(e, ref){
          if (e==null){
            cbOK();
          }else{
            cbError(e);
          }
        });
      },
      deleteData:function(ref, cb_ok, cb_error){
        firebase.database().ref(ref).remove(function(e){
          if(e==null){
            cb_ok();
          }else{
            cb_error(e);
          }
        });
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
    return bd;
  }

  if (typeof window.bd === 'undefined'){
      console.log("window.DataCarga:inicio");
      window.bd = inicio();
  }else {
      console.log("La librería BD.JS está siendo llamada nuevamente");
  }
})(window, document);
