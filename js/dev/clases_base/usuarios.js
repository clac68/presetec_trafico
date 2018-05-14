'use strict'
function Usuarios(bd){
  if (typeof bd=="undefined"){
    console.log("Usuarios: Error: No se le entregó la Base de Datos");
    return;
  }

  bd.iniciaFirebase();
  this.bd=bd;
  this.users={};
  return this;
}

Usuarios.prototype.getCurrentUserName=function(){
  var user= firebase.auth().currentUser;
  if (user == null){
    return user.displayName;
  }
  return "";
}

Usuarios.prototype.isCurrentUserSigned=function(){
  var user= firebase.auth().currentUser;

  if (user == null){
    return false;
  }
  return true;
}
Usuarios.prototype.userResetPassword=function(emailAddress, cb_ok, cb_error){
  this.bd.iniciaFirebase();
  var auth = firebase.auth();
  auth.sendPasswordResetEmail(emailAddress).then(function() {
    cb_ok();
  }).catch(function(error) {
    cb_error(error);
  });
}
Usuarios.prototype.userSignOut=function(nombre, cb_ok, cb_error){
  this.bd.iniciaFirebase();
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
  }).catch(function(error) {
    console.log("userSignOut: ERROR");
    console.log(error);
  });
};

Usuarios.prototype.userSignIn=function(email, pwd, cb_ok, cb_error){
  var dis=this;
  this.bd.iniciaFirebase();
  firebase.auth().signInWithEmailAndPassword(email, pwd).then(function(user){

    var arr=email.split('.');
    var correo=arr.join('');

    dis.bd.getData('/users/'+correo.toUpperCase(), function(usr){

      var b=false;
      var admin=false;
      usr.forEach(function(data){
        if (data.key == 'admin'){
          admin=data.val();
          b=true;
        }
      })
      if(!b){
        cb_error({code:'auth/user-not-found', str:"usuario inválido"});
        return;
      }else{
        cb_ok(admin);
      }
    }, function(e){
      console.error(e);
      cb_error({code:'auth/user-not-found', str:"usuario inválido"});
    });
  },
  function(error) {
    cb_error({code:error.code, msg:error.message});
  });
};

Usuarios.prototype.addUser=function(email, pwd, nombre, esAdmin,  cb_ok, cb_error){
  this.bd.iniciaFirebase();
  var data={nombre:nombre, admin:esAdmin, correo: email};
  var arr=email.split('.');
  var id=arr.join('');
  var dis=this;
  firebase.auth().createUserWithEmailAndPassword(email, pwd).then(function(user){
    dis.addUserBD(id, data,function(){
      cb_ok();
    }, function(e){
      cb_error(e);
    });
  },function(error) {
    if(error.code == 'auth/email-already-in-use'){
      dis.addUserBD(id, data,function(){
        cb_ok();
      }, function(e){
        cb_error(e);
      });
    }else{
      console.log(error);
      cb_error({code:error.code, msg:error.message});
    }
  });
};

Usuarios.prototype.addUserBD=function(nombre, data, cb_ok, cb_error){
  var dis=this;
  this.bd.setData("/users/"+nombre, data, function(){
    dis.users[nombre]=data;
    cb_ok();
  }, function(error){
    console.log(error);
    cb_error({code:'bd/error', msg:error});
  });
}

Usuarios.prototype.updateUser=function(user, nombre, cb_ok, cb_error){
  var dis=this;
  user.displayName=nombre;
  user.updateProfile({
       displayName: nombre
   }).then(function() {
      cb_ok();
   }, function(error) {
       cb_error({code:error.code, msg:error.message});
   });
}
Usuarios.prototype.getUsers=function(cd_ok, cb_error){
  var dis=this;
  this.bd.getData("/users", function(data){
    data.forEach(function(nombre){
      dis.users[nombre.key]=SnapShot2Object(nombre);
    })
    cd_ok(dis.users);
  }, function(e){
    cb_error(e);
  })
};

Usuarios.prototype.deleteUser=function(correo, cb_ok, cb_error){
  var dis=this;
  var path='/users/'+correo;
  this.bd.deleteData(path, function(){
    delete dis.users[correo];
    cb_ok();
  }, function(e){
    console.error(e);
    cb_error(e);
  });
};
