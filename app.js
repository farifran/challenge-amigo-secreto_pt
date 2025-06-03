let amigos = [];

//percorre o array amigos e adiciona cada nome como um elemento <li> dentro de uma lista HTML
function criarLista(){
    amigos.forEach(amigo => {
        document.getElementById('listaAmigos').innerHTML += `<li>${amigo}</li>`
    })
}

//adiciona um nome sem erro à lista de amigos criada anteriormente.
function adicionarAmigo(){
    let inputValue = document.querySelector('input').value;
    if(/[^a-zA-Z\u00E0-\u00FC\s]/.test(inputValue) || inputValue == ''){
        alert('Por favor, insira um nome.');
    }else{
        amigos.push(inputValue.trim());
        document.querySelector('input').value = '';
        document.getElementById('listaAmigos').innerHTML = '';
        criarLista();
        console.log(amigos);
        }
}

//sortear um amigo secreto
function sortearAmigo(){
    if (amigos.length === 0) {
        alert("A lista de amigos está vazia. Adicione amigos primeiro.");
        document.getElementById('resultado').innerHTML = '';
        return;
    }

    let myNameInput = document.getElementById('inputMyName');
    let myName = "";
    if (myNameInput) { // Check if the element exists
        myName = myNameInput.value.trim().toLowerCase();
    }

    let potentialTargets = amigos;
    if (myName !== "") {
        potentialTargets = amigos.filter(amigo => amigo.trim().toLowerCase() !== myName);
    }

    if (potentialTargets.length === 0) {
        alert("Não foi possível sortear um amigo diferente. Verifique a lista ou o nome a ser excluído.");
        document.getElementById('resultado').innerHTML = '';
        return;
    }

    let sorteadoIndex = Math.floor(Math.random() * potentialTargets.length);
    let nomeSorteado = potentialTargets[sorteadoIndex];

    let resultadoElement = document.getElementById('resultado');
    resultadoElement.innerHTML = ''; // Clear previous results

    // Disable the sortear button
    let sortearButton = document.querySelector('.button-draw');
    if (sortearButton) {
        sortearButton.disabled = true;
    }

    let currentIndex = 0;
    const animationInterval = setInterval(() => {
        resultadoElement.innerHTML = `<li>${potentialTargets[currentIndex]}</li>`;
        currentIndex = (currentIndex + 1) % potentialTargets.length;
    }, 100);

    setTimeout(() => {
        clearInterval(animationInterval);
        resultadoElement.innerHTML = `<li class="final-result">${nomeSorteado}</li>`;
        // Re-enable the sortear button
        if (sortearButton) {
            sortearButton.disabled = false;
        }
    }, 3000); // Animation duration: 3 seconds
}