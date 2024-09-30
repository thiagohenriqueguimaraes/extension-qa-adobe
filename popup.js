document.addEventListener('DOMContentLoaded', function() {
  const experimentType = document.getElementById('experimentType');
  const variantDiv = document.getElementById('variantDiv');
  const saveButton = document.getElementById('saveButton');
  const clearButton = document.getElementById('clearButton');
  const tokenInput = document.getElementById('tokenInput');
  const variantSelect = document.getElementById('variantSelect');
  const url = 'https://www.santander.com.br/';

  function toggleClearButton() {
    chrome.cookies.get({ "url": url, "name": 'at_qa_mode' }, (cookie) => {
      if (cookie) {
        clearButton.classList.remove('hidden');
      } else {
        clearButton.classList.add('hidden');
      }
    });
  }
  toggleClearButton();

  // Mostra ou esconde as opções de variante com base no tipo de experimento selecionado
  experimentType.addEventListener('change', function() {
    const typeIsTestAb = experimentType.value === '1';
    if (typeIsTestAb) {
      variantDiv.classList.remove('hidden');
    } else {
      variantDiv.classList.add('hidden');
    }
  });

  // Função para salvar no cookie e injetar o script na página
  saveButton.addEventListener('click', function() {
    const token = tokenInput.value;
    const type = experimentType.value;
    let variant = 1;
    if (type == '1') {
      variant = variantSelect.value;
    }

    // Salvar no cookie
    chrome.cookies.set({
      url: url,
      name: 'at_qa_mode',
      value: JSON.stringify({
        token: token,
        listedActivitiesOnly: 'true',
        previewIndexes: [{ type, variant }]
      }),
      expirationDate: Math.floor(Date.now() / 1000) + 3600
    });
    toggleClearButton();

    // Injetar o script no contexto principal da página
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          world: 'MAIN', // Executar no contexto principal da página
          func: executeAlloySendEvent,
          args: [token, type, variant]
        }, (results) => {
          if (chrome.runtime.lastError) {
            console.error('Erro ao injetar o script:', chrome.runtime.lastError);
          } else {
            console.log('Script injetado com sucesso:', results);
          }
        });
      } else {
        console.error('Nenhuma aba ativa encontrada.');
      }
    });

    alert('Informações salvas no cookie!');
  });

  // Função para limpar o cookie
  clearButton.addEventListener('click', function() {
    chrome.cookies.remove({
      url: url,
      name: 'at_qa_mode'
    });
    toggleClearButton();
    alert('Informações limpas do cookie!');
  });

  // Função a ser injetada na página
  function executeAlloySendEvent(token, type, variant) {
    (function() {
      function waitForAlloy(callback) {
        var maxAttempts = 50;
        var attempts = 0;
        var checkAlloy = setInterval(function() {
          if (typeof alloy !== 'undefined') {
            clearInterval(checkAlloy);
            callback();
          } else {
            attempts++;
            if (attempts >= maxAttempts) {
              clearInterval(checkAlloy);
              console.error('Timeout: alloy não foi definido após esperar 5 segundos.');
            }
          }
        }, 100);
      }

      waitForAlloy(function() {
        console.log('Executando alloy("sendEvent") com os parâmetros:');
        console.log('Token:', token);
        console.log('Type:', type);
        console.log('Variant:', variant);

        alloy('sendEvent', {
          renderDecisions: true,
          decisionScopes: ['__view__'],
          xdm: {
            web: {
              webPageDetails: {
                URL: 'https://www.santander.com.br/?at_preview_token=' + token + '&at_preview_index=' + type + '_' + variant + '&at_preview_listed_activities_only=true'
              }
            }
          }
        }).then(function(response) {
          console.log('Atividade de preview carregada com sucesso:', response);
        }).catch(function(error) {
          console.error('Erro ao carregar a atividade de preview:', error);
        });
      });
    })();
  }
});

