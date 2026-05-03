import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    listingType: {
      type: String,
      enum: ["job", "internship"],
      required: true,
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
      default: "full-time",
    },
    salaryRange: { type: String, trim: true, default: "" },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", company: "text", description: "text" });

export default mongoose.model("Job", jobSchema);
