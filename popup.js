document.addEventListener('DOMContentLoaded', function() {
    const experimentType = document.getElementById('experimentType');
    const variantDiv = document.getElementById('variantDiv');
    const saveButton = document.getElementById('saveButton');
    const clearButton = document.getElementById('clearButton');
    const tokenInput = document.getElementById('tokenInput');
    const variantSelect = document.getElementById('variantSelect');
  
    // Mostra ou esconde as opções de variante com base no tipo de experimento selecionado
    experimentType.addEventListener('change', function() {
      if (experimentType.value === 'testeab') {
        variantDiv.classList.remove('hidden');
      } else {
        variantDiv.classList.add('hidden');
      }
    });
  
    // Função para salvar no cookie
    saveButton.addEventListener('click', function() {
      const token = tokenInput.value;
      const type = experimentType.value;
      let variant = 1;
      console.log('experimentType.value: ', type)
      if (type == '1') {
        variant = variantSelect.value;
      }
      
      chrome.cookies.set({
        url: window.location.hostname, // Altere para o site correto
        name: 'at_qa_mode',
        value: JSON.stringify({
            token: token,
            listedActivitiesOnly: 'false',
            previewIndexes: [{ type, variant }]
        }),
        expirationDate: Math.floor(Date.now() / 1000) + 3600 // expira em 1 hora
      });
  
      alert('Informações salvas no cookie!');
    });
  
    // Função para limpar o cookie
    clearButton.addEventListener('click', function() {
      chrome.cookies.remove({
        url: window.location.hostname, // Altere para o site correto
        name: 'at_qa_mode'
      });
  
      alert('Informações limpas do cookie!');
    });
  });
  