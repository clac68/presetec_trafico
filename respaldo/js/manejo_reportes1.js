

(function(window, document){
  'use strict'
  var inicio=function(){
    var cbCentral,cbRuta;
    var selFecha;
    var Grafico;
    var rbOpcionesCampo;
    var arrTraficoXHora = new Array();
    var libBD;
    var Centrales;
    var lib={
      setcbCentral: function(selCentral){
        cbCentral=selCentral;
        return this;
      },
      setcbRuta: function(selRuta){
        cbRuta=selRuta;
        return this;
      },
      setFecha: function(eltoFecha){
        selFecha=selFecha;
        return this;
      },
      setGrafico: function(grafico){
        Grafico = grafico;
        return this;
      },
      setOpcionesCampo: function(opcCampos){
        rbOpcionesCampo = opcCampos;
        for(var i=0;  i<rbOpcionesCampo.length; i++){
          var opcCampo = rbOpcionesCampo[i];
          rbOpcionesCampo[i].onclick=function(){
            console.log(this.value);
            ManejoReporte.DisplayDatosXHora1();
          }
        }
        rbOpcionesCampo[1].checked=true;
      },
      setlibBD: function(lib_basedatos){
        libBD=lib_basedatos;
        return this;
      },
      IniciaReporteHtml: function(){
        console.log("clac:removiendo cbCentral. Largo:"+cbCentral.length);
        this.LimpiaSelect(cbCentral);
        console.log("removiendo cbRuta. Largo:"+cbRuta.length);
        this.LimpiaSelect(cbRuta);
        cbCentral.addEventListener("change", function(){
          ManejoReporte.LimpiaSelect(cbRuta);
          ManejoReporte.Centrales.forEach(function(central){
            console.log("Central Seleccionada="+cbCentral.options[cbCentral.selectedIndex]);
            if (central.getId() === cbCentral.options[cbCentral.selectedIndex].value){
              central.getRutas().forEach(function(ruta){
                ManejoReporte.AgregaOpcion(cbRuta, ruta.getId(),ruta.getNombre(), ruta.getTipo(), ruta.getDescripcion());
              });
            }
          });
          /*
          var nombreCentral = cbCentral.options.item(cbCentral.index).text;
          ManejoReporte.AgregaOpcion(cbRuta, "valor", nombreCentral+"1","cl", "descripcion"+1);
          ManejoReporte.AgregaOpcion(cbRuta, "valor", nombreCentral+"2","cl", "descripcion"+2);
          ManejoReporte.AgregaOpcion(cbRuta, "valor", nombreCentral+"3","cl", "descripcion"+3);
          ManejoReporte.AgregaOpcion(cbRuta, "valor", nombreCentral+"4","cl", "descripcion"+4);
          ManejoReporte.AgregaOpcion(cbRuta, "valor", nombreCentral+"5","cl", "descripcion"+5);
          ManejoReporte.AgregaOpcion(cbRuta, "valor", nombreCentral+"6","cl", "descripcion"+6);
          ManejoReporte.AgregaOpcion(cbRuta, "valor", nombreCentral+"7","cl", "descripcion"+7);
          */
        });

        return this;
      },
      LimpiaSelect:function(eltoSel){
        while(eltoSel.options.length>0){
          eltoSel.remove(0);
        }
        return this;
      },
      AgregaOpcion: function(selLista, opcValor, opcText, opcClass, opcTitle){
        var elto=document.createElement("option");

        elto.setAttribute("class", opcClass);
        elto.setAttribute("value", opcValor);
        elto.setAttribute("title", opcTitle);
        elto.appendChild(document.createTextNode(opcText));
        selLista.add(elto)

        return this;
      },
      DisplayEltosSeleccion: function(Centrales){
        this.Centrales = Centrales;
        Centrales.forEach(function(central){
          ManejoReporte.AgregaOpcion(cbCentral,central.getId(), central.getNombre(), "", "");
        })
        /*
        this.AgregaOpcion(cbCentral,"central1", "Maipu", "tandem", "info central maipu");
        this.AgregaOpcion(cbCentral,"central2", "Stgo", "s7", "info stgo");
        this.AgregaOpcion(cbCentral,"central3", "La Serena", "sip", "info la serena");
        this.AgregaOpcion(cbCentral,"central4", "Concepción", "sip", "info conce");
        this.AgregaOpcion(cbCentral,"central5", "Viña", "sip", "info Viña");
        */
        if (cbCentral.options.length > 0){
          cbCentral.selectedIndex=0;
        }

      },
      DisplayDatosXHora: function(arrData){
        console.log("DisplayDatosXHora(arrData)");
         arrTraficoXHora = arrData;
         console.log("DisplayDatosXHora:arrTraficoXHora.length="+arrTraficoXHora.length);
        this.DisplayDatosXHora1();
      },
      DisplayDatosXHora1: function(){

          console.log("DisplayDatosXHora()");

          console.log("DisplayDatosXHora1:arrTraficoXHora.length="+arrTraficoXHora.length);
        var opcSeleccionada;
        var dataGrafico = new Array;
        var labelX = new Array;
        var bgColor = new Array();
        var bColor = new Array();
        var i = 0;
        for(i=0; i<rbOpcionesCampo.length; i++){
          if (rbOpcionesCampo[i].checked){
            opcSeleccionada=rbOpcionesCampo[i].value;
            console.log("DisplayDatosXHora1:opcSeleccionada:" + opcSeleccionada);
          }
        }
        console.log("DisplayDatosXHora1:arrTraficoXHora:" + arrTraficoXHora);
        arrTraficoXHora.forEach(function(data){
          dataGrafico[i] = ManejoReporte.getDataSelected(data, opcSeleccionada );
          labelX[i] = data.getHora();
          bgColor[i] = 'rgba(96, 35, 178, 1)';
          bColor[i] = 'rgba(56, 0, 178, 1)';
          i++;
        })
        console.log("DisplayDatosXHora1:dataGrafico:" + dataGrafico);
        //console.log("DisplayDatosXHora: n°Datos:" + dataGrafico.length + "-Original:" + arrTraficoXHora.length);
        ManejoReporte.Grafica("bar", "Intentos x Hora", labelX, "Intentos", dataGrafico, bgColor, bColor);
      },
      getDataSelected: function(Data, idSelected){
        switch (idSelected){
          case "idCircuitos":
            console.log("getDataSelected:Data.getCircuitos1:" + Data.getCircuitos1());
            return Data.getCircuitos1();
            break;
          case "idIntentos":
            console.log("getDataSelected:Data.getIntentos:" + Data.getIntentos());
            return Data.getIntentos();
            break;
          case "idDesborde":
            console.log("getDataSelected:Data.getDesborde:" + Data.getDesborde());
            return Data.getDesborde();
            break;
          case "idConnect":
            console.log("getDataSelected:Data.getConectados:" + Data.getConectados());
            return Data.getConectados();
            break;
          case "idRespuesta":
            console.log("getDataSelected:Data.getRespuesta:" + Data.getRespuesta());
            return Data.getRespuesta();
            break;
          default:
            return Data.getCircuitos1();
            break;
        }
        return Data.getIntentos();
      },
      Grafica: function(tipo, titulo, labelX, labelY,  dataGrafico, bgColor, bColor){
        var myChart = new Chart(Grafico, {
            //type: 'bar',
            type: tipo,
            data: {
                //labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
                labels: labelX,
                datasets: [{
                    //label: '# of Votes',
                    label: labelY,
                    //data: [12, 19, 3, 5, 2, 3],
                    data: dataGrafico,
                    backgroundColor: bgColor,
                    borderColor:bColor,
                    borderWidth: 1
                }]
            },
            options: {
              title:{
                display:true,
                //text: "Titulo"
                text: titulo
              },
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero:true
                      }
                  }]
              }
            }
        });

      }
    }
    return lib;
  }

  if (typeof window.ManejoReporte === 'undefined'){
      window.ManejoReporte = inicio();
  }else {
      console.log("La librería está siendo llamada nuevamente");
  }
})(window,document)
