const pool = require("../db/connect");
const supabase = require("../db/superbaseClient");

const generateRandomString = (length = 7) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
};

class WorkSpace {
  static create(workSpaceData, callback) {
    const { workspacename, description, dateCreate } = workSpaceData;
    const query =
      "INSERT INTO WorkSpace (workspacename, dateCreate, description) VALUES (?, ?, ?)";

    pool.query(
      query,
      [workspacename, dateCreate, description],
      (err, results) => {
        if (err) {
          console.error("Error creating workspace:", err);
          return callback(err, null);
        }
        return callback(null, { id: results.insertId, ...workSpaceData });
      }
    );
  }
  static checkUserRole(userId, workspaceId, callback) {
    const query =
      "SELECT isManager FROM joinWorkSpace WHERE userId = ? AND WorkSpace = ?";

    pool.query(query, [userId, workspaceId], (err, results) => {
      if (err) {
        console.error("Error checking user role:", err);
        return callback(err, null);
      }

      if (results.length === 0) {
        return callback(null, {
          found: false,
          message: "User not part of this workspace",
        });
      }

      return callback(null, {
        found: true,
        isManager: Boolean(results[0].isManager),
      });
    });
  }

  static getWorkspaceManager(workspaceId, callback) {
    const query = `
    SELECT 
      u.userId, 
      u.name, 
      u.email, 
      u.photoPath,
      j.role,
      j.dateJoin
    FROM joinWorkSpace j
    JOIN User u ON j.userId = u.userId
    WHERE j.WorkSpace = ? AND j.isManager = 1
    LIMIT 1
  `;

    pool.query(query, [workspaceId], (err, results) => {
      if (err) {
        console.error("Error fetching workspace manager:", err);
        return callback(err, null);
      }

      if (results.length === 0) {
        return callback(null, {
          found: false,
          message: "No manager found for this workspace",
        });
      }

      const manager = results[0];
      const photoLink = manager.photoPath
        ? `https://kdjkcdkapjgimrnugono.supabase.co/storage/v1/object/public/images/${manager.photoPath}`
        : null;

      return callback(null, {
        found: true,
        manager: {
          userId: manager.userId,
          name: manager.name,
          email: manager.email,
          photoPath: photoLink,
          role: manager.role,
          dateJoin: manager.dateJoin,
        },
      });
    });
  }

  static createForManager(userId, workSpaceData, callback) {
    const { workspacename, description, dateCreate } = workSpaceData;
    WorkSpace.create(workSpaceData, (err, result) => {
      if (err) {
        console.error("Error inserting workspace:", err);
        return callback(err, null);
      }

      const query =
        "INSERT INTO joinWorkSpace (isPending, isManager, role, dateJoin, userId, WorkSpace) VALUES (?, ?, ?,?, ?, ?)";
      pool.query(
        query,
        [false, true, "Leader", dateCreate, userId, result.id],
        (e, r) => {
          if (e) {
            console.error("Error linking workspace to manager:", e);
            return callback(e, null);
          }
          console.log("Workspace created and linked to manager successfully!");
          return callback(null, {
            joinId: r.insertId,
            userId,
            workspaceId: result.id,
          });
        }
      );
    });
  }

  static update(workspaceData, callback) {
    const { id, workspacename, description } = workspaceData;
    const query =
      "UPDATE WorkSpace SET workspacename = ?, description = ? WHERE WorkSpace = ?";

    pool.query(query, [workspacename, description, id], (err, results) => {
      if (err) {
        console.error("Error updating workspace:", err);
        return callback(err, null);
      }

      if (results.affectedRows === 0) {
        return callback({ message: "Workspace not found" }, null);
      }

      return callback(null, { WorkSpace: id, workspacename, description });
    });
  }

  // DELETE API
  static delete(workspaceId, callback) {
    // Start a transaction to ensure data integrity
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting database connection:", err);
        return callback(err, null);
      }

      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          console.error("Error beginning transaction:", err);
          return callback(err, null);
        }

        // Step 1: Delete related records in joinWorkSpace table
        const deleteJoinQuery = "DELETE FROM joinWorkSpace WHERE WorkSpace = ?";
        connection.query(deleteJoinQuery, [workspaceId], (err, results) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              console.error("Error deleting from joinWorkSpace:", err);
              callback(err, null);
            });
          }

          // Step 2: Delete the workspace itself
          const deleteWorkspaceQuery =
            "DELETE FROM WorkSpace WHERE WorkSpace = ?";
          connection.query(
            deleteWorkspaceQuery,
            [workspaceId],
            (err, results) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  console.error("Error deleting workspace:", err);
                  callback(err, null);
                });
              }

              if (results.affectedRows === 0) {
                return connection.rollback(() => {
                  connection.release();
                  const notFoundError = new Error("Workspace not found");
                  console.error(notFoundError);
                  callback(notFoundError, null);
                });
              }

              // Commit the transaction
              connection.commit((err) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    console.error("Error committing transaction:", err);
                    callback(err, null);
                  });
                }

                connection.release();
                console.log(`Workspace ${workspaceId} deleted successfully`);
                callback(null, { id: workspaceId });
              });
            }
          );
        });
      });
    });
  }

  static leaveWorkspace(userId, workspaceId, callback) {
    // First, check if the user is part of this workspace
    const checkQuery =
      "SELECT joinWorkSpace, isManager FROM joinWorkSpace WHERE userId = ? AND WorkSpace = ?";

    pool.query(checkQuery, [userId, workspaceId], (err, results) => {
      if (err) {
        console.error("Error checking workspace membership:", err);
        return callback(err, null);
      }

      if (results.length === 0) {
        return callback(
          { message: "User is not a member of this workspace" },
          null
        );
      }

      const isManager = results[0].isManager;

      // If the user is a manager, check if they are the ONLY manager before allowing them to leave
      if (isManager) {
        const checkManagersQuery =
          "SELECT COUNT(*) as managerCount FROM joinWorkSpace WHERE WorkSpace = ? AND isManager = true";

        pool.query(checkManagersQuery, [workspaceId], (err, managerResults) => {
          if (err) {
            console.error("Error checking managers count:", err);
            return callback(err, null);
          }

          const totalManagers = managerResults[0]?.managerCount || 0;

          // If they're the only manager, don't allow them to leave
          if (totalManagers === 1) {
            return callback(
              {
                message:
                  "You are the only manager of this workspace. Please assign another manager or delete the workspace instead.",
              },
              null
            );
          } else {
            // If there are other managers, proceed with removing their association
            const deleteJoinQuery =
              "DELETE FROM joinWorkSpace WHERE userId = ? AND WorkSpace = ?";

            pool.query(
              deleteJoinQuery,
              [userId, workspaceId],
              (err, deleteResult) => {
                if (err) {
                  console.error("Error removing user from workspace:", err);
                  return callback(err, null);
                }

                return callback(null, {
                  success: true,
                  message: "Successfully left the workspace",
                });
              }
            );
          }
        });
      } else {
        // If they're not a manager, they can leave freely
        const deleteJoinQuery =
          "DELETE FROM joinWorkSpace WHERE userId = ? AND WorkSpace = ?";

        pool.query(
          deleteJoinQuery,
          [userId, workspaceId],
          (err, deleteResult) => {
            if (err) {
              console.error("Error removing user from workspace:", err);
              return callback(err, null);
            }

            return callback(null, {
              success: true,
              message: "Successfully left the workspace",
            });
          }
        );
      }
    });
  }
}

module.exports = WorkSpace;
