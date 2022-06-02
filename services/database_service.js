const mysql = require("mysql2/promise");

var con = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "atv2_db",
});

const insertUf = async (uf) => {
  const sql = "INSERT INTO uf (sigla, nome_uf) values (?, ?)";
  const values = [uf.sigla, uf.nome_uf];
  await con.query(sql, values);
  console.log("\nInserido.");
  console.log(uf);
};

const insertCidade = async (cidade) => {
  const sql = "INSERT INTO cidade (uf_id, nome, populacao, latitude, longitude, cod_ibge, cod_siafi) values (?, ?, ?, ?, ?, ?, ?)";
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

  con.query(sql, values);
  console.log("\nInserido.");
  console.log(cidade);
};

const insertEmpresa = async (empresa, maioresCidades) => {
  const slug = require("slug");
  const sql = "INSERT INTO empresa (cidade_id, slug, nome_fantasia, dt_inicio_atividade, cnae_fiscal, cep, porte, dist_1, dist_2, dist_3, dist_4) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const cidade = await findCidadeBySiafi(empresa.municipio);

  if (cidade.length != 0) {
    const distancias = [];

    for (let i = 0; i < maioresCidades.length; i++) {
      distancias.push(getDistanceFromLatLonInKm(maioresCidades[i], cidade));
    }

    const values = [
      cidade[0].id,
      slug(empresa.nome_fantasia),
      empresa.nome_fantasia,
      empresa.dt_inicio_atividades,
      empresa.cnae_fiscal,
      empresa.cep,
      empresa.porte,
      distancias[0],
      distancias[1],
      distancias[2],
      distancias[3],
    ];

    await con.query(sql, values);
    console.log("\nInserido.");
    console.log(empresa);
  }
};

const selectEmpresaToCsv = async () => {
  const sql =
    "SELECT e.nome_fantasia, e.slug, e.dt_inicio_atividade, e.porte, e.dist_1, e.dist_2, e.dist_3 ,e.dist_4, c.nome, u.sigla, c.populacao, c.latitude, c.longitude FROM empresa AS e " +
    "LEFT JOIN cidade AS c ON c.id = e.cidade_id " +
    "LEFT JOIN uf AS u ON u.id = c.uf_Id";
  const [results] = await con.query(sql);
  return results;
};

const findUfByName = async (nome) => {
  const [result] = await con.query("SELECT * from uf WHERE nome_uf = '" + nome + "'");
  return result;
};

const findCidadeBySiafi = async (siafi) => {
  const [result] = await con.query("SELECT * from cidade WHERE cod_siafi = '" + siafi + "'");
  return result;
};

function getDistanceFromLatLonInKm(position1, position2) {
  "use strict";
  var deg2rad = function (deg) {
      return deg * (Math.PI / 180);
    },
    R = 6371,
    dLat = deg2rad(position2[0].latitude - position1.latitude),
    dLng = deg2rad(position2[0].longitude - position1.longitude),
    a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(position1.latitude)) *
        Math.cos(deg2rad(position1.latitude)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2),
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed();
}

module.exports = {
  insertUf: insertUf,
  insertCidade: insertCidade,
  insertEmpresa: insertEmpresa,
  selectEmpresaToCsv: selectEmpresaToCsv,
};
