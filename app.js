const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db Error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//get cricketteam

app.get("/players/", async (request, response) => {
  const getCricketTeamQuery = `
  SELECT 
    * 
  FROM 
    cricket_team;`;
  const cricketArray = await db.all(getCricketTeamQuery);
  response.send(
    cricketArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//add cricketteam

app.post("/players/", async (request, response) => {
  const addCricketTeam = request.body;
  const { playerName, jerseyNumber, role } = addCricketTeam;
  const postCricketTeamQuery = `
    INSERT INTO
      cricket_team (player_name,jersey_number,role)
    VALUES
      (
        '${playerName}',
         ${jerseyNumber},
         '${role}'
      );`;

  const dbResponse = await db.run(postCricketTeamQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
  //response.send({ playerId: playerId });
});

//get playerId in cricketteam

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getCricketTeamQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`;
  const player = await db.get(getCricketTeamQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//update cricketteam

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const updateCricketTeam = request.body;
  const { playerName, jerseyNumber, role } = updateCricketTeam;
  const updateCricketTeamQuery = `
    UPDATE 
    cricket_team
    SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}';
    WHERE 
     player_id = ${playerId}`;

  await db.run(updateCricketTeamQuery);
  response.send("Player Details Updated");
});

//DELETE CRICKETTEAM

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteCricketTeamQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId}`;
  await db.run(deleteCricketTeamQuery);
  response.send("Player Removed");
});
module.exports = app;
