const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
module.exports = app;

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
module.exports = app;

// GET PLAYERS API
const convertDBObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT * FROM cricket_team;
    
    `;

  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDBObjectToResponseObject(eachPlayer)
    )
  );
});

//Players POST API
app.post("/players/", async (request, response) => {
  const playersDetails = request.body;
  const { playerName, jerseyNumber, role } = playersDetails;
  const addPlyersQuery = `
    INSERT INTO cricket_team(playerName, jerseyNumber,role)
    VALUES
    ('${playersName}',
        ${jerseyNumber},
        '${role}');`;
  const dbResponse = await db.run(addPlyersQuery);
  const playerId = dbResponse.lastID;
  response.send({ playerId: playerId });
});
//GET API
const getDBObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playersQuery = `
    SELECT
         * 
    FROM 
        cricket_team 
    WHERE   
        player_id=${playerId};
 `;
  const playersArray = await db.get(playersQuery);
  response.send(playersArray);
});

//UPDATE API
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playersDetails = request.body;
  const { playerName, jerseyNumber, role } = playersDetails;
  const updatePlayerQuery = `
        UPDATE 
            cricket_team
        SET
            player_name='${playerName}',
            jersey_number=${jerseyNumber},
            role=${role}
        WHERE 
            player_id=${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
        DELETE FROM 
            cricket_team
        WHERE 
            player_id= ${playerId};
    `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
