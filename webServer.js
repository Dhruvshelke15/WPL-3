/**
 * Project 3 Express server connected to MongoDB 'project3'.
 * Start with: node webServer.js
 * Client uses axios to call these endpoints.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import mongoose from "mongoose";
// eslint-disable-next-line import/no-extraneous-dependencies
import bluebird from "bluebird";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
// proj3 imports
import session from "express-session";
import multer from "multer";

// Load the Mongoose schema for User, Photo, and SchemaInfo
import User from "./schema/user.js";
import Photo from "./schema/photo.js";
import SchemaInfo from "./schema/schemaInfo.js";

const portno = 3001; // Port number to use
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  // allow credentials (cookies)
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Add body-parser middleware to parse JSON request bodies
app.use(express.json());

// Setup session middleware
app.use(session({
  secret: 'your_secret_key_here', // Replace with a real secret in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to check if user is logged in
const checkLoggedIn = (request, response, next) => {
  if (!request.session.user) {
    return response.status(401).send("Unauthorized: Not logged in");
  }
  next();
};

// Configure Multer for file uploads
// The test file sends a unique filename, so we'll use diskStorage to respect that.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/');
  },
  filename: (req, file, cb) => {
    // The test relies on sending a unique filename in `file.originalname`
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });


mongoose.Promise = bluebird;
mongoose.set("strictQuery", false);
// Connect to the 'project' database as required by the prompt
mongoose.connect("mongodb://127.0.0.1/project3", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

//api endpoints for project 3

/**
 * URL /admin/login - Login user
 * Checks login_name and password.
 * Sets session.
 */
app.post("/admin/login", async (request, response) => {
  const { login_name, password } = request.body;

  try {
    const user = await User.findOne({ login_name: login_name, password: password });
    if (!user) {
      // The test file for invalid login name or password expects 400
      return response.status(400).send("Invalid login name or password");
    }

    // Set session data
    request.session.user = {
      _id: user._id,
      first_name: user.first_name,
      login_name: user.login_name
    };

    // The test file (sessionInputApiTest.js) expects the response to contain _id
    return response.status(200).send({ _id: user._id, first_name: user.first_name });
  } catch (err) {
    return response.status(500).send(err.message);
  }
});

/**
 * URL /admin/logout - Logout user
 * Clears session.
 */
app.post("/admin/logout", (request, response) => {
  if (!request.session.user) {
    // Test expects 400 if not logged in
    return response.status(400).send("Not logged in");
  }

  request.session.destroy((err) => {
    if (err) {
      return response.status(500).send("Logout failed");
    }
    return response.status(200).send("Logged out");
  });
});

/**
 * URL /user - Register a new user
 * Creates a new user document.
 */
app.post("/user", async (request, response) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = request.body;

  // Validate required fields as per prompt
  if (!login_name || login_name.trim() === "") {
    return response.status(400).send("Login name is required.");
  }
  if (!password || password.trim() === "") {
    return response.status(400).send("Password is required.");
  }
  if (!first_name || first_name.trim() === "") {
    return response.status(400).send("First name is required.");
  }
  if (!last_name || last_name.trim() === "") {
    return response.status(400).send("Last name is required.");
  }

  try {
    // Check if login_name already exists
    const existingUser = await User.findOne({ login_name: login_name });
    if (existingUser) {
      return response.status(400).send("Login name already exists.");
    }

    // Create new user
    const newUser = await User.create({
      login_name,
      password, // storing plain text 
      first_name,
      last_name,
      location: location || "",
      description: description || "",
      occupation: occupation || ""
    });

    // Test (sessionInputApiTest.js) expects login_name in the response body
    return response.status(200).send({ login_name: newUser.login_name, _id: newUser._id });
  } catch (err) {
    return response.status(500).send(err.message);
  }
});

/**
 * URL /commentsOfPhoto/:photo_id - Add a new comment
 * Requires user to be logged in.
 */
app.post("/commentsOfPhoto/:photo_id", checkLoggedIn, async (request, response) => {
  const { photo_id } = request.params;
  const { comment } = request.body;
  const user_id = request.session.user._id;

  if (!comment || comment.trim() === "") {
    return response.status(400).send("Comment cannot be empty");
  }

  try {
    const photo = await Photo.findById(photo_id);
    if (!photo) {
      return response.status(400).send("Photo not found");
    }

    const newComment = {
      comment: comment,
      date_time: new Date(),
      user_id: user_id
    };

    photo.comments.push(newComment);
    await photo.save();
    
    // Test just expects 200 OK. Frontend will invalidate query.
    return response.status(200).send(photo); // Sending back updated photo
  } catch (err) {
    return response.status(500).send(err.message);
  }
});

/**
 * URL /photos/new - Upload a new photo
 * Requires user to be logged in. Uses multer.
 */
app.post("/photos/new", checkLoggedIn, upload.single('uploadedphoto'), async (request, response) => {
  if (!request.file) {
    return response.status(400).send("No file uploaded.");
  }
  
  // 'uploadedphoto' is the 'name' attribute from the form
  // The test (sessionInputApiTest.js) expects this.

  try {
    await Photo.create({
      file_name: request.file.filename, // Filename as saved by multer
      date_time: new Date(),
      user_id: request.session.user._id,
      comments: []
    });
    
    // Test expects 200 OK
    return response.status(200).send("Photo uploaded successfully");
  } catch (err) {
    return response.status(500).send(err.message);
  }
});


