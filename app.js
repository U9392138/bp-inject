console.log("✅ TESTE: app.js redirecionado com sucesso da extensão");

import { record } from "./vmsg.js";

let recordButton = document.getElementById("buttonMensagemVoz");
recordButton.onclick = function() {
  record({wasmURL: "vmsg.wasm"}).then(blob => {


    var formData = new FormData();
    formData.append('file', blob);

    $.ajax({
       url: "AcoesUnificadas.php?AcoesTipo=BPP&Acao=enviarMensagemVoz",
       type: 'POST',
       data: formData,
       contentType: false,
       processData: false,
       dataType: 'json'
    })

    .done(function(data) {

    })

    .fail(function(data) {
       var jsonData = data.responseJSON;
       alert(jsonData.retornoMensagem);
    });


    
    //console.log("Recorded MP3", blob);
    //var url = URL.createObjectURL(blob);
    //var preview = document.createElement('audio');
    //preview.controls = true;preview.src = url;
    //document.body.appendChild(preview);
  });
};
