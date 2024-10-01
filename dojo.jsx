var logMessages = []; // Declaração global da variável logMessages

function isNetworkAccessAllowed() {
  var securitySetting = app.preferences.getPrefAsLong(
    "Main Pref Section",
    "Pref_SCRIPTING_FILE_NETWORK_SECURITY"
  );
  if (securitySetting != 1) {
    alert(
      "Este script requer acesso para escrever arquivos e acessar a rede \n" +
      "Vá para After Effects > Preferências > Geral e certifique-se de que: \n \n" +
      "Permitir que Scripts Escrevam Arquivos e Acessem a Rede está marcado"
    );
    app.executeCommand(app.findMenuCommandId("General..."));
  } else {
    return securitySetting == 1;
  }
}

function buildUI(thisObject) {
  if (thisObject instanceof Panel) {
    var myPalette = thisObject;
  } else {
    var myPalette = new Window("palette", scriptTitle, undefined, {
      resizeable: true,
    });
  }
  if (myPalette != null) {
    var res =
      "group { \
        orientation:'column', alignment:['fill','top'], \
        mainGroup: Group { \
          text:'Layer Offset Setup', orientation:'column', alignment:['fill','top'], alignChildren:['fill','top'], spacing:5, \
          animationGroup: Group { \
            orientation:'row', alignment:['fill','top'], spacing:5, \
            animationText: StaticText { text:'Animação:', alignment:['left','center'] }, \
            animationDropDown: DropDownList { properties:{items:['Flash', 'SlowFlash']}, alignment:['fill','center'], helpTip:'Escolha a animação predefinida' } \
          }, \
          layerGroup: Group { \
            orientation:'row', alignment:['fill','top'], spacing:5, \
            layerText: StaticText { text:'Camada:', alignment:['left','center'] }, \
            layerDropDown: DropDownList { alignment:['fill','center'], helpTip:'Escolha a camada para aplicar a animação' } \
          }, \
          repeatGroup: Group { \
            orientation:'row', alignment:['fill','top'], spacing:5, \
            repeatText: StaticText { text:'Repetições:', alignment:['left','center'] }, \
            repeatAmount: EditText { text:'1', alignment:['fill','center'], helpTip:'Número de vezes para repetir a animação' } \
          }, \
          sizeGroup: Group { \
            orientation:'row', alignment:['fill','top'], spacing:5, \
            sizeText: StaticText { text:'Tamanho (%):', alignment:['left','center'] }, \
            sizeSlider: Slider { minvalue:10, maxvalue:100, value:100, alignment:['fill','center'], helpTip:'Tamanho da animação em porcentagem' }, \
            sizeValue: StaticText { text:'100%', alignment:['right','center'] } \
          }, \
          offsetGroup: Group { \
            orientation:'row', alignment:['fill','top'], spacing:5, \
            instructionText: StaticText { text:'Offset Máximo:', alignment:['left','center'] }, \
            offsetAmount: EditText { text:'120', alignment:['fill','center'], helpTip:'Valor máximo do offset aleatório' }, \
            offsetFormat: DropDownList { properties:{items:['Frames', 'Seconds']}, alignment:['right','top'], preferredSize:[80,25], helpTip:'Unidades do offset' } \
          }, \
          executeGroup: Group { \
            orientation:'row', alignChildren:['fill','top'], \
            offsetLayersBtn: Button { text:'Aplicar Animação', helpTip:'Aplica a animação à camada selecionada com offset aleatório' } \
          } \
        } \
      }";
    myPalette.grp = myPalette.add(res);

    myPalette.grp.mainGroup.animationGroup.animationDropDown.selection = 0;
    myPalette.grp.mainGroup.offsetGroup.offsetFormat.selection = 0;

    // Preencher o dropdown de camadas
    var comp = app.project.activeItem;
    if (comp && comp instanceof CompItem) {
      for (var i = 1; i <= comp.numLayers; i++) {
        myPalette.grp.mainGroup.layerGroup.layerDropDown.add("item", comp.layer(i).name);
      }
      if (comp.numLayers > 0) {
        myPalette.grp.mainGroup.layerGroup.layerDropDown.selection = 0;
      }
    }

    // Atualizar o valor do tamanho quando o slider é movido
    myPalette.grp.mainGroup.sizeGroup.sizeSlider.onChanging = function() {
      var value = Math.round(this.value / 10) * 10;
      this.value = value;
      myPalette.grp.mainGroup.sizeGroup.sizeValue.text = value + "%";
    }

    myPalette.grp.mainGroup.executeGroup.offsetLayersBtn.onClick = function () {
      try {
        alert("Iniciando execução do script.");
        logMessages = []; // Limpa as mensagens de log anteriores
        logMessages.push("Iniciando execução do script.");
        app.beginUndoGroup("Aplicar Animação");
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
          throw new Error("Nenhuma composição selecionada.");
        }
        logMessages.push("Composição ativa: " + comp.name);

        var selectedLayerIndex = myPalette.grp.mainGroup.layerGroup.layerDropDown.selection.index;
        var selectedLayer = comp.layer(selectedLayerIndex + 1);
        logMessages.push("Camada selecionada: " + selectedLayer.name);
        
        var selectedAnimation = myPalette.grp.mainGroup.animationGroup.animationDropDown.selection.text;
        var repeatCount = parseInt(myPalette.grp.mainGroup.repeatGroup.repeatAmount.text);
        var animationSize = myPalette.grp.mainGroup.sizeGroup.sizeSlider.value / 100;
        
        logMessages.push("Animação selecionada: " + selectedAnimation);
        logMessages.push("Número de repetições: " + repeatCount);
        logMessages.push("Tamanho da animação: " + (animationSize * 100) + "%");
        
        applyAnimation(selectedLayer, selectedAnimation, repeatCount, animationSize);
        
        app.endUndoGroup();
      } catch (error) {
        alert("Erro durante a execução do script: " + error.toString());
        logMessages.push("Erro: " + error.toString());
      } finally {
        // Exibir log em uma janela de alerta
        alert("Log de execução:\n" + logMessages.join("\n"));
      }
    };
  }
  myPalette.layout.layout(true);
  myPalette.grp.minimumSize = myPalette.grp.size;
  myPalette.layout.resize();
  myPalette.onResizing = myPalette.onResize = function () {
    this.layout.resize();
  };
  return myPalette;
}

