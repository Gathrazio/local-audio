const express = require('express');
const manipRouter = express.Router();
const pdfParse = require('pdf-parse')
const multer = require('multer')
const mongoose = require('mongoose');
const Discovery = require('../models/Discovery.js')

var storage = multer.memoryStorage();
var upload = multer({ storage });

manipRouter.post('/extract_and_update/:discoveryId', upload.single('file'), (req, res, next) => {
        pdfParse(req.file.buffer)
            .then(parseResult => {
                const regex = (/MB\d\d\d\d|PLA\d\d\d\d\d\d/g);
                let result, indices = [], prefix;
                while (result = regex.exec(parseResult.text)) {
                    indices.push(result.index);
                }
                if (parseResult.text[indices[0]] === "M") {
                    prefix = "MB";
                } else if (parseResult.text[indices[0]] === "P") {
                    prefix = "PLA";
                }
                const batesNumbers = indices.map(index => parseResult.text[index] === "M" ? parseResult.text.slice(index + 2, index + 6) : parseResult.text.slice(index + 3, index + 9))
                Discovery.findOneAndUpdate(
                    { _id: req.params.discoveryId },
                    { text: parseResult.text, batesIndices: indices, batesPrefix: prefix, batesNumbers },
                    { new: true })
                    .then(updatedDiscovery => {
                        if (updatedDiscovery.text.length <= 2000) {
                            const morphedDiscovery = {...updatedDiscovery._doc, textPiece: updatedDiscovery._doc.text};
                            delete morphedDiscovery.text
                            res.status(201).send(morphedDiscovery)
                        } else {
                            const textPiece = updatedDiscovery.text.slice(0, 2001);
                            const handlableDiscovery = {...updatedDiscovery._doc, textPiece};
                            delete handlableDiscovery.text
                            res.status(201).send(handlableDiscovery)
                        }
                    })
                    .catch(err => {
                        res.status(500)
                        return next(new Error("Failed to update discovery."))
                    })
            })
    })

manipRouter.put('/update_discovery/:discoveryId', (req, res, next) => {
    Discovery.findOneAndUpdate(
            { _id: req.params.discoveryId },
            req.body,
            { new: true })
            .then(updatedDiscovery => {
                if (updatedDiscovery.text.length <= 100) {
                    const morphedDiscovery = {...updatedDiscovery._doc, textPiece: updatedDiscovery._doc.text};
                    delete morphedDiscovery.text
                    res.status(201).send(morphedDiscovery)
                } else {
                    const textPiece = updatedDiscovery.text.slice(0, 101);
                    const handlableDiscovery = {...updatedDiscovery._doc, textPiece};
                    delete handlableDiscovery.text
                    console.log("here again ")
                    console.log(handlableDiscovery)
                    res.status(201).send(handlableDiscovery)
                }
            })
            .catch(err => {
                res.status(500)
                return next(new Error("Failed to update discovery."))
            })
})

module.exports = manipRouter;