const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");
let db = null;
const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Sever is Started");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
initializeDBandServer();

convertSneakCaseToCamelCaseState = (each) => {
  return {
    stateId: each.state_id,
    stateName: each.state_name,
    population: each.population,
  };
};

convertSneakCaseToCamelCaseDistrict = (each) => {
  return {
    districtId: each.district_id,
    districtName: each.district_name,
    stateId: each.state_id,
    cases: each.cases,
    cured: each.cured,
    active: each.active,
    deaths: each.deaths,
  };
};

app.get("/states/", async (request, response) => {
  const getStatesDetails = `
    SELECT * FROM state
    ORDER BY state_id;`;
  const stateArray = await db.all(getStatesDetails);
  response.send(
    stateArray.map((eachState) => convertSneakCaseToCamelCaseSate(eachState))
  );
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getRequiredState = `
    SELECT * FROM state
    WHERE state_id = ${stateId}`;
  const state = await db.get(getRequiredState);
  response.send(state);
});

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const postDistrict = `
    INSERT INTO district (district_name, state_id, cases, cured, active, deaths)
    VALUES ('${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths});`;
  const district = await db.run(postDistrict);
  //   const districtId = district.lastId;
  response.send("District Successfully Added");
});

app.get("/districts/", async (request, response) => {
  const getRequiredState = `
    SELECT * FROM district
    ORDER BY district_id;`;
  const district = await db.all(getRequiredState);
  response.send(
    district.map((eachDistrict) =>
      convertSneakCaseToCamelCaseDistrict(eachDistrict)
    )
  );
});

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getRequiredState = `
    SELECT * FROM district
    WHERE district_id = ${districtId}`;
  const district = await db.get(getRequiredState);
  response.send(convertSneakCaseToCamelCaseDistrict(district));
});

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrict = `
    DELETE FROM district
    WHERE district_id = ${districtId};`;
  await db.run(deleteDistrict);
  response.send("District is Deleted");
});

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const putDistrict = `
    UPDATE district
    SET district_name = ${districtName},
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths}
    WHERE district_id = ${districtId};`;
  await db.run(putDistrict);
  response.send("Put Method is Successfully Addedd");
});

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateReport = `
    SELECT SUM(cases) AS cases, SUM(cured) AS cured, SUM(active) AS active, SUM(deaths) AS deaths
    FROM district
    WHERE state_id = ${stateId};`;
  const stateReport = await db.get(getStateReport);
  response.send(stateReport);
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const stateDetails = `
    SELECT state_name FROM state JOIN district ON state.state_id = district.state_id
    WHERE district.district_id = ${districtId};`;
  const stateName = await db.get(stateDetails);
  response.send(stateName);
});
