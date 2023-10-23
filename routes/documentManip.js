const express = require('express');
const manipRouter = express.Router();
const pdfParse = require('pdf-parse')
const multer = require('multer')
const mongoose = require('mongoose');
const Musik = require('../models/Musik.js')

manipRouter.post('/extract_and_update/:musikId', (req, res, next) => {
    Musik.findOneAndUpdate(
        { _id: req.params.musikId },
        req.body,
        { new: true })
        .then(updatedMusik => res.status(201).send(updatedMusik))
        .catch(err => {
            res.status(500)
            return next(new Error("Failed to update musik."))
        })
})

module.exports = manipRouter;