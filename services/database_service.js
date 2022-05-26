const connect = async () => {
  const mysql = require("mysql2/promise");
  const con = mysql.createPool("mysql://root:password@localhost:3306/atv2_db");
  return con;
};

const insertUf = async (uf) => {
  const connection = await connect();
  const sql = "INSERT INTO uf (sigla, nome_uf) values (?, ?)";
  const values = [uf.sigla, uf.nome_uf];
  await connection.query(sql, values);
  console.log(1)
};

const insertCidade = async (cidade) => {
  const connection = await connect();
  const sql =
    "INSERT INTO cidade (uf_id, nome, populacao, latitude, longitude, cod_ibge, cod_siafi) values (?, ?, ?, ?, ?, ?, ?)";
  const uf = await findUfByName(cidade.nome_uf);
  const values = [
    uf[0].id,
    cidade.nome,
    cidade.populacao,
    cidade.latitude,
    cidade.longitude,
    cidade.cod_ibge,
    cidade.cod_siafi,
  ];

  await connection.query(sql, values);
};

const insertEmpresa = async (empresa) => {
  const slug = require("slug");
  const connection = await connect();
  const sql =
    "INSERT INTO empresa (cidade_id, slug, nome_fantasia, dt_inicio_atividade, cnae_fiscal, cep, porte) values (?, ?, ?, ?, ?, ?, ?)";
  const cidade = await findCidadeBySiafi(empresa.municipio);
  if (cidade.length != 0) {
    const values = [
      cidade[0].id,
      slug(empresa.nome_fantasia),
      empresa.nome_fantasia,
      empresa.dt_inicio_atividades,
      empresa.cnae_fiscal,
      empresa.cep,
      empresa.porte,
    ];
    await connection.query(sql, values);
  }
};

const selectEmpresaToCsv = async () => {
  const connection = await connect();
  const sql =
    "SELECT e.nome_fantasia, e.slug, e.dt_inicio_atividade, e.porte, c.nome, u.sigla, c.populacao, c.latitude, c.longitude FROM empresa AS e " +
    "LEFT JOIN cidade AS c ON c.id = e.cidade_id " +
    "LEFT JOIN uf AS u ON u.id = c.uf_Id";
  const [results] = await connection.query(sql);
  return results;
};

const findUfByName = async (nome) => {
  const connection = await connect();
  const [result] = await connection.query(
    "SELECT * from uf WHERE nome_uf = '" + nome + "'"
  );
  return result;
};

const findCidadeBySiafi = async (siafi) => {
  const connection = await connect();
  const [result] = await connection.query(
    "SELECT * from cidade WHERE cod_siafi = '" + siafi + "'"
  );

  return result;
};

module.exports = {
  insertUf: insertUf,
  insertCidade: insertCidade,
  insertEmpresa: insertEmpresa,
  selectEmpresaToCsv: selectEmpresaToCsv,
};
