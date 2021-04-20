const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const fileUpload = require("express-fileupload");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lkoox.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("services"));
app.use(fileUpload());

const port = 5000;


const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const ordersCollection = client
    .db("electricService")
    .collection("takeOrders");
  const showCollection = client.db("electricService").collection("showOrders");

  app.post("/takeOrders", (req, res) => {
    const takeOrders = req.body;
    console.log(takeOrders);
    ordersCollection.insertOne(takeOrders).then((result) => {
      res.send(result.insertedOne > 0);
    });
  });

  app.get("/orders", (req, res) => {
    ordersCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/ordersByDate", (req, res) => {
    const date = req.body;
    const email = req.body.email;

    showCollection.find({ email: email }).toArray((err, services) => {
      const filter = { date: date.date };
      if (services.length === 0) {
        filter.email = email;
      }
      ordersCollection.find(filter).toArray((err, documents) => {
        console.log(email, date.date, doctors, documents);
        res.send(documents);
      });
    });
  });

  app.post("/addAService", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    showCollection.insertOne({ name, image }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
});

app.get("/", (req, res) => {
  res.send("hello from db it's working working");
});

app.listen(process.env.PORT || port);
