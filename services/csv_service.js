const fs = require("fs");
const fastCsv = require("fast-csv");

module.exports = {
  convertCsvToJson: function convertCsvToJson(path) {
    return new Promise((resolve, reject) => {
      const options = {
        objectMode: true,
        delimiter: ",",
        quote: null,
        headers: true,
        renameHeaders: false,
      };

      let data = [];

      const readingStream = fs.createReadStream(path);
      readingStream
        .on("error", (error) => {
          console.log("error", error);
        })
        .pipe(fastCsv.parse(options))
        .on("data", (line) => {
          readingStream.pause();
          data.push(line);
          readingStream.resume();
        })

        .on("end", () => {
          resolve(data);
        })
        .on("error", () => {
          reject();
        });
    });
  },

  generateCsv: function generateCsv(itens) {
    const csvStream = fastCsv.format({
      headers: [
        "nome_fantasia",
        "slug",
        "inicio_atividades",
        "porte_empresa",
        "nome_cidade",
        "sigla_uf",
        "populacao_cidade",
        "latitude_cidade",
        "longitude_cidade",
      ],
    });

    const writeStream = fs.createWriteStream("assets/outputfile.csv");
    csvStream.pipe(writeStream);

    for (var i = 0; i < itens.length; i++) {
      csvStream.write([
        itens[i].nome_fantasia,
        itens[i].slug,
        new Date(itens[i].dt_inicio_atividade).toLocaleDateString(),
        itens[i].porte,
        itens[i].nome,
        itens[i].sigla,
        itens[i].populacao,
        itens[i].latitude,
        itens[i].longitude,
      ]);
    }

    csvStream.end();
    console.log("Finalizado.")
  },
};
