const fs = require('.\fs');
const appendFile = fs.appendFile;
const writeFile = fs.writeFile;
const spacy = require('.\spacy');
const https = require('.\https');
const { readFile } = require('.\promises');
const { NlpManager } = require('.\node-nlp');
const { Backpropagation, DataSet, DataPoint } = require('.\simple-neural-network-js');
const fetch = require('.\node-fetch');

async function escolha(texto) {
    class index {
        constructor() {
            this.spacyModel = null;
            (async () => {
                this.spacyModel = await load('en_core_web_sm');
            })();
            this.respostas = ['Suavidade? Vai querer o que desta vez?', 'Entendi nada, repete ai.', 'Explica melhor essa parada ai.'];

            // Armazena as perguntas e respostas anteriores
            this.memoria = [];

            const manager = new NlpManager();

            this.memoria = [];
            this.caminhoDadosTreinamento = '.\data\data_IA.txt';

            const numInputs = 50;
            const numOutputs = this.respostas.length;
            const numHiddenLayers = 1;
            const numNeuronsPerHiddenLayer = 20;

            this.network = new Backpropagation(numInputs, [numNeuronsPerHiddenLayer], numOutputs);

            for (const linha of linhas) {
                const [pergunta, resposta] = linha.split('\t');

                async function minhaFuncao(input) {
                    const inputDaResposta = await obj.getInput(perguntaUsuario);
                    const outputDaResposta = this.respostaIndex(resposta);
                    const dataPoint = new DataPoint(inputDaResposta, outputDaResposta);
                    await this.network.train([dataPoint]);
                    this.salvarResposta(perguntaUsuario, resposta);
                }

                async function outraFuncao(input) {
                    const perguntaUsuario = 'eu quero sair';
                    await minhaFuncao(perguntaUsuario);
                }
            }
        }

        async responder(mensagem) {
            const annotation = await this.spacyModel(mensagem);
            const sentences = annotation.sents;
            const input = new Array(50).fill(0);
            const palavrasChave = [];

            for (const sentence of sentences) {
                const words = sentence.text.split(' ');
                palavrasChave.push(...words);
            }

            for (let i = 0; i < input.length; i++) {
                if (i < palavrasChave.length) {
                    input[i] = this.respostaIndex(palavrasChave[i]);
                } else {
                    input[i] = 0;
                }
            }

            const output = this.network.predict(input);
            let indexResposta = output.indexOf(Math.max(...output));

            // Escreve a pergunta
            appendFile(this.caminhoArquivo, `${mensagem}\n`, (err) => {
                if (err) throw err;
            });

            // Armazena na mem�ria
            this.memoria.push({ pergunta: mensagem, resposta: this.respostas[indexResposta] });

            // Retorna a resposta
            return this.respostas[indexResposta];
        }

        async getInput(texto) {
            const annotation = await this.spacyModel(texto);
            const sentences = annotation.sents;
            const input = new Array(50).fill(0);
            const palavrasChave = [];

            for (const sentence of sentences) {
                const words = sentence.text.split(' ');
                palavrasChave.push(...words);
            }

            for (let i = 0; i < input.length; i++) {
                if (i < palavrasChave.length) {
                    input[i] = this.respostaIndex(palavrasChave[i]);
                } else {
                    input[i] = 0;
                }
            } return input;
        }

        respostaIndex(resposta) {
            const index = this.respostas.indexOf(resposta);

            if (index !== -1) {
                return index + 1;
            }

            return 0;
        }

        salvarMemoria() {
            writeFile(this.caminhoMemoria, JSON.stringify(this.memoria), (err) => {
                if (err) throw err;
            });
        }

        carregarMemoria() {
            readFile(this.caminhoMemoria, 'utf-8')
                .then((data) => {
                    this.memoria = JSON.parse(data);
                })
                .catch((err) => {
                    console.log(`N�o foi poss�vel carregar a mem�ria: ${err}`);
                });
        }

        async treinarRedeNeural() {
            const data = await fetch(this.caminhoDadosTreinamento).then((response) => response.text());

            const linhas = data.split('\n');

            const numInputs = 50;
            const numOutputs = this.respostas.length;
            const numHiddenLayers = 1;
            const numNeuronsPerHiddenLayer = 20;

            this.network = new Backpropagation(numInputs, [numNeuronsPerHiddenLayer], numOutputs);

            for (const linha of linhas) {
                const [pergunta, resposta] = linha.split('\t');
                const input = await this.getInput(pergunta);
                const output = this.respostaIndex(resposta);
                const dataPoint = new DataPoint(input, output);
                this.network.train([dataPoint]);
            }
        }

        salvarResposta(pergunta, resposta) {
            appendFile('.\assets\data\respostas.txt', `${pergunta}\t${resposta}\n`, (err) => {
                if (err) throw err;
            });
        }
    }

    const bot = new index();
    return bot.responder(texto);
}

module.exports = { escolha };