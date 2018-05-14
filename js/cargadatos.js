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
    var contador = 0;
    var totRegistros = 0;
    var arrErrores = [];
    var DataCarga = {
      getErrores: function(){
        return arrErrores;
      },
      getContadorRegistros: function(){
        return contador;
      },
      getErlangsdeBD: function(){
        this.iniciaFirebase();
        firebase.database().ref("/erlangs/").once('value').then(function(snapshot){
          var arrErlang=[];
          snapshot.forEach(function(erlang){
            arrErlang.push([erlang.key, erlang.val()]);
          });
          document.dispatchEvent(new CustomEvent("get_erlangs", {detail:{res:"OK", error:"", erlangs: arrErlang},bubbles: true, cancelable:true}));
        }
        ,function(e){
          document.dispatchEvent(new CustomEvent("get_erlangs", {detail:{res:"ERROR", error:e, erlangs: null},bubbles: true, cancelable:true}));
        });
      },
      cargaErlangs: function(arrErlangs){
        var data={};
        for(var i=0; i<arrErlangs.length; i++){
          console.log(arrErlangs[i]);
          data[arrErlangs[i][0]]={};
          data[arrErlangs[i][0]]=arrErlangs[i][1];
        }
        console.log(data);

        this.iniciaFirebase();
        firebase.database().ref( "/erlangs/").set(data, function(error, ref){
          if (error != null){
            document.dispatchEvent(new CustomEvent("save_erlangs", {detail:{res:"ERROR", error:error},bubbles: true, cancelable:true}));
          }else{
            document.dispatchEvent(new CustomEvent("save_erlangs", {detail:{res:"OK", error:null},bubbles: true, cancelable:true}));
          }
        });
      },
      getRutasDeCentral: function(ano, mes){
        var central, ruta, circuitos, senalizacion, nemo, tipoTrafico, direccion,ciudad, area, informacion, pco, pcd, sistema ;
        this.iniciaFirebase();
        firebase.database().ref("/rutas/" + ano + "-" + mes).once('value').then(function(snapshot){
          var arrRutas = [];
          snapshot.forEach(function(cCentral){
            cCentral.forEach(function(cRuta){
              cRuta.forEach(function(cDatosRuta){
                if (cDatosRuta.key.includes("circ")){
                  circuitos = cDatosRuta.val();
                }
                if (cDatosRuta.key.includes("sen")){
                  senalizacion = cDatosRuta.val();
                }
                if (cDatosRuta.key.includes("nem")){
                  nemo = cDatosRuta.val();
                }
                if (cDatosRuta.key.includes("tipo")){
                  tipoTrafico = cDatosRuta.val();
                }
                if (cDatosRuta.key.includes("dir")){
                  direccion = cDatosRuta.val();
                }
                if (cDatosRuta.key.includes("ciudad")){
                  ciudad = cDatosRuta.val();
                }
                if (cDatosRuta.key.includes("area")){
                  area = cDatosRuta.val();
                }
                if (cDatosRuta.key.includes("inf")){
                  informacion = cDatosRuta.val();
                }
                if (cDatosRuta.key.includes("pco")){
                  pco = cDatosRuta.val();
                }
                if (cDatosRuta.key.includes("pcd")){
                  pcd = cDatosRuta.val();
                }
                if (cDatosRuta.key.includes("sis")){
                  sistema = cDatosRuta.val();
                }
              })
              AgregaRuta(arrRutas, cCentral.key, cRuta.key, [circuitos, senalizacion, nemo, tipoTrafico, direccion,ciudad, area, informacion, pco, pcd, sistema]);
            })
          });
          document.dispatchEvent(new CustomEvent("get_rutascentral", {detail:{res:"OK", error:"", rutasCentral: arrRutas},bubbles: true, cancelable:true}));
        },function(e){
          console.log(e);
          document.dispatchEvent(new CustomEvent("get_rutascentral", {detail:{res:"ERROR", error:e},bubbles: true, cancelable:true}));
        });
      },
      cargaRutasDeCentral: function(central, fecha, rutas){
        this.iniciaFirebase();
        var arrError = new Array();
        totRegistros = rutas.length;
        for(var i=0; i<rutas.length;i++){

          firebase.database().ref( "rutas/" + fecha + "/" + central + "/"+ rutas[i][0] ).set({
            circ: rutas[i][1],
            sen: rutas[i][2],
            nem: rutas[i][3],
            tipo: rutas[i][4],
            dir: rutas[i][5],
            area: rutas[i][6],
            cod: rutas[i][7],
            inf: rutas[i][8],
            pco: rutas[i][9],
            pcd: rutas[i][10],
            sis: rutas[i][11],
          }, function(e, ref){
            contador++;
            if (e != null){
              arrErrores.push(e);
              document.dispatchEvent(new CustomEvent("carga_rutas", {detail:{res:"ERROR",error:e, regTotal:rutas.length, regProcesados:contador},bubbles: true, cancelable:true}));
            }else{
              document.dispatchEvent(new CustomEvent("carga_rutas", {detail:{res:"OK",error:e, regTotal:rutas.length, regProcesados:contador},bubbles: true, cancelable:true}));
            }
          });
        }
      },
      /*
      cargaRutasDeCentral: function(ano, mes, central, ruta, circuitos, senalizacion, nemo, tipoTrafico, direccion,ciudad, area, informacion, pco, pcd, sistema ){
        this.iniciaFirebase();
        console.log("cargaRutasDeCentral:inicio");
        firebase.database().ref("/rutas/"+ano+"-"+mes+"/"+central+"/"+ruta ).set({
          circ: circuitos,
          sen: senalizacion,
          nemo: nemo,
          tt:tipoTrafico,
          dir: direccion,
          ciudad: ciudad,
          area: area,
          inf: informacion,
          pco: pco,
          pcd: pcd,
          sist: sistema
        }, function(e, ref){
          if (e != null){
            document.dispatchEvent(new CustomEvent("carga_rutascentral", {detail:{res:"ERROR", error:e},bubbles: true, cancelable:true}));
          }else{
            document.dispatchEvent(new CustomEvent("carga_rutascentral", {detail:{res:"OK",error:e},bubbles: true, cancelable:true}));
          }
        });
      },
      */
      borraRutasDeCentral: function(ano, mes, central){
        this.iniciaFirebase();
        //console.log("borraré el siguiente directorio;/" + centrales + "/" +codigo);
        firebase.database().ref( "/rutas/"+ano+"-"+mes+"/"+central ).remove(function(e){
          if (e !=null){
            document.dispatchEvent(new CustomEvent("borra_rutascentral", {detail:{res:"ERROR", error:e},bubbles: true, cancelable:true}));
          }else{
            document.dispatchEvent(new CustomEvent("borra_rutascentral", {detail:{res:"OK", error:null},bubbles: true, cancelable:true}));
          }
        });
      },
      getNemos: function(){
        this.iniciaFirebase();
        firebase.database().ref("/nemos").once('value').then(function(snapshot){
          var nemo="";
          var arrNemos = new Array();
          snapshot.forEach(function(child){
            child.forEach(function(grandchild){
              if (grandchild.key.includes("nemo")){
                nemo = grandchild.val();
              }
            })
            arrNemos.push([ child.key, nemo]);
          });
          document.dispatchEvent(new CustomEvent("get_nemos", {detail:{res:"OK", error:"", nemos: arrNemos},bubbles: true, cancelable:true}));
        },function(e){
          console.log(e);
          document.dispatchEvent(new CustomEvent("get_nemos", {detail:{res:"ERROR", error:e},bubbles: true, cancelable:true}));
        });
      },
      cargaNemo: function(nombre, codigo, masivo){
        this.iniciaFirebase();
        console.log("cargaNemo:inicio");
        firebase.database().ref("/nemos/"+codigo ).set({
          nemo: nombre
        }, function(e, ref){
          if (e != null){
            if (!masivo){
              document.dispatchEvent(new CustomEvent("carga_nemo", {detail:{res:"ERROR", error:e},bubbles: true, cancelable:true}));
            }
          }else{
            if (!masivo){
              document.dispatchEvent(new CustomEvent("carga_nemo", {detail:{res:"OK",error:e},bubbles: true, cancelable:true}));
            }
          }
        });
      },
      borraNemo: function(codigo){
        this.iniciaFirebase();
        //console.log("borraré el siguiente directorio;/" + centrales + "/" +codigo);
        firebase.database().ref( "/nemos/"+codigo ).remove(function(e){
          if (e !=null){
            document.dispatchEvent(new CustomEvent("borra_nemo", {detail:{res:"ERROR", error:e},bubbles: true, cancelable:true}));
          }else{
            document.dispatchEvent(new CustomEvent("borra_nemo", {detail:{res:"OK", error:null},bubbles: true, cancelable:true}));
          }
        });
      },
      getCentrales: function(){
        this.iniciaFirebase();
        firebase.database().ref("/centrales").once('value').then(function(snapshot){
          var nombre, descripcion;
          var arrCentrales = new Array();
          snapshot.forEach(function(child){
            child.forEach(function(grandchild){
              if (grandchild.key.includes("nombre")){
                nombre = grandchild.val();
              }
              if (grandchild.key.includes("desc")){
                descripcion = grandchild.val();
              }
            })
            arrCentrales.push([ nombre, child.key, descripcion]);
          });
          document.dispatchEvent(new CustomEvent("get_centrales", {detail:{res:"OK", error:"", centrales: arrCentrales},bubbles: true, cancelable:true}));
        },function(e){
          console.log(e);
          document.dispatchEvent(new CustomEvent("get_centrales", {detail:{res:"ERROR", error:e},bubbles: true, cancelable:true}));
        });
      },
      cargaCentral: function(nombre, codigo, descripcion){
        this.iniciaFirebase();
        console.log("cargaCentral:inicio");
        try{
          firebase.database().ref("/centrales/"+codigo ).set({
            nombre: nombre,
            desc:descripcion,
          }, function(e, ref){
            if (e != null){
              document.dispatchEvent(new CustomEvent("carga_central", {detail:{res:"ERROR", error:e},bubbles: true, cancelable:true}));
            }else{
              document.dispatchEvent(new CustomEvent("carga_central", {detail:{res:"OK",error:e},bubbles: true, cancelable:true}));
            }
          });
        }catch(e){
          console.log("Error al invocar función set en firebase:" + e);
        }
      },
      borraCentral: function(codigo){
        this.iniciaFirebase();
        //console.log("borraré el siguiente directorio;/" + centrales + "/" +codigo);
        firebase.database().ref( "/centrales/"+codigo ).remove(function(e){
          if (e !=null){
            document.dispatchEvent(new CustomEvent("borra_central", {detail:{res:"ERROR", error:e},bubbles: true, cancelable:true}));
          }else{
            document.dispatchEvent(new CustomEvent("borra_central", {detail:{res:"OK", error:null},bubbles: true, cancelable:true}));
          }
        });
      },
      getData: function(id, ref){
        this.iniciaFirebase();
        firebase.database().ref(ref).once('value').then(function(snapshot){
          document.dispatchEvent(new CustomEvent("get_data", {detail:{id: id, res:"OK", error:null, data: snapshot},bubbles: true, cancelable:true}));
        },function(e){
          document.dispatchEvent(new CustomEvent("get_data", {detail:{id: id, res:"ERROR", error:e, data: snapshot},bubbles: true, cancelable:true}));
        });
      },
      setData(id, ref, data){
        this.iniciaFirebase();
        firebase.database().ref(ref).set(data, function(e, ref){
          if (e!=null){
            document.dispatchEvent(new CustomEvent("set_data", {detail:{id: id, res:"ERROR", error:e},bubbles: true, cancelable:true}));
          }else{
            document.dispatchEvent(new CustomEvent("set_data", {detail:{id: id, res:"OK", error:e},bubbles: true, cancelable:true}));
          }
        });
      },
      pruebaMasiva:function(ano,mes,dia,central, data){
        this.iniciaFirebase();
        firebase.database().ref( "/trafico/"+ano+"/"+mes+"/"+dia+"/"+central+"/").set(data, function(error, ref){
          console.log(error);
        });
      },
      pruebaFirebase: function(id){

        this.iniciaFirebase();
        console.log("pruebaFirebase");
        firebase.database().ref( "/CLAC/" ).set({
          dato: "Prueba",
          saludo: "me doy",
          obj1:{d1:"1", d2:2},
          obj2:{d1:"3", d2: 4}
        },function(error, ref){
          console.log("Fin. Error:" + error);

          if (error !=null){
            console.log("error");

          }else{
            console.log("ok");

            document.dispatchEvent(new CustomEvent("carga_ok", {detail:{msg:"hola"},bubbles: true, cancelable:true}));

            //dispatchEvent(evtCargaError)
          }

        });
      },
      cargaHtml:function(htmlData){
        this.iniciaFirebase();
        var fechaIni = new Date();
        console.log("cargaHtml: Inicio:"+fechaIni + "-Milisegundos:" + fechaIni.getTime());
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

        console.log("cargaHtml: Fin:"+fechaIni + "-Milisegundos:" + fechaFin.getTime());
        console.log("cargaHtml: Segundos de Carga: "+(fechaFin.getTime()-fechaIni.getTime())/1000);
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
      console.log("window.DataCarga:inicio");
      window.DataCarga = inicio();
  }else {
      console.log("La librería está siendo llamada nuevamente");
  }
})(window, document);

function AgregaRuta(arrRutas, central, ruta, dataRuta){
  var arrData = [ruta, dataRuta];
  for(var i=0; i<arrRutas.length; i++){
    if (arrRutas[i][0].includes(central)){

      arrRutas[i][1].push(arrData);
      return;
    }
  }
  arrRutas.push([central, [arrData]]);

}
