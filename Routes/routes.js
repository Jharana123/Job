let express = require("express");
let router = express.Router();
let Job = require("../models/productDb");
let Notification=require("../models/notify_DB");
const { isLoggedIn, isAdmin } = require("../middlewares");
router.get("/", (req, res) => {
  // res.send("Lending Page");
  res.render('landing');
});

router.get("/jobs", async function (req, res) {
  try {
    // extract all the jobs from db
  if (req.query.search && req.query.search.length > 0) {
    // fuzzy searching
    let regex = new RegExp(
      req.query.search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"),
      "gi"
    );
    let foundJobs = await Job.find({ name: regex });
    res.render("index", { foundJobs });
  } else {
    // extract all the jobs from db
    let foundJobs = await Job.find({});
    res.render("index", { foundJobs });
  }
  } catch (error) {
    console.log("error while extracting all jobs", error);
  }
  // res.send(req.body);
});
router.post("/jobs", async function (req, res) {
  // res.send(req.body);
  console.log(req.body);
  try {
    // make a database object
    let newJob = new Job({
      name: req.body.name,
      address: req.body.address,
      image: req.body.image,
      package: req.body.package,
      cgpa: req.body.cgpa,
      deadline: req.body.deadline,
      type: req.body.type,
    });
     await newJob.save();
    let newNotif = new Notification({
      body: "A new job has been posted",
      author: newJob.name,
    });
    await newNotif.save();
   
    res.redirect("/jobs");
  } catch (error) {
    console.log("error while adding a new job", error);
  }
});
router.get("/jobs/new",isLoggedIn,isAdmin, function (req, res) {
  res.render("new");
});
router.get("/jobs/:id", async function (req, res) {
  try {
    // fetch the required job by using id
    let id = req.params.id;
    let job = await Job.findById(id).populate('appliedUsers');
    // eval(require('locus'));
    // findOne
    // res.send('test');
    res.render("show", { job});
  } catch (error) {
    console.log("error while fetching a job", error);
  }
});
router.get("/jobs/:id/edit", isLoggedIn, isAdmin, async function (req, res) {
  try {
    // fetch the required job by using id
    let id = req.params.id;
    let job = await Job.findById(id);
    res.render("edit", { job });
  } catch (error) {
    console.log("error while fetching a job for edit form", error);
  }
});
router.patch("/jobs/:id", isLoggedIn, isAdmin, async function (req, res) {
  try {
    let id = req.params.id;
    console.log("id");
    // simple js object
    let updatedJob = {
      name: req.body.name,
      address: req.body.address,
      image: req.body.image,
      package: req.body.package,
      cgpa: req.body.cgpa,
      deadline: req.body.deadline,
      type: req.body.type,
    };
    await Job.findByIdAndUpdate(id, updatedJob);
    // ! push a new notificatoin
    let newNotif = new Notification({
      body: "A job has been updated",
      author: updatedJob.name,
    });
    await newNotif.save();
    // // findOneAndUpdate
    res.redirect(`/jobs/${id}`);
  } catch (error) {
    console.log("error while updating the job", error);
  }
});

// delete
router.delete("/jobs/:id", isLoggedIn, isAdmin, async function (req, res) {
  try {
    let id = req.params.id;
    await Job.findByIdAndDelete(id);
    // findOneAndDestroy
    res.redirect("/jobs");
  } catch (error) {
    console.log("error while deleting the job", error);
  }
});
router.get("/jobs/:jobId/apply", isLoggedIn,async function(req,res){
  try {
    // cgpa validation
    // if (!req.user.cgpa) {
    //   return res.send("you have not entered your cgpa");
    // }
    let { jobId } = req.params;
    let job = await Job.findById(jobId);
    // does the user pass required cgpa criteria
    if (req.user.cgpa < job.cgpa) {
      return res.send("your cgpa is not enough");
    }
    // a user can only apply once for a particular job
    for (let user of job.appliedUsers) {
      if (user._id.equals(req.user._id)) {
        return res.send("you can only apply once");
      }
    }
    job.appliedUsers.push(req.user);
    await job.save();
    res.redirect(`/jobs/${jobId}`);
  } catch (error) {
    console.log("error while applying in job", error);
  }
});

module.exports = router;
