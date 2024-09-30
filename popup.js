document.addEventListener('DOMContentLoaded', function() {
    const experimentType = document.getElementById('experimentType');
    const variantDiv = document.getElementById('variantDiv');
    const saveButton = document.getElementById('saveButton');
    const clearButton = document.getElementById('clearButton');
    const tokenInput = document.getElementById('tokenInput');
    const variantSelect = document.getElementById('variantSelect');
    const url = 'https://www.santander.com.br/'
  
    //const url = 'https://www.santander.com.br/'
    function toogleClarButton() {
      chrome.cookies.get({"url": url, "name": 'at_qa_mode'}, (cookie) => {
        clearButton.classList[cookie?'remove':'add']('hidden')
      });
    }
    toogleClarButton()
    // Mostra ou esconde as opções de variante com base no tipo de experimento selecionado
    experimentType.addEventListener('change', function() {
      const typeIsTestAb = experimentType.value === '1'
      variantDiv.classList[typeIsTestAb?'remove':'add']('hidden');
    });
  
    // Função para salvar no cookie
    saveButton.addEventListener('click', function() {
      const token = tokenInput.value;
      const type = experimentType.value;
      let variant = 1;
      if (type == '1') {
        variant = variantSelect.value;
      }
      
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
      toogleClarButton()

      alloy('sendEvent', {
        renderDecisions: true, // Renderize as decisões automaticamente
        decisionScopes: ['__view__'], // Ajuste para o escopo correto da sua página
        xdm: {
          web: {
            webPageDetails: {
              URL: `https://www.santander.com.br/?at_preview_token=${token}&at_preview_index=${type}_${variant}&at_preview_listed_activities_only=true`
            }}}
      }).then(function(response) {
        console.log('Atividade de preview carregada com sucesso:', response);
      }).catch(function(error) {
        console.error('Erro ao carregar a atividade de preview:', error);
      });
      alert('Informações salvas no cookie!');
    });
  
    // Função para limpar o cookie
    clearButton.addEventListener('click', function() {
      chrome.cookies.remove({
        url: url, 
        name: 'at_qa_mode'
      });
      toogleClarButton()
      alert('Informações limpas do cookie!');
    });
  });
  