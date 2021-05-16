const express = require("express");
const controladores = require("./controladores/produtos")

const roteador = express();

roteador.get("/produtos", controladores.pegarProdutos);

roteador.get("/carrinho", controladores.pegarProdutosCarrinho);

roteador.post("/carrinho/produtos", controladores.adicionarProdutos);

roteador.patch("/carrinho/produtos/:idProduto", controladores.editarProduto);

roteador.delete("/carrinho", controladores.deletarCarrinho);

roteador.delete("/carrinho/produtos/:idProduto", controladores.deletarProdutos);


module.exports = roteador

