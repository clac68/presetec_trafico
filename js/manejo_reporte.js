

(function(window, document){
  'use strict'
  var inicio=function(){
    var cbCentral,cbRuta;
    var selFecha;
    var Grafico;
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
      DisplayDatosXHora: function(arrTraficoXHora){
        var dataGrafico = new Array;
        var labelX = new Array;
        var i = 0;
        arrTraficoXHora.forEach(function(data){
          dataGrafico[i] = data.getIntentos();
          labelX[i] = data.getFecha();
        })
        ManejoReporte.Grafica("bar", "Intentos x Hora", labelX, "Intentos", dataGrafico);
      },
      Grafica: function(tipo, titulo, labelX, labelY,  dataGrafico){
        var Grafico = new Chart(ctx, {
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
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
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
