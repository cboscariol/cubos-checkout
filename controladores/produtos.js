const data = require("../data.json");

let produtos = data.produtos;
const initialCart = {
    "subtotal": 0,
    "dataDeEntrega": null,
    "valorDoFrete": 0,
    "totalAPagar": 0,
    "produtos": []
};
let cart = initialCart

function atualizarCarrinho() {
    const date = new Date()
    date.setDate(date.getDate() +15) 
    cart.subtotal = cart.produtos.reduce((subTotal, produto) => subTotal + produto.preco ,0)
    cart.dataDeEntrega =   cart.produtos.length > 0 ? date : null
    cart.valorDoFrete = cart.subtotal <= 20000 && cart.produtos.length > 0 ? 5000 : 0;
    cart.totalAPagar = cart.subtotal + cart.valorDoFrete 
}

function pegarProdutos(req, res) {
    const categoria = req.query.categoria;
    const precoInicial = req.query.precoInicial
    const precoFinal = req.query.precoFinal

    let listaProdutos = produtos;

    if(categoria) {
        listaProdutos = listaProdutos.filter((produto) => {
            return produto.categoria.toLowerCase() === categoria.toLowerCase()
        })
    }

    if(precoInicial && precoFinal) {
        listaProdutos = listaProdutos.filter((produto) => {
            return produto.preco >= precoInicial && produto.preco <= precoFinal
        })
    }

    res.json(listaProdutos)
}

function pegarProdutosCarrinho(req,res) {
    res.json(cart)
}


function adicionarProdutos(req, res) {
    const id = req.body.id;
    const quantidade = req.body.quantidade;

    const produto = produtos.find((produto) => {
        return id === produto.id
    })

    if(produto){
        const produtoNoCarrinho = cart.produtos.find((produto) =>  id === produto.id)
        const quantidadeNoCarrinho = produto.estoque >= quantidade;

        if(quantidadeNoCarrinho){
            produtos = produtos.map((produto) =>{
                if(id === produto.id){
                    produto.estoque -= quantidade
                }

                return produto
            })
        } else {
            return res.status(404).send(`Não temos ${quantidade} itens no estoque`)
        }

        if(produtoNoCarrinho){
            cart.produtos = cart.produtos.map((produto) =>{
                if(id === produto.id){
                    produto.quantidade += quantidade
                }

                return produto
            })
        } else {
            const novoProduto = {...produto}
            novoProduto.quantidade = quantidade
            delete novoProduto.estoque
            cart.produtos.push(novoProduto)
        }
    }
    atualizarCarrinho();
    res.json(cart)
}

function editarProduto(req, res) {
    const id = Number(req.params.idProduto);
    const quantidade = req.body.quantidade;

    const produtoNoCarrinho = cart.produtos.find((produto) => id === produto.id)//verifica de produto está no carrinho

    if(!produtoNoCarrinho){
        return res.status(404).send("Produto não encontrado no carrinho")
    }

    const produtoDoEstoque = produtos.find((produto) => produto.id === id) 
    const temNoEstoque = quantidade <= produtoDoEstoque.estoque

    if(!temNoEstoque){
        return res.status(400).send("Não tem essa quantidade de produtos no estoque")
    }
    if((quantidade * -1) > produtoNoCarrinho.quantidade){
        return res.status(400).send("Você está tentando tirar mais itens do que a quantidade que tem no carrinho")
    }

    cart.produtos = cart.produtos.map((produto) => {
        if(produto.id === id){
            produto.quantidade += quantidade
        }
        return produto
    })
    
    produtos = produtos.map((produto) =>{
        if(id === produto.id){
            produto.estoque -= quantidade
        }

        return produto
    })

    atualizarCarrinho();
    res.json(cart)
}






function deletarProdutos(req, res) {
    const idProduto = Number(req.params.idProduto)
    
    const produtoNoCarrinho = cart.produtos.find((produto) => idProduto === produto.id)

    if(!produtoNoCarrinho){
        return res.status(404).send("Produto não encontrado no carrinho")
    }

    produtos = produtos.filter((produto) => {
        if(produto.id === idProduto){
            produto.estoque += produtoNoCarrinho.quantidade
        }
        return produto
    })
    cart.produtos = cart.produtos.filter((produto) => produto.id !== idProduto)

    atualizarCarrinho();
    res.json(cart)
}

function deletarCarrinho(req, res) {
    cart = initialCart
    res.json(cart)
}


module.exports = {
    pegarProdutos,
    pegarProdutosCarrinho,
    adicionarProdutos,
    deletarProdutos,
    deletarCarrinho,
    editarProduto,
} 