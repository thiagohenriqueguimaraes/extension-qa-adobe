document.addEventListener('DOMContentLoaded', function() {
  const experimentType = document.getElementById('experimentType');
  const variantDiv = document.getElementById('variantDiv');
  const saveButton = document.getElementById('saveButton');
  const clearButton = document.getElementById('clearButton');
  const tokenInput = document.getElementById('tokenInput');
  const variantSelect = document.getElementById('variantSelect');
  const url = 'https://www.santander.com.br/';

  function toogleClearButton() {
    chrome.cookies.get({ "url": url, "name": 'at_qa_mode' }, (cookie) => {
      clearButton.classList[cookie ? 'remove' : 'add']('hidden');
    });
  }
  toogleClearButton();

  // Mostra ou esconde as opções de variante com base no tipo de experimento selecionado
  experimentType.addEventListener('change', function() {
    const typeIsTestAb = experimentType.value === '1';
    variantDiv.classList[typeIsTestAb ? 'remove' : 'add']('hidden');
  });

  // Função para salvar no cookie e enviar mensagem ao content script
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
    toogleClearButton();

    // Enviar mensagem ao content script
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'executeAlloySendEvent',
        data: {
          token: token,
          type: type,
          variant: variant
        }
      }, function(response) {
        if (chrome.runtime.lastError) {
          console.log('Mensagem enviada ao content script:', {
            action: 'executeAlloySendEvent',
            data: { token, type, variant }
          });
          console.error('Erro ao enviar mensagem ao content script:', chrome.runtime.lastError);
        } else {
          console.log('Resposta do content script:', response);
        }
      });
    });

    alert('Informações salvas no cookie!');
  });

  // Função para limpar o cookie
  clearButton.addEventListener('click', function() {
    chrome.cookies.remove({
      url: url,
      name: 'at_qa_mode'
    });
    toogleClearButton();
    alert('Informações limpas do cookie!');
  });
});