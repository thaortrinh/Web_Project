const pool = require("../db/connect");
const supabase = require("../db/superbaseClient");

// Utility functions
function mapState(state) {
  switch (state) {
    case 1:
      return "TODO";
    case 2:
      return "IN-PROGRESS";
    case 3:
      return "COMPLETED";
    default:
      return "UNKNOWN";
  }
}

function mapS(state) {
  switch (state) {
    case "TODO":
      return 1;
    case "IN-PROGRESS":
      return 2;
    case "COMPLETED":
      return 3;
    default:
      return 4;
  }
}

const mapPriority = {
  1: "High",
  2: "Medium",
  3: "Low",
};

function mapP(state) {
  switch (state) {
    case "High":
      return 1;
    case "Medium":
      return 2;
    case "Low":
      return 3;
    default:
      return 4;
  }
}

// Mapping for createTask
const priorityMapCreate = {
  High: 1,
  Medium: 2,
  Low: 3,
};

const statusMapCreate = {
  TODO: 1,
  "IN-PROGRESS": 2,
  COMPLETED: 3,
};

const formatDateForCreate = (dateStr) => {
  const result = dateStr;
  return result;
};

// Subtask management functions
function compareSubtasks(originalTask, updatedTask) {
  const originalMap = new Map(originalTask.subtasks.map((st) => [st.id, st]));
  const updatedMap = new Map(updatedTask.subtasks.map((st) => [st.id, st]));

  const added = [];
  const removed = [];
  const updated = [];

  for (const [id, updatedSubtask] of updatedMap.entries()) {
    if (!originalMap.has(id)) {
      added.push(updatedSubtask);
    } else {
      const originalSubtask = originalMap.get(id);
      if (
        originalSubtask.title !== updatedSubtask.title ||
        originalSubtask.completed !== updatedSubtask.completed
      ) {
        updated.push({ from: originalSubtask, to: updatedSubtask });
      }
    }
  }

  for (const id of originalMap.keys()) {
    if (!updatedMap.has(id)) {
      removed.push(originalMap.get(id));
    }
  }

  // Insert new subtasks
  if (added.length > 0) {
    const queryInsert =
      "INSERT INTO SubTask (subtaskName, TaskId, status) VALUES (?, ?, ?)";
    added.forEach((sub) => {
      pool.query(
        queryInsert,
        [sub.title, originalTask.id, sub.completed],
        (err, res) => {
          if (err) {
            console.error(err);
            return false;
          }
        }
      );
    });
  }

  // Delete removed subtasks
  if (removed.length > 0) {
    const queryDelete = "DELETE FROM SubTask WHERE SubTakId = ?";
    removed.forEach((sub) => {
      pool.query(queryDelete, [sub.id], (err, res) => {
        if (err) {
          console.error(err);
          return false;
        }
      });
    });
  }

  // Update existing subtasks
  if (updated.length > 0) {
    const updateQuery = `UPDATE SubTask
    SET 
        subtaskName = ?,
        status = ?
    WHERE SubTakId = ?;`;
    updated.forEach((sub) => {
      pool.query(
        updateQuery,
        [sub.to.title, sub.to.completed, sub.to.id],
        (err, res) => {
          if (err) {
            console.error(err);
            return false;
          }
        }
      );
    });
  }
  return true;
}