function resolverCaminhoRede(caminho) {
  if (caminho.indexOf("\\\\") === 0 || caminho.indexOf("//") === 0) {
      var netPath = caminho.replace(/\\/g, '/');
      var parts = netPath.split('/');
      var serverName = parts[2];
      var shareName = parts[3];
      var restOfPath = parts.slice(4).join('/');
      
      var possiblePaths = [
          "//" + serverName + "/" + shareName + "/" + restOfPath,
          "\\\\" + serverName + "\\" + shareName + "\\" + restOfPath.replace(/\//g, '\\'),
          "file://" + netPath,
          "file:///" + netPath
      ];
      
      for (var i = 0; i < possiblePaths.length; i++) {
          var testFile = new File(possiblePaths[i]);
          if (testFile.exists) {
              return testFile;
          }
      }
  }
  return new File(caminho);
}

function applyAnimation(layer, animation, repeatCount, animationSize) {
  try {
      var comp = layer.containingComp;
      logMessages.push("Iniciando aplicação da animação '" + animation + "' na camada: " + layer.name);
      
      var animationPath;
      if (animation === "Flash") {
          animationPath = "\\\\192.168.1.104\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\AFTER-EFFECTS\\ANIMACOES\\Starflash20.mov";
      } else if (animation === "SlowFlash") {
          animationPath = "\\\\192.168.1.104\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\AFTER-EFFECTS\\ANIMACOES\\SlowFlash.mov";
      }
      
      var animationFile = resolverCaminhoRede(animationPath);
      logMessages.push("Tentando acessar o arquivo de animação: " + animationFile.fsName);

      if (!animationFile.exists) {
          throw new Error("Arquivo de animação não encontrado: " + animationFile.fsName);
      }

      logMessages.push("Arquivo de animação encontrado.");
      var animationFootage = app.project.importFile(new ImportOptions(animationFile));
      logMessages.push("Arquivo de animação importado com sucesso.");
      
      // Obter as dimensões e posição da camada selecionada
      var layerRect = layer.sourceRectAtTime(layer.inPoint, false);
      var layerPosition = layer.transform.position.value;
      
      for (var i = 0; i < repeatCount; i++) {
          // Adicionar a camada de animação
          var animationLayer = comp.layers.add(animationFootage);
          animationLayer.moveToBeginning(); // Move a camada para o topo da timeline
          
          // Obter as dimensões reais da animação
          var footageWidth = animationFootage.width;
          var footageHeight = animationFootage.height;
          
          // Calcular uma posição aleatória dentro da área ocupada pela camada selecionada
          var maxX = layerRect.width - footageWidth;
          var maxY = layerRect.height - footageHeight;
          var randomX = Math.random() * maxX;
          var randomY = Math.random() * maxY;
          
          // Definir a posição da animação em relação à composição
          var animationPosition = [
              layerPosition[0] + randomX - layerRect.width/2 + footageWidth/2,
              layerPosition[1] + randomY - layerRect.height/2 + footageHeight/2
          ];
          
          animationLayer.transform.position.setValue(animationPosition);
          
          // Ajustar o tempo da animação para começar no início da camada selecionada
          animationLayer.startTime = layer.inPoint;
          animationLayer.inPoint = layer.inPoint;
          
          // Ajustar o ponto de saída para não ultrapassar o da camada selecionada
          var animationDuration = animationLayer.outPoint - animationLayer.inPoint;
          animationLayer.outPoint = Math.min(layer.outPoint, layer.inPoint + animationDuration);
          
          logMessages.push("Animação " + (i + 1) + " de " + repeatCount + " aplicada em posição aleatória.");
      }
      
      logMessages.push("Animação '" + animation + "' aplicada com sucesso " + repeatCount + " vezes à camada: " + layer.name);
  } catch (error) {
      logMessages.push("Erro ao aplicar a animação: " + error.toString());
      throw error;
  }
}

var scriptTitle = "Dojo Shifter";
var scriptVersion = "v1.2";

try {
  isNetworkAccessAllowed();
  var myPalette = buildUI(this);
  if (myPalette != null && myPalette instanceof Window) {
    myPalette.show();
  }
} catch (error) {
  alert("Erro ao inicializar o script: " + error.toString());
}