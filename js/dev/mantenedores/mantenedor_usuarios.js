function MantenedorUsuarios(bd,config){
  this.bd=bd;

  this.cbUsuarios=config.cbUsuarios;
  this.inputCorreo=config.inputCorreo;
  this.inputNombre=config.inputNombre;
  this.checkboxAdministrador=config.checkboxAdministrador;
  this.btnAddUsuario=config.btnAddUsuario;
  this.btnEditUsuario=config.btnEditUsuario;
  this.btnDeleteUsuario=config.btnDeleteUsuario;
  this.btnGetUsers=config.btnGetUsers;

  this.fsAccion=config.fsAccion;
  this.legendAccion=config.legendAccion;
  this.inputNombreAccion=config.inputNombreAccion;
  this.inputCorreoAccion=config.inputCorreoAccion;
  this.checkboxAccionAdministrador=config.checkboxAccionAdministrador;
  this.btnAccion=config.btnAccion;
  this.msg=config.msg;
  this.msgAccion=config.msgAccion;
  this.usuarios=new Usuarios(bd);
  this.init();
}
MantenedorUsuarios.prototype.initInputs=function(){

};
MantenedorUsuarios.prototype.Mayusculas=function(){

};
MantenedorUsuarios.prototype.initcbUsuarios=function(){
  var dis=this;
  this.cbUsuarios.onchange=function(){
    if(dis.cbUsuarios.selectedIndex < 0){
      return;
    }
    var id=dis.cbUsuarios.options[dis.cbUsuarios.selectedIndex].value;
    if(typeof dis.usuarios.users[id] != 'undefined'){
      dis.inputCorreo.value=dis.usuarios.users[id].correo;
      dis.inputNombre.value=dis.usuarios.users[id].nombre;
      dis.checkboxAdministrador.checked=dis.usuarios.users[id].admin;
    }else{
      console.error('Usuario no encontrado en datos de la base de datos');
      console.log(id);
      console.log(dis.usuarios.users);
    }
  };
};
MantenedorUsuarios.prototype.getUsers=function(){

  this.msg2User('Estoy obteniendo los datos desde la Base de datos. Por favor, espera');
  var dis=this;
  this.usuarios.getUsers(function(){
    dis.btnGetUsers.style.display='none';
    dis.msg2User('');
    dis.setcbUsuarios();
  }, function(e){
    msg2User('No fue posible obtener la información de los usuarios desde la base de datos. Intente más tarde');
    console.error(e);
  })
};

MantenedorUsuarios.prototype.initbtnAddUsuario=function(){
  var dis=this;
  this.btnAddUsuario.onclick=function(){
    console.log('initbtnAddUsuario:onclick');
    dis.accion='AGREGAR';
    dis.deleteAccionData();
    dis.btnAccion.innerHTML='Agregar';
    dis.fsAccion.style.display='block';
    dis.legendAccion.innerHTML='Ingresa los datos del nuevo usuario';
  };
};

MantenedorUsuarios.prototype.initbtnEditUsuario=function(){
  var dis=this;
  this.btnEditUsuario.onclick=function(){
    console.log('initbtnEditUsuario:onclick');
    if(dis.cbUsuarios.selectedIndex<0){
      return;
    }
    dis.accion='EDITAR';
    dis.fsAccion.style.display='block';
    dis.btnAccion.innerHTML='Modificar';
    dis.legendAccion.innerHTML='Modifica los datos del usuario. La password no se cambia';
    dis.deleteAccionData();
    var id=dis.cbUsuarios.options[dis.cbUsuarios.selectedIndex].value;
    if(typeof dis.usuarios.users[id]!= 'undefined'){
      dis.inputNombreAccion.value=dis.usuarios.users[id].nombre;
      dis.inputCorreoAccion.value=dis.usuarios.users[id].correo;
      dis.checkboxAccionAdministrador.checked=dis.usuarios.users[id].admin;
    }else{
      console.error('No encontré el usuario a editar');
    }
  };
};
MantenedorUsuarios.prototype.initbtnDeleteUsuario=function(){
  var dis= this;
  this.btnDeleteUsuario.onclick=function(){
    if(dis.cbUsuarios.selectedIndex<0){
      return;
    }
    if(!window.confirm('Estás a punto de eliminar el usuario y no posrá acceder al sistema. ¿Estás seguro?')){
      return;
    }
    var userSelected=dis.cbUsuarios.options[dis.cbUsuarios.selectedIndex].value;
    dis.usuarios.deleteUser(userSelected, function(){
      dis.setcbUsuarios();
    }, function(e){
      console.error(e);
      msg2User('No pude borrar el usuario '+userSelected+' desde la base de datos. Por favor, reintenta más tarde');
    });
  };
};
MantenedorUsuarios.prototype.setcbUsuarios=function(){
  LimpiaComboBox(this.cbUsuarios);
  var cont=0;
  for(var id in this.usuarios.users){
    cont++;
    AddOption2Cb(this.cbUsuarios, id, '', this.usuarios.users[id].nombre);
  }
  this.msg2User('Se cargaron '+cont+' usuarios desde la base de datos.');
  if(this.cbUsuarios.options.length>0){
    this.cbUsuarios.value=this.cbUsuarios.options[0].value;
    this.cbUsuarios.onchange();
  }
};
MantenedorUsuarios.prototype.initbtnGetUsers=function(){
  var dis= this;
  this.btnGetUsers.onclick=function(){
    dis.getUsers();
  };
};
MantenedorUsuarios.prototype.init=function(){
  this.deleteAccionData();
  this.initInputs();
  this.initcbUsuarios();
  this.initbtnAddUsuario();
  this.initbtnEditUsuario();
  this.initbtnDeleteUsuario();
  this.initbtnGetUsers();
  this.initbtnAccion();
  this.fsAccion.style.display='none';
  this.getUsers();
};


