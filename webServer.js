/**
 * Project 2 Express server connected to MongoDB 'project2'.
 * Start with: node webServer.js
 * Client uses axios to call these endpoints.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import mongoose from "mongoose";
// eslint-disable-next-line import/no-extraneous-dependencies
import bluebird from "bluebird";
import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Load the Mongoose schema for User, Photo, and SchemaInfo
import User from "./schema/user.js";
import Photo from "./schema/photo.js";
import SchemaInfo from "./schema/schemaInfo.js";

const portno = 3001; // Port number to use
const app = express();

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

mongoose.Promise = bluebird;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project2", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * /test/info - Returns the SchemaInfo object of the database in JSON format.
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
 * /test/counts - Returns an object with the counts of the different collections
 * in JSON format.
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
 * *** THIS IS THE FINAL FIX ***
 * It checks for a query param ?advanced=true
 * If true, it sends counts (for Part 3).
 * If false, it sends simple data (for the Part 1 test).
 */
app.get("/user/list", async (request, response) => {
  try {
    // Check if the client wants the advanced features (Part 3)
    if (request.query.advanced === 'true') {
      // 1. Get all users
      const users = await User.find({}).select("_id first_name last_name").lean();

      // 2. Get photo counts
      const photoCounts = await Photo.aggregate([
        { $group: { _id: "$user_id", count: { $sum: 1 } } },
      ]);
      const photoCountMap = photoCounts.reduce((acc, item) => {
        acc[item._id.toString()] = item.count;
        return acc;
      }, {});

      // 3. Get comment counts
      const commentCounts = await Photo.aggregate([
        { $unwind: "$comments" },
        { $group: { _id: "$comments.user_id", count: { $sum: 1 } } },
      ]);
      const commentCountMap = commentCounts.reduce((acc, item) => {
        acc[item._id.toString()] = item.count;
        return acc;
      }, {});

      // 4. Combine data
      const userListWithCounts = users.map((user) => ({
        ...user,
        photoCount: photoCountMap[user._id.toString()] || 0,
        commentCount: commentCountMap[user._id.toString()] || 0,
      }));

      response.status(200).send(userListWithCounts);

    } else {
      // This is the Part 1 version for the test
      const users = await User.find({}).select("_id first_name last_name").lean();
      response.status(200).send(users);
    }
  } catch (err) {
    response.status(500).send(err.message);
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", async (request, response) => {
  const { id } = request.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send("Invalid user ID format");
  }

  try {
    const user = await User.findById(id)
      .select("_id first_name last_name location description occupation")
      .lean();

    if (!user) {
      return response.status(400).send("User not found"); // Test suite expects 400
    }
    return response.status(200).send(user);
  } catch (err) {
    return response.status(500).send(err.message);
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", async (request, response) => {
  const { id } = request.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send("Invalid user ID format");
  }

  try {
    // Check if user exists
    const userExists = await User.findById(id);
    if (!userExists) {
      return response.status(400).send("User not found"); // Test suite expects 400
    }

    // 1. Fetch all photos for the user
    const photos = await Photo.find({ user_id: id }).select("-__v").lean();

    if (!photos || photos.length === 0) {
      return response.status(200).send([]); // Return empty array if no photos
    }

    // 2. Collect all unique user_ids from all comments
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

    // 3. Fetch all unique users in a single query
    const users = await User.find({ _id: { $in: [...userIds] } })
      .select("_id first_name last_name")
      .lean();

    // 4. Create a map for easy lookup
    const userMap = users.reduce((acc, u) => {
      acc[u._id.toString()] = u;
      return acc;
    }, {});

    // 5. Manually "populate" the user object in each comment
    photos.forEach((photo) => {
      if (photo.comments) {
        photo.comments.forEach((comment) => {
          if (comment.user_id) {
            comment.user = userMap[comment.user_id.toString()];
            // *** This fix is still needed for the test ***
            delete comment.user_id; 
          }
        });
        photo.comments.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
      } else {
        photo.comments = []; // Ensure comments is an array
      }
    });

    // Sort photos by date (newest first)
    photos.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));

    return response.status(200).send(photos);
  } catch (err) {
    console.error("Error in /photosOfUser/:id :", err); 
    return response.status(500).send(err.message);
  }
});

/**
 * URL /commentsOfUser/:id - Returns all comments made by User (id). (For Part 3)
 */
app.get("/commentsOfUser/:id", async (request, response) => {
  const { id } = request.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send("Invalid user ID");
  }

  try {
    // Check if user exists
    const userExists = await User.findById(id);
    if (!userExists) {
      return response.status(400).send("User not found");
    }

    // Find all photos that have at least one comment by this user
    const photosWithUserComments = await Photo.find(
      { "comments.user_id": id },
      "file_name comments user_id" // Project only needed fields
    ).lean();

    // Filter comments to only include those by the specified user
    const userComments = [];
    photosWithUserComments.forEach((photo) => {
      photo.comments.forEach((comment) => {
        if (comment.user_id.toString() === id) {
          userComments.push({
            comment_text: comment.comment,
            date_time: comment.date_time,
            _id: comment._id,
            photo_owner_id: photo.user_id, // For linking to the photo view
            photo_id: photo._id,
            photo_file_name: photo.file_name,
          });
        }
      });
    });

    // Sort by date descending
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