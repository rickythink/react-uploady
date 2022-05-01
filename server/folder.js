const express = require("express"),
    multer  = require("multer"),
    cors = require("cors");

const port = process.env.PORT;

const upload = multer({ dest: "uploads/", preservePath: true }),
    app = express();

app.use(cors());

const folderUpload = upload.array("file");

app.post("/folder", folderUpload, (req, res) => {

    console.log("FOLDER UPLOAD !!!! files: " + req.files.length, req.files);


    res.status(200).json({ success: true });
});


app.listen(port, function () {
    console.log("Folder Upload server started on PORT: ", port); // eslint-disable-line
});
