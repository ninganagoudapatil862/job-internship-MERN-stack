import { Router } from "express";
import Job from "../models/Job.js";
import { authRequired, optionalAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const {
      q,
      listingType,
      employmentType,
      location,
      company,
      page = "1",
      limit = "12",
    } = req.query;
    const filter = { isActive: true };
    if (listingType && ["job", "internship"].includes(listingType)) {
      filter.listingType = listingType;
    }
    if (
      employmentType &&
      ["full-time", "part-time", "contract", "internship"].includes(
        employmentType
      )
    ) {
      filter.employmentType = employmentType;
    }
    if (location) {
      filter.location = new RegExp(location, "i");
    }
    if (company) {
      filter.company = new RegExp(company, "i");
    }
    if (q && String(q).trim()) {
      filter.$text = { $search: String(q).trim() };
    }
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate("recruiter", "name email")
        .sort({ createdAt: -1 })
        .skip((p - 1) * l)
        .limit(l)
        .lean(),
      Job.countDocuments(filter),
    ]);
    res.json({
      jobs,
      page: p,
      limit: l,
      total,
      pages: Math.ceil(total / l) || 1,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/my", authRequired, requireRole("recruiter"), async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ jobs });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "recruiter",
      "name email"
    );
    if (!job) {
      return res.status(404).json({ message: "Listing not found" });
    }
    const owner =
      req.user?.role === "recruiter" &&
      job.recruiter._id.toString() === req.user.id;
    if (!job.isActive && !owner) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.json({ job });
  } catch (err) {
    next(err);
  }
});

router.post("/", authRequired, requireRole("recruiter"), async (req, res, next) => {
  try {
    const {
      title,
      company,
      location,
      description,
      listingType,
      employmentType,
      salaryRange,
    } = req.body;
    if (!title || !company || !location || !description || !listingType) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const job = await Job.create({
      title,
      company,
      location,
      description,
      listingType,
      employmentType: employmentType || "full-time",
      salaryRange: salaryRange || "",
      recruiter: req.user.id,
    });
    const populated = await Job.findById(job._id).populate(
      "recruiter",
      "name email"
    );
    res.status(201).json({ job: populated });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", authRequired, requireRole("recruiter"), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Listing not found" });
    }
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own listings" });
    }
    const allowed = [
      "title",
      "company",
      "location",
      "description",
      "listingType",
      "employmentType",
      "salaryRange",
      "isActive",
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) job[key] = req.body[key];
    }
    await job.save();
    const populated = await Job.findById(job._id).populate(
      "recruiter",
      "name email"
    );
    res.json({ job: populated });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authRequired, requireRole("recruiter"), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Listing not found" });
    }
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own listings" });
    }
    await Job.deleteOne({ _id: job._id });
    res.json({ message: "Listing deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
