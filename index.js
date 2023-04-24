import express from "express";
import cors from "cors"
import router from "./routes/chat.routes.js";
import dotenv from 'dotenv';
dotenv.config();

const app = express()

const allowedOrigins = [];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}

app.use(cors());  // use corsOptions to limit the origin

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "API for Chatbot Data Added" });
});


app.use((req, res, next) => {
  const apiKey = req.header('api-key')
  if (!apiKey || apiKey !== process.env.API_KEY) {
    res.status(401).json({ error: 'unauthorised' })
  } else {
    next()
  }
})

app.use('/api/', router);

app.use((req, res) => {
  res.status(404).send(`
    <html>
      <head>
        <title>404 Not Found</title>
      </head>
      <body>
        <h1>404 Not Found</h1>
        <p>The requested URL ${req.originalUrl} was not found on this server.</p>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
