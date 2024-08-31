const express = require("express");
const router = express.Router();
const { jwtAuthMiddleware, generateToken } = require("../jwt");
const User = require("../models/user");
const { resumeUpload, imageUpload } = require("../uploads/multer");
const cloudinary = require("../cloudinaryConfig");

router.post("/signup", async (req, res) => {
  console.log(req.body);
  try {
    const { fullName, email, password } = req.body;
    //if  email already exists
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .render("signup", { aadhar_error: "Email already exists" });
    }

    // create the new user
    const newUser = await User.create({
      fullName,
      email,
      password,
    });
    await newUser.save();

    //redirect to login page
    res.status(201).redirect("/login");
  } catch (error) {
    res
      .status(400)
      .json({ error: `Hey there we have an error:- ${error.message}` });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    console.log("login", user);
    if (!user) {
      return res.render("login", { error: "Invalid Username or Password" });
    }
    const payLoad = {
      email: user.email,
      id: user._id,
    };
    console.log(JSON.stringify(payLoad));
    //generate jwt token
    const token = generateToken(payLoad);
    res.locals.login = true;
    // Set the token in the cookie
    res.cookie("token", token);

    return res.status(202).render("home", { user });
  } catch (error) {
    res
      .status(400)
      .json({ error: `Hey there we have an error:- ${error.message}` });
  }
});

router.post(
  "/createProfile",
  jwtAuthMiddleware,
  resumeUpload,
  async (req, res) => {
    try {
      const { name, city, college_name, education, phoneNo, skills } = req.body;
      const userId = req.user.id;

      let user = await User.findById(userId);
      if (!user) {
        return res.status(404).send("User not found");
      }

      // Updating the fields with existing values or new input
      user.fullName = name || user.fullName;
      user.city = city || user.city;
      user.college_name = college_name || user.college_name;
      user.education = education || user.education;
      user.phoneNo = phoneNo || user.phoneNo;
      user.skills = skills ? skills.split(",") : user.skills;

      // Handling resume upload
      if (req.file) {
        cloudinary.uploader
          .upload_stream(
            { resource_type: "raw", folder: "resumes", format: "pdf" },
            async (error, result) => {
              if (error) {
                return res.status(500).json({ error: "Resume upload failed" });
              }
              user.resume = result.secure_url;
              await user.save();
              return res.status(200).render("userProfile", { user });
            }
          )
          .end(req.file.buffer);
      } else {
        await user.save();
        console.log("Saved without resume");
        return res.status(200).render("userProfile", { user });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  }
);

router.post(
  "/uploadProfileImage",
  jwtAuthMiddleware,
  imageUpload,
  async (req, res) => {
    try {
      console.log(req.user);

      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ error: "No image file provided!" });
      }

      const fileBuffer = req.file.buffer;

      // Uploading image to Cloudinary
      cloudinary.uploader
        .upload_stream(
          { resource_type: "image", folder: "profile_images" },
          async (error, result) => {
            if (error) {
              return res.status(500).json({ error: "Image upload failed" });
            }

            const imageUrl = result.secure_url;

            // Find and update the user's profile image URL
            const user = await User.findById(userId);
            if (!user) {
              return res.status(404).json({ error: "User not found" });
            }

            user.profileImage = imageUrl;
            await user.save();

            console.log("Profile image uploaded successfully");
            return res.status(200).redirect("/userProfile");
          }
        )
        .end(fileBuffer);
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
