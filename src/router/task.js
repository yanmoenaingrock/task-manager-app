const express = require("express");
const router = new express.Router();
const Task = require("../models/Task");
const Auth = require("../middleware/auth");

router.post('/tasks', Auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/tasks', Auth, async (req, res) => {

    const match = {};
    const sort = {};

    if( req.query.completed ) {
        match.completed = req.query.completed === 'true';
    }

    if( req.query.sortBy ) {
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }

    try {
        // const tasks = await Task.find({
        //     owner: req.user._id
        // })
        await req.user.populate({
            path: "tasks",
            match,
            options: {
                limit: parseInt( req.query.limit ),
                skip: parseInt( req.query.skip ),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', Auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({
            _id: _id,
            owner: req.user._id
        });

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }

})

router.patch("/tasks/:id",Auth, async (req,res) => {
    const updates = Object.keys( req.body );
    const allowedUpdates = ["description","completed"];
    const isValidUpdates = updates.every( update => allowedUpdates.includes( update ) );

    if( !isValidUpdates ) {
        return res.status(400).send({ error: "Invalid Updates"} );
    }

    try {
        const updatedTask = await Task.findOne( {
            _id: req.params.id,
            owner: req.user._id
        } );
        if( !updatedTask ) {
            return res.status(404).send({err:"Task not found"})
        }
        updates.forEach( update => updatedTask[update] = req.body[update]);
        await updatedTask.save();
        res.send(updatedTask);
    } catch (error) {
         res.status(400).send( error );
    }
})

router.delete("/tasks/:id", Auth, async ( req, res ) => {
    try {
        const task = await Task.findByIdAndDelete( {
            _id: req.params.id,
            owner: req.user._id
        } );
        if(!task) {
            return res.status(404).send({ error: "Not found"})
        }
        res.send(task);
    } catch (error) {
        res.status(500).send( error );
    }
})

module.exports = router;