// User assignment management
function updateUser(newTask, originalTask) {
  const assignedToIds = new Set(newTask.assignedTo.map((user) => user.id));
  const originalAssignedToIds = new Set(
    originalTask.assignedTo.map((user) => user.id)
  );
  const addedIds = [...assignedToIds].filter(
    (id) => !originalAssignedToIds.has(id)
  );
  const removeIds = [...originalAssignedToIds].filter(
    (id) => !assignedToIds.has(id)
  );
  const addedUsers = newTask.availableMembers.filter((user) =>
    addedIds.includes(user.id)
  );
  const removedUsers = originalTask.assignedTo.filter((user) =>
    removeIds.includes(user.id)
  );

  if (addedUsers.length > 0) {
    const queryAdd =
      "INSERT INTO AssignTask (joinWorkSpace, TaskId) VALUES (?, ?)";
    addedUsers.forEach((user) => {
      pool.query(queryAdd, [user.joinId, newTask.id], (err, res) => {
        if (err) {
          console.error(err);
          return false;
        }
      });
    });
  }

  if (removedUsers.length > 0) {
    const queryRemove = "DELETE FROM AssignTask WHERE AssignId = ?";
    removedUsers.forEach((user) => {
      pool.query(queryRemove, [user.aId], (err, res) => {
        if (err) {
          console.error(err);
          return false;
        }
      });
    });
  }
  return true;
}

// Update task basic info
function updateTaskInfo(newTask, originalTask) {
  const query = `UPDATE Task
  SET 
      taskname = ?,
      priority = ?,
      dateEnd = ?,
      StateCompletion = ?,
      description = ?
  WHERE TaskId = ?;`;

  pool.query(
    query,
    [
      newTask.title,
      mapP(newTask.priority),
      newTask.dueDate,
      mapS(newTask.status),
      newTask.description,
      newTask.id,
    ],
    (e, r) => {
      if (e) {
        console.log(e);
        return false;
      }
    }
  );
  return true;
}

