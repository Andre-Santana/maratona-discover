/* const Modal = {
    open() {
        //Abrir modal
        //Adicionar classe active ao modal
        document.querySelector('.modal-overlay')
        .classList.add('active');
    }, 
    close() {
        //fechar o modal
        //remover a class active do modal
        document.querySelector('.modal-overlay')
        .classList.remove('active');
    }
} */

//desafio do Maik
const Modal = {
    open_and_close() {
        //jeito mais simples de abrir e adicionar a classe active e fechar o modal e remover a classe active
        document.querySelector('.modal-overlay').classList.toggle('active');
    }
}

const Storage = { //Para armazenar no nagegador, no local storage
    get() { //para pegar as informações
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) { //para guardar as informações
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

/* 
    Maneira legal de organizar, falando e colocando o que precisa fazer
    Eu preciso somar as entradas,
    depois somar as saidas, remover das entradas o valor das saídas,
    assim eu terei o total
*/

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction);

        App.reload()
    },

    remove(index) { //função para remover itens
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
            // somar as entradas
            /*
                Pegar todas as transações, verificar se é maior que 0, se for
                maior que 0 somar a uma variável e retornar a variável
            */
        let income = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                //income = income + transaction.amount;
                income += transaction.amount; //incurtação
            }
        })
        return income;
    },

    expenses() {
            //somar as saidas
            /*
                Pegar todas as transações, verificar se é menor que 0, se for
                menor que 0 somar a uma variável e retornar a variável
            */
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
                }
            })
            return expense;
    },

    total() { 
            // entradas - saidas
            return Transaction.incomes() + Transaction.expenses(); //Pois temos o sinal negativo e na matemática sinais diferentes fica menos
    }
}
/*
    Preciso pegar minhas transações do meu objeto no javascript (transactions)
    e colocar no HTML, ou seja,
    Substituir os dados do HTML com os dados do JavaScript
*/

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `

        return html
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value) {
        
        value = value * 100

        return Math.round(value)
    },

    formatDate(date) { //Eesolver o problema pois no padrão ele vem em ano, mês e dia separado por traço
        const splittedDate = date.split("-") 

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}` //para separar por barra e colocar na ordem dia/mês/ano
    },

    formatCurrency(value) { //tratamento do número
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "") //Para formar e colocar o cifrão o Maik usou a estratégia de usar o replace que troca algum caractere por outro, e colocou "/\D/g" que significa qualquer caractere que não seja um número trocar pelo ""

        value = Number(value) / 100 //Estou dividindo por 100 para ficar com a vírgula

        value = value.toLocaleString("pt-BR", {  
            style: "currency", 
            currency: "BRL"
        }) //Estratégia para colocar o R$ (moeda brasileira), depois de colocar a função to.LocaleString colocamos o lugar que estamos, ou seja, "pt-BR" e colocamos a formatação que queremos, no caso pegamos o estilo "currency" e colocamos no "currency" a formatação "BRL", que quer dizer na moeda brasileira 

        return signal + value //Concatenando a variável signal (que quer dizer sinal, e nela já que o sinal pode ser negativo, essa função tem a seguinte condição se o sinal for negativo ela vai colocar o sinal de menos "-"), a variável value que significa valor (concatena o R$, a formatação de dinheiro brasileira)
    }
}
 
const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    
    getValues() {
        return { 
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()

        if ( description.trim() == "" || amount.trim() == "" || date.trim() == "" ) { //Validação se tem alguma coisa
            throw new Error("Por favor preencha todos os campos")
        }
    },

    formatValues() {
        let {description, amount, date} = Form.getValues()
        
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            //description: description, //sem atalho
            description, //atalho 
            amount, 
            date
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFilds() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault() //Para não fazer o comportamento padrão, sem essa função vai ficar um monte de informações na barra de endereços

        try {
            //Verificar se todas as informações fora preenchidas
            Form.validateFields()
             //Formartar os dados para salvar 
            const transaction = Form.formatValues()
            // Salvar de fato
            Form.saveTransaction(transaction)
            //apagar os dados do formulário 
            Form.clearFilds()
            // modal feche
            Modal.open_and_close()
            //Atualizar a aplicação
            //não preciso dar um App.reload(), pois já temos um App.reload() no add

        }catch (error){
            alert(error.message)
        }

        
    }
}

const App = {
    init () {
        Transaction.all.forEach(DOM.addTransaction) //atalho de: Transaction.all.forEach((transaction, index) ={DOM.addTransaction(transaction, index)})

        DOM.updateBalance()
        
        Storage.set(Transaction.all)
    },
    reload () {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()