MantenedorUsuarios.prototype.validaData=function(){
  var arr=this.inputNombreAccion.value.split(' ');
  if(arr.length<2){
    console.log('Error. El nombre debe tener al menos 2 palabras(nombre y apellido).');
    console.log();
    this.msgAccion2User('Error. El nombre debe tener al menos 2 palabras(nombre y apellido).');
    return false;
  }
  if(this.inputCorreoAccion.value.inst<1){
    console.log('Error. El correo no puede ser vacío.');
    this.msgAccion2User('Error. El correo no puede ser vacío.');
    return false;
  }
  return true;
};

MantenedorUsuarios.prototype.initbtnAccion=function(){
  var dis= this;
  this.btnAccion.onclick=function(){
    console.log('initbtnAccion:onclick');
    console.log('dis.accion');
    dis.msgAccion2User('');
    if (dis.accion='AGREGAR'){
      if (dis.validaData()){
        dis.usuarios.addUser(dis.inputCorreoAccion.value, 'presetec',
            dis.inputNombreAccion.value, dis.checkboxAccionAdministrador.checked, function(){
          dis.msg2User('El usuario '+dis.inputNombreAccion.value+' fue agregado exitosamente');
          dis.fsAccion.style.display='none';
          dis.setcbUsuarios();
        }, function(e){
          console.error(e);
          dis.msgError2User(e);
        });
      }
    }else{
      dis.usuarios.addUser(dis.inputCorreoAccion.value, 'presetec',
          dis.inputNombreAccion.value, dis.checkboxAccionAdministrador.checked, function(){
        dis.msg2User('El usuario '+dis.inputNombreAccion.value+' fue modificado exitosamente');
        dis.fsAccion.style.display='none';
        dis.setcbUsuarios();
      }, function(e){
        console.error(e);
        dis.msgError2User(e);
      });
    }
  };
};
MantenedorUsuarios.prototype.msgError2User=function(e){
  switch (e.code) {
    case 'auth/invalid-email':
      this.msgAccion.innerHTML='Error. El correo es inválido. No se pudo finalizar la acción solicitada';
      break;
    case 'auth/weak-password':
      this.msgAccion.innerHTML='Error. La contraseña debe tener al menos 6 caracteres. Por favor, intenta nuevamente';
      break;
    default:
      this.msgAccion.innerHTML='Error. No se pudo finalizar la acción solicitada';
  }
};
MantenedorUsuarios.prototype.deleteAccionData=function(){
  this.legendAccion.innerHTML='';
  this.inputNombreAccion.value='';
  this.inputCorreoAccion.value='';
  this.inputCorreoAccion.disabled=false;
  this.checkboxAccionAdministrador.checked=false;
  this.msgAccion.innerHTML='';
};

MantenedorUsuarios.prototype.msg2User=function(msg){
  this.msg.innerHTML=msg;
};
MantenedorUsuarios.prototype.msgAccion2User=function(msg){
  this.msgAccion.innerHTML=msg;
};
