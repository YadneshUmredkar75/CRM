// src/models/leadModel.js
import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    // Reference to the Employee who brought/owns this lead
    broughtBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true, // For fast filtering by employee
    },

    // Lead Personal Info
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // Lead Type & Details
    leadType: {
      type: String,
      enum: ["Course", "Hiring"],
      required: true,
    },

    // Conditional fields based on leadType
    courseName: {
      type: String,
      required: function () {
        return this.leadType === "Course";
      },
    },
    companyName: {
      type: String,
      required: function () {
        return this.leadType === "Hiring";
      },
    },
    jobRole: {
      type: String,
      required: function () {
        return this.leadType === "Hiring";
      },
    },

    // Status: Only 3 states (clean & simple)
    status: {
      type: String,
      enum: ["Pending", "Converted", "Lost"],
      default: "Pending",
    },
  paymentStatus: {
  type: String,
  enum: ["Pending", "Pay Done"],
  default: "Pending"
},
incentive: {
  type: Number,
  default: 0,
  min: [0, 'Incentive cannot be negative'],
  set: (v) => Math.round(v) // always save as integer
},
   
    // Follow-up & Closure
    followUpDate: {
      type: Date,
      default: () => Date.now() + 3 * 24 * 60 * 60 * 1000, // Default: +3 days
    },
    convertedAt: {
      type: Date,
    },
    lostAt: {
      type: Date,
    },
    lostReason: {
      type: String,
      enum: [
        "",
        "Not Interested",
        "Budget Issue",
        "Timing Not Right",
        "Chose Competitor",
        "No Response",
        "Wrong Contact",
        "Others",
      ],
      default: "",
    },

    // Notes
    message: {
      type: String,
      trim: true,
      default: "",
    },

    // Metadata
    source: {
      type: String,
      enum: ["Website", "Walk-in", "Referral", "Social Media", "Call", "Email", "Other"],
      default: "Website",
    },
    
incentive: {
  type: Number,
  default: 0
},
totalConverted: {
  type: Number,
  default: 0
}
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Virtual: Full details for Hiring leads
leadSchema.virtual("details").get(function () {
  if (this.leadType === "Course") return this.courseName || "N/A";
  return `${this.companyName || "N/A"} - ${this.jobRole || "N/A"}`;
});



// Pre-save hook: Set convertedAt / lostAt
leadSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "Converted") {
      this.convertedAt = this.convertedAt || new Date();
      this.lostAt = null;
      this.lostReason = "";
    } else if (this.status === "Lost") {
      this.lostAt = this.lostAt || new Date();
      this.convertedAt = null;
    } else {
      this.convertedAt = null;
      this.lostAt = null;
      this.lostReason = "";
    }
  }
  next();
});

// Populate broughtBy automatically in queries (optional helper)
leadSchema.statics.findAndPopulate = function () {
  return this.find({}).populate("broughtBy", "name email loginId department position");
};

export default mongoose.model("Lead", leadSchema);