const express = require('express')
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require('express-validator');

//ROUTE 1: get all the notes
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        console.log(req.user);
        const notes = await Note.find({ user: req.user });
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


//ROUTE 2: add new note
router.post('/addnote',
    fetchuser,
    [
        //applying validators
        body('title', 'Enter Title').exists(),
        body('description', 'Enter Description').exists()

    ],
    async (req, res) => {

        try {
            const { title, description, tag } = req.body;

            // If there are errors, return Bad request and the errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const note = new Note({
                title, description, tag, user: req.user
            })
            const savedNote = await note.save();

            res.json(savedNote)

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }


    }
);

//ROUTE 3: update an existing note
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        // Create a newNote object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        // Find the note to be updated and update it
        let note = await Note.findById(req.params.id);

        console.log(note);
        if (!note) { return res.status(404).send("Not Found") }

        if (note.user.toString() !== req.user) {
            return res.status(401).send("Not Allowed");
        }
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


//ROUTE 4: delete an existing note
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {

        // Find the note to be updated and update it
        let note = await Note.findById(req.params.id);

        console.log(note);
        if (!note) { return res.status(404).send("Not Found") }

        if (note.user.toString() !== req.user) {
            return res.status(401).send("Not Allowed");
        }
        
        note = await Note.findByIdAndDelete(req.params.id);
        res.json({"Success": "Deleted",note: note})

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router