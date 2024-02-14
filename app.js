const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.join(__dirname, "cricketTeam.db");

app.use(express.json());

let db = null;

const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// GET Players API

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
  SELECT
   * 
  FROM 
  cricket_team;`;
  const dbResponse = await db.all(getPlayerQuery);
  response.send(
    dbResponse.map((dbObject) => convertDbObjectToResponseObject(dbObject))
  );
});

// GET Player API

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
  SELECT
    *
  FROM 
    cricket_team
  WHERE 
    player_id=${playerId};`;
  const dbResponse = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(dbResponse));
});

// POST Players API

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const addPlayerQuery = `
  INSERT INTO 
    cricket_team
    (player_name, jersey_number, role)
   Values
   ('${playerName}', ${jerseyNumber},'${role}');`;

  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

// PUT Player API

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;

  const putPlayerQuery = `
  UPDATE
     cricket_team
  SET
    player_name='${playerName}',
    jersey_number = ${jerseyNumber},
    role='${role}'
  WHERE
    player_id =${playerId};`;

  const dbResponse = await db.run(putPlayerQuery);
  response.send("Player Details Updated");
});

// DELETE Player API

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayerQuery = `
    DELETE 
        FROM 
        cricket_team
    WHERE 
        player_id=${playerId};`;
  const dbResponse = await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
