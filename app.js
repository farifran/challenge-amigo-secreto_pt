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
    let sorteado = Math.floor(Math.random() * amigos.length);
    document.getElementById('resultado').innerHTML = `<li>${amigos[sorteado]}</li>`

}