// existing endpoints with login/signups
/**
 * /test/info - Returns the SchemaInfo object
 * (This endpoint is used by the old test, let's keep it unprotected)
 */
app.get("/test/info", async (request, response) => {
  try {
    const info = await SchemaInfo.findOne({});
    if (!info) {
      return response.status(404).send("SchemaInfo not found");
    }
    return response.status(200).send(info);
  } catch (err) {
    return response.status(500).send(err.message);
  }
});

/**
 * /test/counts - Returns counts
 * (Let's also keep this unprotected for simplicity)
 */
app.get("/test/counts", async (request, response) => {
  try {
    const userCount = await User.countDocuments({});
    const photoCount = await Photo.countDocuments({});
    const schemaInfoCount = await SchemaInfo.countDocuments({});

    response.status(200).send({
      user: userCount,
      photo: photoCount,
      schemaInfo: schemaInfoCount,
    });
  } catch (err) {
    response.status(500).send(err.message);
  }
});

/**
 * URL /user/list - Returns all the User objects.
 * REQUIRES LOGIN.
 */
app.get("/user/list", checkLoggedIn, async (request, response) => {
  try {
    if (request.query.advanced === 'true') {
      const users = await User.find({}).select("_id first_name last_name").lean();
      const photoCounts = await Photo.aggregate([
        { $group: { _id: "$user_id", count: { $sum: 1 } } },
      ]);
      const photoCountMap = photoCounts.reduce((acc, item) => {
        acc[item._id.toString()] = item.count;
        return acc;
      }, {});
      const commentCounts = await Photo.aggregate([
        { $unwind: "$comments" },
        { $group: { _id: "$comments.user_id", count: { $sum: 1 } } },
      ]);
      const commentCountMap = commentCounts.reduce((acc, item) => {
        acc[item._id.toString()] = item.count;
        return acc;
      }, {});
      const userListWithCounts = users.map((user) => ({
        ...user,
        photoCount: photoCountMap[user._id.toString()] || 0,
        commentCount: commentCountMap[user._id.toString()] || 0,
      }));
      response.status(200).send(userListWithCounts);
    } else {
      const users = await User.find({}).select("_id first_name last_name").lean();
      response.status(200).send(users);
    }
  } catch (err) {
    response.status(500).send(err.message);
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 * REQUIRES LOGIN.
 */
app.get("/user/:id", checkLoggedIn, async (request, response) => {
  const { id } = request.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send("Invalid user ID format");
  }
  try {
    const user = await User.findById(id)
      .select("_id first_name last_name location description occupation")
      .lean();
    if (!user) {
      return response.status(400).send("User not found");
    }
    return response.status(200).send(user);
  } catch (err) {
    return response.status(500).send(err.message);
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 * REQUIRES LOGIN.
 */
app.get("/photosOfUser/:id", checkLoggedIn, async (request, response) => {
  const { id } = request.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send("Invalid user ID format");
  }
  try {
    const userExists = await User.findById(id);
    if (!userExists) {
      return response.status(400).send("User not found");
    }
    const photos = await Photo.find({ user_id: id }).select("-__v").lean();
    if (!photos || photos.length === 0) {
      return response.status(200).send([]);
    }
    const userIds = new Set();
    photos.forEach((photo) => {
      if (photo.comments) { 
        photo.comments.forEach((comment) => {
          if (comment.user_id) { 
            userIds.add(comment.user_id.toString());
          }
        });
      }
    });
    const users = await User.find({ _id: { $in: [...userIds] } })
      .select("_id first_name last_name")
      .lean();
    const userMap = users.reduce((acc, u) => {
      acc[u._id.toString()] = u;
      return acc;
    }, {});
    photos.forEach((photo) => {
      if (photo.comments) {
        photo.comments.forEach((comment) => {
          if (comment.user_id) {
            comment.user = userMap[comment.user_id.toString()];
            delete comment.user_id; 
          }
        });
        photo.comments.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
      } else {
        photo.comments = [];
      }
    });
    photos.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
    return response.status(200).send(photos);
  } catch (err) {
    console.error("Error in /photosOfUser/:id :", err); 
    return response.status(500).send(err.message);
  }
});

/**
 * URL /commentsOfUser/:id - Returns all comments made by User (id).
 * REQUIRES LOGIN.
 */
app.get("/commentsOfUser/:id", checkLoggedIn, async (request, response) => {
  const { id } = request.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send("Invalid user ID");
  }
  try {
    const userExists = await User.findById(id);
    if (!userExists) {
      return response.status(400).send("User not found");
    }
    const photosWithUserComments = await Photo.find(
      { "comments.user_id": id },
      "file_name comments user_id"
    ).lean();
    const userComments = [];
    photosWithUserComments.forEach((photo) => {
      photo.comments.forEach((comment) => {
        if (comment.user_id.toString() === id) {
          userComments.push({
            comment_text: comment.comment,
            date_time: comment.date_time,
            _id: comment._id,
            photo_owner_id: photo.user_id,
            photo_id: photo._id,
            photo_file_name: photo.file_name,
          });
        }
      });
    });
    userComments.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
    return response.status(200).json(userComments);
  } catch (err) {
    return response.status(500).send(err.message);
  }
});

const server = app.listen(portno, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});