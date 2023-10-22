const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto')
const multer = require('multer')
const {GridFsStorage} = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
const Discovery = require('./models/Discovery.js')
const { MongoClient, ObjectId } = require('mongodb')
const app = express();
const morgan = require('morgan');
require('dotenv').config();
const path = require('path')

const { expressjwt: jwt } = require('express-jwt');

// Middleware

app.use(morgan('dev'))
app.use(express.json())

const promise = mongoose.connect("mongodb://localhost:27017/discofiles").then(() => console.log('connected'))

// const conn = mongoose.connection;
const conn = mongoose.createConnection(process.env.MONGO_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
})

let gfs, gridfsBucket;

conn.on('error', (err) => {
    console.error('MongoDB connection error:', err)
})

conn.once('open', async () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'd'
    })
    // gfs = Grid(conn.db, mongoose.mongo);
    // gfs.collection('discofiles');
    console.log('MongoDB connection open');
    })

const storage = new GridFsStorage({ 
    url: "mongodb://localhost:27018/music",
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename,
                    bucketName: 'd'
                };
                resolve(fileInfo)
            });
        })
    }
});

const upload = multer({ storage })

app.use('/api/auth', require('./routes/authRouter.js'))

app.use('/api/protected', jwt({
    secret: process.env.ACCESS_KEY,
    algorithms: ['HS256']
}))

app.use('/api/protected/document_manip', require('./routes/documentManip.js'))

app.post('/api/protected/insert_file', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ errMsg: 'No file uploaded' });
    }
    console.log(req.file)
    const newDiscovery = new Discovery({
        originalName: req.file.originalname,
        gridId: req.file.id,
        gridFileName: req.file.filename,
        size: req.file.size
    })
    newDiscovery.save()
        .then(savedDiscovery => {
            return res.status(201).send({
                file: req.file,
                savedDiscovery
            })
        })
        .catch(err => {
            res.status(500)
            return next(err)
        })
})

app.get('/api/protected/file/:fileId', async (req, res, next) => {
    try {
        const file = await gridfsBucket.find({ _id: req.params.fileId }).toArray();
        if (file) {
            const readstream = gridfsBucket.openDownloadStream(new ObjectId(req.params.fileId))
            let bufferArray = [];
            readstream.on("data", function (chunk) {
                bufferArray.push(chunk)
            });
            readstream.on("error", () => {
                res.status(404)
                return next(new Error("There is no file with that ID."));
            })
            readstream.on("end", function () {
                const buffer = Buffer.concat(bufferArray)
                res.status(200).send({data: buffer})
                return;
            });
        } else {
            res.status(404)
            next(new Error("There is no file with that ID."))
            return;
        }
    } catch (err) {
        console.error(err);
        res.status(500)
        return next(new Error("Error retrieving file"))
    }
})

app.use((err, req, res, next) => {
    if (err.name === "UnauthorizedError") {
        res.status(err.status)
    }
    return res.send({errMsg: err.message})
})

app.listen(8000, () => console.log('Server is running on port 8000'))