function VentanaValidacionUsuario(bd, config, admin, UsuarioValido){

  this.bd=bd;
  this.admin=admin;
  this.cb=UsuarioValido;
  this.inputCorreo=config.correo;
  this.inputPWD=config.pwd;
  this.buttonSignIn=config.btnValidar;
  this.msg=config.msg;
  this.buttonForgetPassword=config.btnOlvido;

/*
  this.cont=contenedor;
  this.bd=bd;
  this.admin=admin;
  this.cb=UsuarioValido;
  var label=document.createElement('label');
  this.inputCorreo=document.createElement('input');
  this.inputCorreo.type='email';
  label.appendChild(document.createTextNode('Correo'));
  label.appendChild(this.inputCorreo);
  this.cont.appendChild(label);
  var label=document.createElement('label');
  this.inputPWD=document.createElement('input');
  this.inputPWD.type='password';
  label.appendChild(document.createTextNode('Contraseña'));
  label.appendChild(this.inputPWD);
  this.cont.appendChild(label);
  this.buttonSignIn=document.createElement('button');
  this.buttonSignIn.appendChild(document.createTextNode('Validar'));
  this.cont.appendChild(this.buttonSignIn);
  this.buttonForgetPassword=document.createElement('button');
  this.buttonForgetPassword.appendChild(document.createTextNode('¿Olvidaste la contraseña?'));
  this.cont.appendChild(this.buttonForgetPassword);
  this.msg=document.createElement('p');
  this.cont.appendChild(this.msg);

  */
  this.validacion=new Usuarios(this.bd);
  this.init();
  this.ValidaUsuarioYaIngresado();
}
VentanaValidacionUsuario.prototype.msg2User=function(msg){
  this.msg.innerHTML=msg;
};
VentanaValidacionUsuario.prototype.msgError2User=function(e){
  var msg='';
  console.log(e);
  console.log(e.code);
  switch(e.code){
    case 'auth/user_not_admin':
      msg='Lo siento, no tienes permisos para ingresar al administrador. Contáctate con el administrador del servicio';
      break;
    case 'auth/user-not-found':
      msg='Tu correo no corresponde a una cuenta válida. Revisa el correo ingresado o contáctate con el administrador del sistema para que te cree  una cuenta.';
      break;
    case 'auth/invalid-email':
      msg='El correo que ingresaste no es un correo válido. Por favor, cámbialo y reintenta.'
    break;
    case 'auth/wrong-password':
      msg='La contraseña ingresada no es correcta. Por favor, reintenta. Si no recuerdas tu contraseña presiona el botón adjunto.'
      break;
    default:
      msg='Lo siento, hemos tenido problemas para ejecutar la solicitud. Por favor, reintenta';
  }
  this.msg.className='error';
  this.msg.innerHTML='<b>'+msg+'</b>';
  console.log(e);
};

VentanaValidacionUsuario.prototype.inputValida=function(validarCorreo, validarPWD){
  if(validarCorreo){
    if(this.inputCorreo.value.length<=0){
      this.msg2User('Debe ingresar un correo válido.');
      return false;
    }
  }
  if(validarPWD){
    if(this.inputPWD.value.length<8){
      this.msg2User('Debe ingresar una contraseña de al menos 8 caracteres.');
      return false;
    }
  }
  return true;
};
VentanaValidacionUsuario.prototype.init=function(){
  var dis=this;
  this.buttonSignIn.onclick=function(){
    if(!dis.inputValida(true, true)){
      return;
    }
    var email=dis.inputCorreo.value;
    var pwd=dis.inputPWD.value;
    dis.validacion.userSignIn(email, pwd, function(admin){
      dis.inputCorreo.value='';
      dis.inputPWD.value='';

      dis.msg2User('has sido validado correctamente.');
      if(dis.admin){
        if(admin){
          dis.cb(admin);
        }else{
          dis.msgError2User({code:'auth/user_not_admin'});
        }
      }else{
        dis.cb(admin);
      }
    }, function(e){
      console.log(e);
      dis.msgError2User(e);
    });
  };
  this.buttonForgetPassword.onclick=function(){
    if(!dis.inputValida(true, false)){
      return;
    }
    var msg='Te enviaremos un correo a '+dis.inputCorreo.value +' con las instrucciones para cambiar tu contraseña. ¿Deseas continuar?';
    if(!window.confirm(msg)){
      return;
    }
    dis.validacion.userResetPassword(dis.inputCorreo.value, function(){
      dis.msg2User('El correo ha sido enviado. Por favor, revisa tu bandeja de entrada. Este correo podría caer en la bandeja de Spam.');
    }, function(e){
      console.log(e);
      dis.msgError2User(e);
    });
  };
};
VentanaValidacionUsuario.prototype.ValidaUsuarioYaIngresado=function(){
  if(this.validacion.isCurrentUserSigned()){
    console.log('Usuario ya ingresado');
    this.cb();
  }else{
    console.log('Usuario no ha ingresado');
  }
};
