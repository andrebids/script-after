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
function obterCaminhoAnimacao(animation) {
    var basePath = "\\\\192.168.1.104\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\AFTER-EFFECTS\\ANIMACOES\\_2024\\";
    var animationPaths = {
        "Flash PW (novo)": basePath + "FX_PW_F.mov",
        "FlashWW": basePath + "FX_WW_F.mov",
        "SlowFlash PW": basePath + "SLOWFLASH_PW.mov",
        "SlowFlash WW": basePath + "SLOWFLASH_WW.mov",
        "FL900E": basePath + "FL900E_2022_brilho.mov",
        "FL900EW": basePath + "FL900EW_2022.mov",
        "FL900EWW": basePath + "FL900EWW_2022.mov",
        "FL902": basePath + "FL902_2022_brilho.mov",
        "KCL": basePath + "KCL_FINAL_AGORA.mov",
        "Sparkle": basePath + "SP.mov",
        "Flash PW (antigo)": basePath + "Starflash20.mov"
    };
    return animationPaths[animation] || "";
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
                animationDropDown: DropDownList { properties:{items:[\
                    'Flash PW (novo)', \
                    'FlashWW', \
                    'SlowFlash PW', \
                    'SlowFlash WW', \
                    'FL900E', \
                    'FL900EW', \
                    'FL900EWW', \
                    'FL902', \
                    'KCL', \
                    'Sparkle', \
                    'Flash PW (antigo)' \
                ]}, alignment:['fill','center'], helpTip:'Escolha a animação predefinida' } \
            }, \
            layerGroup: Group { \
                orientation:'row', alignment:['fill','top'], spacing:5, \
                layerText: StaticText { text:'Layer a aplicar:', alignment:['left','center'] }, \
                layerDropDown: DropDownList { alignment:['fill','center'], helpTip:'Escolha a camada para aplicar a animação' } \
            }, \
            repeatGroup: Group { \
                orientation:'row', alignment:['fill','top'], spacing:5, \
                repeatText: StaticText { text:'Repetições :', alignment:['left','center'] }, \
                repeatAmount: EditText { text:'1', alignment:['fill','center'], helpTip:'Número de vezes para repetir a animação' } \
            }, \
            sizeGroup: Group { \
                orientation:'row', alignment:['fill','top'], spacing:5, \
                sizeText: StaticText { text:'Tamanho (%):', alignment:['left','center'] }, \
                sizeSlider: Slider { minvalue:5, maxvalue:100, value:100, alignment:['fill','center'], helpTip:'Tamanho da animação em porcentagem' }, \
                sizeValue: StaticText { text:'100%', alignment:['right','center'] } \
            }, \
            previewGroup: Group { \
                orientation:'row', alignChildren:['fill','top'], \
                previewBtn: Button { text:'Pré-visualizar', helpTip:'Cria uma única instância da animação para pré-visualização' } \
            }, \
            executeGroup: Group { \
                orientation:'row', alignChildren:['fill','top'], \
                offsetLayersBtn: Button { text:'Aplicar Animação', helpTip:'Aplica a animação à camada selecionada com offset aleatório' } \
            } \
        } \
        }";
        myPalette.grp = myPalette.add(res);
  
        myPalette.grp.mainGroup.animationGroup.animationDropDown.selection = 0;
  
        function atualizarDropdownCamadas() {
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
  
        myPalette.onShow = atualizarDropdownCamadas;
  
        myPalette.grp.mainGroup.layerGroup.add("button", undefined, "Atualizar", {alignment: ['right', 'center']});
        myPalette.grp.mainGroup.layerGroup.children[2].onClick = atualizarDropdownCamadas;
  
        atualizarDropdownCamadas();
  
        myPalette.grp.mainGroup.sizeGroup.sizeSlider.onChanging = function() {
            var valor = Math.max(5, Math.round(this.value / 5) * 5);
            this.value = valor;
            myPalette.grp.mainGroup.sizeGroup.sizeValue.text = valor + "%";
        }
        
        myPalette.grp.mainGroup.sizeGroup.sizeSlider.onChange = myPalette.grp.mainGroup.sizeGroup.sizeSlider.onChanging;
  
        myPalette.grp.mainGroup.previewGroup.previewBtn.onClick = function () {
            try {
                app.beginUndoGroup("Pré-visualizar Animação");
                var comp = app.project.activeItem;
                if (!comp || !(comp instanceof CompItem)) {
                    throw new Error("Nenhuma composição selecionada.");
                }
                
                var selectedLayerItem = myPalette.grp.mainGroup.layerGroup.layerDropDown.selection;
                if (!selectedLayerItem) {
                    throw new Error("Nenhuma camada selecionada no dropdown.");
                }
                var selectedLayer = comp.layer(selectedLayerItem.layerIndex);
                
                if (!selectedLayer) {
                    throw new Error("Camada selecionada é inválida.");
                }
                
                var selectedAnimation = myPalette.grp.mainGroup.animationGroup.animationDropDown.selection.text;
                var animationSize = myPalette.grp.mainGroup.sizeGroup.sizeSlider.value / 100;
                
                var animationPath = obterCaminhoAnimacao(selectedAnimation);
                if (!animationPath) {
                    throw new Error("Caminho da animação não encontrado para: " + selectedAnimation);
                }
                
                var animationFile = new File(animationPath);
                if (!animationFile.exists) {
                    throw new Error("Arquivo de animação não encontrado: " + animationPath);
                }
                var animationFootage = app.project.importFile(new ImportOptions(animationFile));
                
                var previewLayer = comp.layers.add(animationFootage);
                previewLayer.name = "Preview_" + selectedAnimation;
                
                var scale = animationSize * 100;
                previewLayer.transform.scale.setValue([scale, scale]);
                
                previewLayer.startTime = selectedLayer.inPoint;
                previewLayer.inPoint = selectedLayer.inPoint;
                previewLayer.outPoint = Math.min(selectedLayer.outPoint, previewLayer.inPoint + animationFootage.duration);
                
                comp.duration = previewLayer.outPoint - previewLayer.inPoint;
                comp.time = previewLayer.inPoint;
                
                var previewRect = previewLayer.sourceRectAtTime(comp.time, false);
                var zoomFactor = Math.min(comp.width / previewRect.width, comp.height / previewRect.height) * 0.9;
                
                var viewCenterPoint = [
                    previewRect.left + previewRect.width / 2,
                    previewRect.top + previewRect.height / 2
                ];
                comp.viewportCenterPoint = viewCenterPoint;
                comp.zoom = zoomFactor;
                
                app.endUndoGroup();
                
                app.scheduleTask("removerCamadaPreview()", 5000, false);
                
                alert("Pré-visualização criada com sucesso!");
                
            } catch (error) {
                alert("Erro durante a pré-visualização: " + error.toString() + "\nLinha: " + error.line);
            }
        };
  
        myPalette.grp.mainGroup.executeGroup.offsetLayersBtn.onClick = function () {
            try {
                app.beginUndoGroup("Aplicar Animação");
                var comp = app.project.activeItem;
                if (!comp || !(comp instanceof CompItem)) {
                    throw new Error("Nenhuma composição selecionada.");
                }
    
                var selectedLayerItem = myPalette.grp.mainGroup.layerGroup.layerDropDown.selection;
                if (!selectedLayerItem) {
                    throw new Error("Nenhuma camada selecionada no dropdown.");
                }
                var selectedLayer = comp.layer(selectedLayerItem.layerIndex);
                
                var selectedAnimation = myPalette.grp.mainGroup.animationGroup.animationDropDown.selection.text;
                var repeatCount = parseInt(myPalette.grp.mainGroup.repeatGroup.repeatAmount.text);
                var animationSize = myPalette.grp.mainGroup.sizeGroup.sizeSlider.value / 100;
                
                applyAnimation(selectedLayer, selectedAnimation, repeatCount, animationSize, obterCaminhoAnimacao);
                
                app.endUndoGroup();
            } catch (error) {
                alert("Erro durante a execução do script: " + error.toString());
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
        if (!layer) {
            return;
        }

        var comp = layer.containingComp;
        if (!comp) {
            return;
        }

        var animationPath;
        if (animation === "Flash PW (novo)") {
            animationPath = "\\\\192.168.1.104\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\AFTER-EFFECTS\\ANIMACOES\\_2024\\FX_PW_F.mov";
        } else if (animation === "FlashWW") {
            animationPath = "\\\\192.168.1.104\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\AFTER-EFFECTS\\ANIMACOES\\_2024\\FX_WW_F.mov";
        } else if (animation === "SlowFlash PW") {
            animationPath = "\\\\192.168.1.104\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\AFTER-EFFECTS\\ANIMACOES\\_2024\\SLOWFLASH_PW.mov";
        } else if (animation === "SlowFlash WW") {
            animationPath = "\\\\192.168.1.104\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\AFTER-EFFECTS\\ANIMACOES\\_2024\\SLOWFLASH_WW.mov";
        } else if (animation === "FL900E") {
            animationPath = "\\\\192.168.1.104\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\AFTER-EFFECTS\\ANIMACOES\\_2024\\FL900E_2022_brilho.mov";
        } else if (animation === "FL900EW") {
            animationPath = "\\\\192.168.1.104\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\AFTER-EFFECTS\\ANIMACOES\\_2024\\FL900EW_2022.mov";
        } else if (animation === "FL900EWW") {
            animationPath = "\\\\192.168.1.104\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\AFTER-EFFECTS\\ANIMACOES\\_2024\\FL900EWW_2022.mov";
        } else if (animation === "FL902") {
            animationPath = "\\\\192.168.1.104\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\AFTER-EFFECTS\\ANIMACOES\\_2024\\FL902_2022_brilho.mov";
        } else if (animation === "KCL") {
            animationPath = "\\\\192.168.1.104\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\AFTER-EFFECTS\\ANIMACOES\\_2024\\KCL_FINAL_AGORA.mov"; 
        } else if (animation === "Sparkle") {
            animationPath = "\\\\192.168.1.104\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\AFTER-EFFECTS\\ANIMACOES\\_2024\\SP.mov";  
        } else if (animation === "Flash PW (antigo)") {
            animationPath = "\\\\192.168.1.104\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\AFTER-EFFECTS\\ANIMACOES\\Starflash20.mov";  
        }

        if (!animationPath) {
            return;
        }

        var animationFile = resolverCaminhoRede(animationPath);

        if (!animationFile.exists) {
            return;
        }

        var animationFootage = app.project.importFile(new ImportOptions(animationFile));
        if (!animationFootage) {
            return;
        }

        var isShapeLayer = layer instanceof ShapeLayer;

        var layerPosition = layer.transform.position.value;
        var layerAnchorPoint = layer.transform.anchorPoint.value;
        var layerScale = layer.transform.scale.value;
        
        function localToGlobal(point) {
            var adjustedX = (point[0] - layerAnchorPoint[0]) * layerScale[0] / 100;
            var adjustedY = (point[1] - layerAnchorPoint[1]) * layerScale[1] / 100;
            return [
                layerPosition[0] + adjustedX,
                layerPosition[1] + adjustedY
            ];
        }

        var shapePaths = [];
        var layerBounds;
        var getRandomPoint;

        if (isShapeLayer) {
            var contents = layer.property("Contents");
            if (!contents) {
                return;
            }
            
            function findShapePaths(prop) {
                for (var i = 1; i <= prop.numProperties; i++) {
                    var p = prop.property(i);
                    
                    if (p.matchName === "ADBE Vector Shape - Group") {
                        shapePaths.push(p.property("Path").value);
                    } else if (p.propertyType === PropertyType.INDEXED_GROUP || p.propertyType === PropertyType.NAMED_GROUP) {
                        findShapePaths(p);
                    }
                }
            }

            findShapePaths(contents);
            
            if (shapePaths.length === 0) {
                return;
            }
            
            var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            
            for (var i = 0; i < shapePaths.length; i++) {
                var vertices = shapePaths[i].vertices;
                for (var j = 0; j < vertices.length; j++) {
                    var vertex = vertices[j];
                    minX = Math.min(minX, vertex[0]);
                    minY = Math.min(minY, vertex[1]);
                    maxX = Math.max(maxX, vertex[0]);
                    maxY = Math.max(maxY, vertex[1]);
                }
            }
            
            layerBounds = {left: minX, top: minY, right: maxX, bottom: maxY};

            function isPointInShapes(x, y) {
                for (var k = 0; k < shapePaths.length; k++) {
                    var path = shapePaths[k];
                    var result = false;
                    var j = path.vertices.length - 1;
                    for (var i = 0; i < path.vertices.length; i++) {
                        if ((path.vertices[i][1] > y) != (path.vertices[j][1] > y) &&
                            (x < (path.vertices[j][0] - path.vertices[i][0]) * (y - path.vertices[i][1]) / (path.vertices[j][1] - path.vertices[i][1]) + path.vertices[i][0])) {
                            result = !result;
                        }
                        j = i;
                    }
                    if (result) return true;
                }
                return false;
            }

            getRandomPoint = function() {
                var x, y;
                do {
                    x = layerBounds.left + Math.random() * (layerBounds.right - layerBounds.left);
                    y = layerBounds.top + Math.random() * (layerBounds.bottom - layerBounds.top);
                } while (!isPointInShapes(x, y));
                return localToGlobal([x, y]);
            };
        } else {
            var layerWidth = layer.width;
            var layerHeight = layer.height;
            layerBounds = {
                left: -layerWidth / 2,
                top: -layerHeight / 2,
                right: layerWidth / 2,
                bottom: layerHeight / 2
            };

            getRandomPoint = function() {
                var randomX = Math.random() * layerWidth - layerWidth / 2;
                var randomY = Math.random() * layerHeight - layerHeight / 2;
                return [
                    layerPosition[0] + randomX * layerScale[0] / 100,
                    layerPosition[1] + randomY * layerScale[1] / 100
                ];
            };
        }

        var createdLayers = [];
        var usedPositions = [];
        
        var animationWidth = animationFootage.width * animationSize;
        var animationHeight = animationFootage.height * animationSize;
        
        var minDistance = Math.sqrt(animationWidth * animationWidth + animationHeight * animationHeight) / 2;

        function getRandomPointWithSpacing() {
            var maxAttempts = 100;
            var attempts = 0;
            var newPoint;

            while (attempts < maxAttempts) {
                newPoint = getRandomPoint();
                attempts++;

                var isFarEnough = true;
                for (var i = 0; i < usedPositions.length; i++) {
                    var distance = Math.sqrt(
                        Math.pow(newPoint[0] - usedPositions[i][0], 2) +
                        Math.pow(newPoint[1] - usedPositions[i][1], 2)
                    );
                    if (distance < minDistance) {
                        isFarEnough = false;
                        break;
                    }
                }

                if (isFarEnough) {
                    usedPositions.push(newPoint);
                    return newPoint;
                }
            }

            // Se não encontrar um ponto adequado após todas as tentativas, retorna null
            return null;
        }

        var actualRepeatCount = 0;

        for (var i = 0; i < repeatCount; i++) {
            var randomPoint = getRandomPointWithSpacing();
            if (randomPoint === null) {
                break; // Não há mais espaço disponível respeitando o espaçamento mínimo
            }

            var animationLayer = comp.layers.add(animationFootage);
            if (!animationLayer) {
                continue;
            }
            createdLayers.push(animationLayer);
            actualRepeatCount++;
            
            var scale = animationSize * 100;
            animationLayer.transform.scale.setValue([scale, scale]);
            
            animationLayer.transform.position.setValue(randomPoint);
            
            var randomOffset = Math.floor(Math.random() * animationFootage.duration * comp.frameRate);
            
            animationLayer.startTime = layer.inPoint;
            animationLayer.inPoint = layer.inPoint;
            
            if (animationLayer.canSetTimeRemapEnabled) {
                animationLayer.timeRemapEnabled = true;
                var timeRemap = animationLayer.property("ADBE Time Remapping");
                if (timeRemap) {
                    timeRemap.setValueAtTime(0, randomOffset / comp.frameRate);
                }
            }
            
            var animationDuration = animationLayer.outPoint - animationLayer.inPoint;
            animationLayer.outPoint = Math.min(layer.outPoint, animationLayer.inPoint + animationDuration);
        }
        
        if (createdLayers.length > 0) {
            var basePrecompName = animation;
            var precompName = basePrecompName;
            var counter = 1;
            
            while (comp.layer(precompName) != null) {
                counter++;
                precompName = basePrecompName + "_" + counter;
            }
            
            var layerIndices = [];
            for (var j = 0; j < createdLayers.length; j++) {
                layerIndices.push(createdLayers[j].index);
            }
            var precomp = comp.layers.precompose(layerIndices, precompName, true);
            if (!precomp) {
                return;
            }
        }

        if (actualRepeatCount < repeatCount) {
            alert("Aviso: Apenas " + actualRepeatCount + " de " + repeatCount + " animações foram colocadas devido às restrições de espaço e espaçamento mínimo.");
        }

    } catch (error) {
        alert("Erro ao aplicar animação: " + error.toString());
    }
}
function removerCamadaPreview() {
    var comp = app.project.activeItem;
    if (comp && comp instanceof CompItem) {
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            if (layer.name.indexOf("Preview_") === 0) {
                layer.remove();
                break;
            }
        }
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