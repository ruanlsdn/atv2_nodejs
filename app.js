const read = require("readline-sync");
const csvService = require("./services/csv_service");

(async () => {
  const database = require("./services/database_service");

  const uf = await csvService.convertCsvToJson("assets/uf.csv");
  const cidade_populacao = await csvService.convertCsvToJson(
    "assets/cidade_populacao.csv"
  );
  const cidade_siafi = await csvService.convertCsvToJson(
    "assets/cidade_siafi.csv"
  );
  const empresas_bahia = await csvService.convertCsvToJson(
    "assets/empresas_bahia.csv"
  );

  var cidades = [];
  var ufs = [];
  var empresas = [];

  const option = showMenuInformation();
  switch (option) {
    case 1:
      cidade_siafi.forEach((cidade) => {
        const result = cidade_populacao.filter(
          (data) => data.cod_ibge == cidade.codigo_ibge
        )[0];

        cidades.push({
          nome: cidade.nome,
          populacao: result.populacao,
          nome_uf: result.nome_uf,
          latitude: cidade.latitude,
          longitude: cidade.longitude,
          cod_uf: cidade.codigo_uf,
          cod_ibge: cidade.codigo_ibge,
          cod_siafi: cidade.siafi_id,
        });
      });

      uf.forEach((item) => {
        const result = cidades.filter(
          (data) => data.cod_uf == item.codigo_uf
        )[0];
        const newUf = { sigla: item.uf, nome_uf: result.nome_uf };
        !ufs.includes(newUf) ? ufs.push(newUf) : null;
      });

      // ufs.forEach((uf, i) => {
      //   database.insertUf(uf);
      // });

      // const newCidades = cidades.filter((data) => data.nome_uf == "Bahia");

      // newCidades.forEach((cidade, i) => {
      //   if (i < 50) database.insertCidade(cidade);
      // });

      // empresas_bahia.forEach((empresa) => {
      //   database.insertEmpresa(empresa);
      // });

      empresas = await database.selectEmpresaToCsv();

      csvService.generateCsv(empresas);

      break;

    case 2:
      break;

    default:
      break;
  }

  function showMenuInformation() {
    console.log(
      "1 - Start"
    );
    console.log("2 - Inserir e relacionar os dados e tabelas no banco.");
    return parseInt(read.question("Qual opcao deseja executar?\n"));
  }
})();
