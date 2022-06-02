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

  const cidades = builderCidades(cidade_siafi, cidade_populacao).filter(
    (data) => data.nome_uf == "Bahia"
  );

  const maioresCidades = getMaioresCidades(cidades);

  const ufs = builderUfs(uf, cidades);

  const option = showMenuInformation();

  switch (option) {
    case 1:
      ufs.forEach((uf) => {
        database.insertUf(uf);
      });
      break;

    case 2:
      cidades.forEach((cidade, i) => {
        i <= 50 ? database.insertCidade(cidade) : null;
      });

      break;

    case 3:
      empresas_bahia.forEach((empresa) => {
        database.insertEmpresa(empresa, maioresCidades);
      });
      break;

    case 4:
      const empresas = await database.selectEmpresaToCsv();
      csvService.generateCsv(empresas);
      break;

    default:
      break;
  }
})();

function showMenuInformation() {
  console.log("1 - Inserir os dados de UF no banco de dados.");
  console.log("2 - Inserir os dados de CIDADE no banco de dados.");
  console.log("3 - Inserir os dados de EMPRESA no banco de dados.");
  console.log("4 - Gerar arquivo .csv.");

  return parseInt(read.question("Qual opcao deseja executar?\n"));
}

function builderCidades(cidade_siafi, cidade_populacao) {
  const cidades = [];

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

  return cidades;
}

function builderUfs(uf, cidades) {
  const ufs = [];

  uf.forEach((item) => {
    const result = cidades.filter((data) => data.cod_uf == item.codigo_uf);

    if (result.length != 0) {
      const newUf = { sigla: item.uf, nome_uf: result[0].nome_uf };
      !ufs.includes(newUf) ? ufs.push(newUf) : null;
    }
  });

  return ufs;
}

function getMaioresCidades(cidades) {
  const nomes = [
    "Salvador",
    "Feira de Santana",
    "Vitória da Conquista",
    "Camaçari",
  ];

  const maioresCidades = [];

  cidades.forEach((cidade) => {
    for (let i = 0; i < nomes.length; i++) {
      if (cidade.nome === nomes[i]) {
        maioresCidades.push(cidade);
      }
    }
  });

  return maioresCidades;
}
