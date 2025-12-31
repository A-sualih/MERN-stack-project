const Task = require("../model/Task");
const asyncWrapper=require("../middleware/asyn")
const getAllTasks = asyncWrapper(async (req, res) => {
    const tasks = await Task.find({});
    res.status(200).json({status:"success",data:{tasks,nbHits:tasks.length}});
});
const createTask =asyncWrapper(async (req, res) => {
    const task = await Task.create(req.body);
    res.status(201).json({ task });
});
const getTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findOne({ _id: taskId });
    if (!task) {
      return res.status(404).json({ message: `Not task with Id:${taskId}` });
    }
    res.status(200).json({ task });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
const updateTask = async (req, res) => {
  try {
    const { id: taskId } = req.params;
    const task = await Task.findOneAndUpdate({ _id: taskId }, req.body,{
        new:true,
        runValidators:true,
    });
    if (!task) {
      return res.status(404).json({ message: `Not task with Id:${taskId}` });
    }
    res.status(200).json({ task });
  } catch (error) {
    res.status(500).json({ message: error });
  }
  res.send("update Task");
};
const editTask = async (req, res) => {
  try {
    const { id: taskId } = req.params;
    const task = await Task.findOneAndUpdate({ _id: taskId }, req.body,{
        new:true,
        runValidators:true,
    });
    if (!task) {
      return res.status(404).json({ message: `Not task with Id:${taskId}` });
    }
    res.status(200).json({ task });
  } catch (error) {
    res.status(500).json({ message: error });
  }
  res.send("update Task");
};
const deleteTask = async (req, res) => {
  try {
    const { id: taskId } = req.params;
    const task = await Task.findOneAndDelete({ _id: taskId });
    if (!task) {
      return res.status(404).json({ message: `Not task with Id:${taskId}` });
    }
    res.status(200).json({ task });
    res.send("delete Task");
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
module.exports = {
  getAllTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  editTask
};
