console.log('content_script.js carregado.');
  
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Mensagem recebida no content script:', request);

  if (request.action === 'executeAlloySendEvent') {
    const { token, type, variant } = request.data;

    // Injetar o script na página
    injectScript(token, type, variant);

    sendResponse({ status: 'Script injetado na página' });
  }
  return true;
});

function injectScript(token, type, variant) {
    console.log('Iniciando a injeção do script na página.');
  
    const scriptContent = `
      (function() {
        console.log('Script injetado na página iniciado.');
        function waitForAlloy(callback) {
          var maxAttempts = 50;
          var attempts = 0;
          var checkAlloy = setInterval(function() {
            if (typeof alloy !== 'undefined') {
              clearInterval(checkAlloy);
              console.log('Alloy está disponível na página.');
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
          console.log('Token:', '${token}');
          console.log('Type:', '${type}');
          console.log('Variant:', '${variant}');
  
          alloy('sendEvent', {
            renderDecisions: true,
            decisionScopes: ['__view__'],
            xdm: {
              web: {
                webPageDetails: {
                  URL: 'https://www.santander.com.br/?at_preview_token=${token}&at_preview_index=${type}_${variant}&at_preview_listed_activities_only=true'
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
    `;

  const script = document.createElement('script');
  script.textContent = scriptContent;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}