(function(window, document){
  var iniciaFirebase=function(){

    var config = {
      apiKey: "AIzaSyBoosEXeXS9Yk_8zPseFwplT7DD8sJTgZ4",
      authDomain: "trafico-bca90.firebaseapp.com",
      databaseURL: "https://trafico-bca90.firebaseio.com",
      projectId: "trafico-bca90",
      storageBucket: "trafico-bca90.appspot.com",
      messagingSenderId: "256756269027"
    };
    firebase.initializeApp(config);
    return "Firebase iniciado";
  }
  if (window.FirebaseIniciado === 'undefined' ){
    window.FirebaseIniciado = iniciaFirebase();
  }
})(window, document);
