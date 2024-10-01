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
                      sizeSlider: Slider { minvalue:5, maxvalue:100, value:100, alignment:['fill','center'], helpTip:'Tamanho da animação em porcentagem' }, \
                      sizeValue: StaticText { text:'100%', alignment:['right','center'] } \
                  }, \
                  executeGroup: Group { \
                      orientation:'row', alignChildren:['fill','top'], \
                      offsetLayersBtn: Button { text:'Aplicar Animação', helpTip:'Aplica a animação à camada selecionada com offset aleatório' } \
                  } \
              } \
          }";
      myPalette.grp = myPalette.add(res);

      myPalette.grp.mainGroup.animationGroup.animationDropDown.selection = 0;

      // Função para atualizar o dropdown de camadas
      function updateLayerDropdown() {
          var comp = app.project.activeItem;
          if (comp && comp instanceof CompItem) {
              myPalette.grp.mainGroup.layerGroup.layerDropDown.removeAll();
              for (var i = 1; i <= comp.numLayers; i++) {
                  var layerItem = myPalette.grp.mainGroup.layerGroup.layerDropDown.add("item", comp.layer(i).name);
                  layerItem.layerIndex = i;
              }
              if (comp.numLayers > 0) {
                  myPalette.grp.mainGroup.layerGroup.layerDropDown.selection = 0;
                  myPalette.grp.mainGroup.layerGroup.layerDropDown.enabled = true;
              } else {
                  myPalette.grp.mainGroup.layerGroup.layerDropDown.add("item", "Nenhuma camada na composição");
                  myPalette.grp.mainGroup.layerGroup.layerDropDown.enabled = false;
              }
          } else {
              myPalette.grp.mainGroup.layerGroup.layerDropDown.removeAll();
              myPalette.grp.mainGroup.layerGroup.layerDropDown.add("item", "Nenhuma composição ativa");
              myPalette.grp.mainGroup.layerGroup.layerDropDown.enabled = false;
          }
      }

      // Atualizar o dropdown de camadas quando o painel é aberto
      myPalette.onShow = updateLayerDropdown;

      // Adicionar um botão para atualizar manualmente o dropdown de camadas
      myPalette.grp.mainGroup.layerGroup.add("button", undefined, "Atualizar", {alignment: ['right', 'center']});
      myPalette.grp.mainGroup.layerGroup.children[2].onClick = updateLayerDropdown;

      // Inicializar o dropdown de camadas
      updateLayerDropdown();

      // Atualizar o valor do tamanho quando o slider é movido
          myPalette.grp.mainGroup.sizeGroup.sizeSlider.onChanging = function() {
            var value = Math.max(5, Math.round(this.value / 5) * 5);
            this.value = value;
            myPalette.grp.mainGroup.sizeGroup.sizeValue.text = value + "%";
        }
        
        myPalette.grp.mainGroup.sizeGroup.sizeSlider.onChange = function() {
            var value = Math.max(5, Math.round(this.value / 5) * 5);
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

              var selectedLayerItem = myPalette.grp.mainGroup.layerGroup.layerDropDown.selection;
              if (!selectedLayerItem) {
                  throw new Error("Nenhuma camada selecionada no dropdown.");
              }
              var selectedLayer = comp.layer(selectedLayerItem.layerIndex);
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
      var layerWidth = layer.width;
      var layerHeight = layer.height;
      var layerPosition = layer.transform.position.value;
      var layerAnchor = layer.transform.anchorPoint.value;
      var layerScale = layer.transform.scale.value;
      
      // Definir o valor fixo para o offset máximo (em frames)
      var maxOffset = 120;
      
      for (var i = 0; i < repeatCount; i++) {
          // Adicionar a camada de animação
          var animationLayer = comp.layers.add(animationFootage);
          animationLayer.moveToBeginning(); // Move a camada para o topo da timeline
          
          // Ajustar a escala da animação baseado no animationSize
          var scale = animationSize * 100;
          animationLayer.transform.scale.setValue([scale, scale]);
          
          // Calcular as dimensões da animação após o ajuste de escala
          var footageWidth = animationFootage.width * animationSize;
          var footageHeight = animationFootage.height * animationSize;
          
          // Calcular os limites da camada selecionada na composição
          var layerLeft = layerPosition[0] - (layerWidth * layerScale[0] / 100) / 2;
          var layerTop = layerPosition[1] - (layerHeight * layerScale[1] / 100) / 2;
          var layerRight = layerLeft + (layerWidth * layerScale[0] / 100);
          var layerBottom = layerTop + (layerHeight * layerScale[1] / 100);
          
          // Calcular uma posição aleatória dentro dos limites da camada selecionada
          var randomX = layerLeft + Math.random() * (layerRight - layerLeft - footageWidth);
          var randomY = layerTop + Math.random() * (layerBottom - layerTop - footageHeight);
          
          // Definir a posição da animação
          animationLayer.transform.position.setValue([randomX + footageWidth/2, randomY + footageHeight/2]);
          
          // Calcular o offset aleatório (em frames)
          var randomOffset = Math.floor(Math.random() * maxOffset);
          
          // Ajustar o tempo da animação com o offset calculado
          animationLayer.startTime = layer.inPoint;
          animationLayer.inPoint = layer.inPoint;
          
          // Aplicar o offset usando time remapping
          if (animationLayer.canSetTimeRemapEnabled) {
              animationLayer.timeRemapEnabled = true;
              var timeRemap = animationLayer.property("ADBE Time Remapping");
              timeRemap.setValueAtTime(0, randomOffset / comp.frameRate);
          }
          
          // Ajustar o ponto de saída para não ultrapassar o da camada selecionada
          var animationDuration = animationLayer.outPoint - animationLayer.inPoint;
          animationLayer.outPoint = Math.min(layer.outPoint, animationLayer.inPoint + animationDuration);
          
          logMessages.push("Animação " + (i + 1) + " de " + repeatCount + " aplicada em posição aleatória com offset de " + (randomOffset / comp.frameRate).toFixed(2) + " segundos.");
      }
      
      logMessages.push("Animação '" + animation + "' aplicada com sucesso " + repeatCount + " vezes à camada: " + layer.name);
  } catch (error) {
      logMessages.push("Erro ao aplicar a animação: " + error.toString());
      throw error;
  }
}

var scriptTitle = "Bids Shifter";
var scriptVersion = "v1.0";

try {
  isNetworkAccessAllowed();
  var myPalette = buildUI(this);
  if (myPalette != null && myPalette instanceof Window) {
    myPalette.show();
  }
} catch (error) {
  alert("Erro ao inicializar o script: " + error.toString());
}