class Task {
  static addFileToSupa = async (taskId, file, callback) => {
    try {
      // Tạo tên file unique
      const timestamp = Date.now();
      const fileExtension = file.originalname.split(".").pop();
      const fileName = `task_${taskId}_${timestamp}.${fileExtension}`;

      console.log("Uploading file:", fileName);

      const { data, error } = await supabase.storage
        .from("taskfile") // Bucket name cho task files
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        console.error("Upload error:", error);
        return callback({ success: false, error });
      } else {
        // Update task với filePath
        const query = "UPDATE Task SET filePath = ? WHERE TaskId = ?";
        pool.query(query, [fileName, taskId], (err, result) => {
          if (err) {
            console.error("Error updating task with file path:", err);
            return callback(err, null);
          }
          return callback(null, { success: true, fileName: fileName });
        });
      }
    } catch (error) {
      console.error("Error in addFileToSupa:", error);
      return callback(error, null);
    }
  };

  static createTask(TaskData, callback) {
    const query =
      "INSERT INTO Task (taskname, WorkSpace, priority, dateBegin, dateEnd, trash, StateCompletion, description) values (?, ?,?, ?,?, ?, ?, ?)";
    const query2 =
      "INSERT INTO AssignTask (joinWorkSpace, TaskId) values (?, ?)";

    const priority = priorityMapCreate[TaskData.priority];
    const dateEnd = formatDateForCreate(TaskData.dateEnd);
    const status = statusMapCreate[TaskData.StateCompletion];

    pool.query(
      query,
      [
        TaskData.taskname,
        TaskData.workspaceId,
        priority,
        TaskData.dateBegin,
        dateEnd,
        false,
        status,
        TaskData.description,
      ],
      (err, result) => {
        if (err) {
          console.error("Error creating Task:", err);
          return callback(err, null);
        }

        const taskId = result.insertId;

        // Upload file sau khi tạo task thành công
        const handleFileUpload = () => {
          if (TaskData.file) {
            Task.addFileToSupa(taskId, TaskData.file, (fileErr, fileResult) => {
              if (fileErr) {
                console.error("Error uploading file:", fileErr);
                // File upload fail nhưng task đã tạo thành công
                // Có thể log error nhưng vẫn return success
              } else {
                console.log("File uploaded successfully:", fileResult);
              }
            });
          }
        };

        if (!TaskData.assignedTo || TaskData.assignedTo.length === 0) {
          handleFileUpload();
          return callback(null, { id: taskId });
        }

        // Assign members
        let assignedCount = 0;
        let hasError = false;

        TaskData.assignedTo.forEach((member, index) => {
          console.log(`Assigning member ${index}:`, member);

          pool.query(query2, [member.joinWorkSpace, taskId], (er, res) => {
            if (er && !hasError) {
              hasError = true;
              console.error("Error add member to task:", er);
              return callback(er, null);
            }

            assignedCount++;

            // Nếu đã assign hết members và không có lỗi
            if (assignedCount === TaskData.assignedTo.length && !hasError) {
              handleFileUpload();
              return callback(null, { id: taskId });
            }
          });
        });
      }
    );
  }

  // Existing trash functions...
  static moveToTrash(taskId, callback) {
    const query = "UPDATE Task SET trash = TRUE WHERE TaskId = ?";
    pool.query(query, [taskId], (err, result) => {
      if (err) {
        console.error("Error moving task to trash:", err);
        return callback(err, null);
      }
      if (result.affectedRows === 0) {
        return callback(new Error("Task not found"), null);
      }
      return callback(null, { success: true });
    });
  }

  static getTrashTasks(workspaceId, callback) {
    const query = "SELECT * FROM Task WHERE trash = TRUE AND WorkSpace = ?";
    pool.query(query, [workspaceId], (err, results) => {
      if (err) {
        console.error("Error retrieving trash tasks:", err);
        return callback(err, null);
      }
      const trashTasks = results.map((row) => ({
        TaskId: row.TaskId,
        taskname: row.taskname,
        priority: row.priority,
        StateCompletion: row.StateCompletion,
      }));
      return callback(null, trashTasks);
    });
  }

  static restoreFromTrash(taskId, callback) {
    const query = "UPDATE Task SET trash = FALSE WHERE TaskId = ?";
    pool.query(query, [taskId], (err, result) => {
      if (err) {
        console.error("Error restoring task from trash:", err);
        return callback(err, null);
      }
      if (result.affectedRows === 0) {
        return callback(new Error("Task not found"), null);
      }
      return callback(null, { success: true });
    });
  }

  static permanentlyDelete(taskId, callback) {
    const deleteSubtasksQuery = "DELETE FROM SubTask WHERE TaskId = ?";
    pool.query(deleteSubtasksQuery, [taskId], (subtaskErr) => {
      if (subtaskErr) {
        console.error("Error deleting subtasks:", subtaskErr);
        return callback(subtaskErr, null);
      }

      const deleteAssignmentsQuery = "DELETE FROM AssignTask WHERE TaskId = ?";
      pool.query(deleteAssignmentsQuery, [taskId], (assignErr) => {
        if (assignErr) {
          console.error("Error deleting task assignments:", assignErr);
          return callback(assignErr, null);
        }

        const deleteTaskQuery = "DELETE FROM Task WHERE TaskId = ?";
        pool.query(deleteTaskQuery, [taskId], (taskErr, result) => {
          if (taskErr) {
            console.error("Error permanently deleting task:", taskErr);
            return callback(taskErr, null);
          }
          if (result.affectedRows === 0) {
            return callback(new Error("Task not found"), null);
          }
          return callback(null, { success: true });
        });
      });
    });
  }

  // Task detail and update functions
  static updateTask(newTask, originalTask, callback) {
    try {
      const a = updateUser(newTask, originalTask);
      const b = compareSubtasks(originalTask, newTask);
      const c = updateTaskInfo(newTask, originalTask);

      if (a && b && c) {
        callback(null, { success: true });
      } else {
        callback(null, { success: false });
      }
    } catch (error) {
      callback(error, null);
    }
  }

  static getTaskDetail = async (taskId, workspaceId) => {
    const query = `
    SELECT 
      t.TaskId,
      t.taskname,
      t.description,
      t.StateCompletion,
      t.priority,
      t.filePath,
      DATE_FORMAT(t.dateEnd, '%Y-%m-%d') as dateEnd,
      t.WorkSpace,
      u.userId AS assignedUserId,
      u.name AS assignedUserName,
      u.email AS assignedUserEmail,
      u.photoPath as photo,
      at.AssignId as aId,
      jw.joinWorkSpace as joiny
    FROM Task t
    LEFT JOIN AssignTask at ON t.TaskId = at.TaskId
    LEFT JOIN joinWorkSpace jw ON at.joinWorkSpace = jw.joinWorkSpace
    LEFT JOIN User u ON jw.userId = u.userId
    WHERE t.TaskId = ?;
  `;

    const queryGetSubtask = `Select * from SubTask where TaskId = ?`;

    const queryAvaMem = `
    SELECT * FROM joinWorkSpace 
    LEFT JOIN User ON joinWorkSpace.userId = User.userId 
    WHERE joinWorkSpace.WorkSpace = ?;
  `;

    const bgColorOptions = [
      "bg-blue-700",
      "bg-orange-500",
      "bg-purple-600",
      "bg-green-600",
      "bg-red-600",
    ];

    return new Promise(async (resolve, reject) => {
      try {
        // Get available members
        const members = await new Promise((resolve, reject) => {
          pool.query(queryAvaMem, [workspaceId], (err, results) => {
            if (err) return reject(err);

            const mappedMembers = results.map((row) => {
              let link = null;
              if (row.photoPath != null) {
                link = `https://kdjkcdkapjgimrnugono.supabase.co/storage/v1/object/public/images/${row.photoPath}`;
              }

              return {
                id: row.userId,
                joinId: row.joinWorkSpace,
                name: row.name,
                email: row.email,
                photoPath: link,
                initials: row.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase(),
                bgColor: bgColorOptions[row.userId % bgColorOptions.length],
              };
            });

            resolve(mappedMembers);
          });
        });

        // Get subtasks
        const subtasks = await new Promise((resolve, reject) => {
          pool.query(queryGetSubtask, [taskId], (err, results) => {
            if (err) return reject(err);

            const mappedSubtask = results.map((row) => ({
              id: row.SubTakId,
              title: row.subtaskName,
              completed: row.status,
            }));

            resolve(mappedSubtask);
          });
        });

        // Get task details
        pool.query(query, [taskId], async (err, rows) => {
          if (err) return reject(err);
          if (rows.length === 0) return resolve(null);

          const row0 = rows[0];
          const task = {
            id: row0.TaskId,
            title: row0.taskname,
            description: row0.description,
            status: mapState(row0.StateCompletion),
            priority: mapPriority[row0.priority],
            dueDate: row0.dateEnd,
            assignedTo: [],
            assets: [],
            subtasks: subtasks,
            availableMembers: members,
          };

          // Handle file if present
          if (row0.filePath) {
            const fileName = row0.filePath;
            const fileExt = fileName.split(".").pop().toLowerCase();
            task.assets = [
              {
                // Gán trực tiếp thay vì push
                id: row0.TaskId, // Dùng TaskId thay vì hard-code 1
                name: fileName,
                type: fileExt,
                filePath: `https://kdjkcdkapjgimrnugono.supabase.co/storage/v1/object/public/taskfile/${fileName}`,
              },
            ];
          } else {
            task.assets = []; // Đảm bảo luôn có array
          }

          // Populate assigned users
          const seenUsers = new Set();
          rows.forEach((row) => {
            if (!row.assignedUserId || seenUsers.has(row.assignedUserId))
              return;

            const initials = row.assignedUserName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            let link = null;
            if (row.photo != null) {
              link = `https://kdjkcdkapjgimrnugono.supabase.co/storage/v1/object/public/images/${row.photo}`;
            }

            task.assignedTo.push({
              id: row.assignedUserId,
              name: row.assignedUserName,
              email: row.assignedUserEmail,
              photoPath: link,
              aId: row.aId,
              initials,
              joinId: row.joiny,
              bgColor:
                bgColorOptions[row.assignedUserId % bgColorOptions.length],
            });

            seenUsers.add(row.assignedUserId);
          });

          resolve(task);
        });
      } catch (err) {
        reject(err);
      }
    });
  };
}

module.exports = Task;
