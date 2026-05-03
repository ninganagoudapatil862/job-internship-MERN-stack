import { Router } from "express";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", authRequired, requireRole("seeker"), async (req, res, next) => {
  try {
    const { jobId, coverLetter } = req.body;
    if (!jobId) {
      return res.status(400).json({ message: "jobId is required" });
    }
    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      return res.status(404).json({ message: "Job not found" });
    }
    try {
      const application = await Application.create({
        job: jobId,
        applicant: req.user.id,
        coverLetter: coverLetter || "",
      });
      await application.populate([
        { path: "job", select: "title company location listingType" },
      ]);
      res.status(201).json({ application });
    } catch (err) {
      if (err.code === 11000) {
        return res
          .status(409)
          .json({ message: "You have already applied to this position" });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

router.get("/me", authRequired, requireRole("seeker"), async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate("job")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ applications });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/job/:jobId",
  authRequired,
  requireRole("recruiter"),
  async (req, res, next) => {
    try {
      const job = await Job.findById(req.params.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      if (job.recruiter.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not your listing" });
      }
      const applications = await Application.find({ job: req.params.jobId })
        .populate("applicant", "name email")
        .populate("job", "title company location listingType")
        .sort({ createdAt: -1 })
        .lean();
      res.json({ applications });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/:id/status",
  authRequired,
  requireRole("recruiter"),
  async (req, res, next) => {
    try {
      const { status } = req.body;
      if (!["pending", "reviewed", "shortlisted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const application = await Application.findById(req.params.id).populate(
        "job"
      );
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      if (application.job.recruiter.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not your listing" });
      }
      application.status = status;
      await application.save();
      await application.populate("applicant", "name email");
      res.json({ application });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
