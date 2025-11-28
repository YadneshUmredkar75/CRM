// models/Client.js
import { Schema, model } from "mongoose";

const clientSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[\+]?[0-9]{10,15}$/, "Please enter a valid phone number (10-15 digits)"],
    },

    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      minlength: [1, "Company name is too short"],
      maxlength: [150, "Company name too long"],
    },

    industry: {
      type: String,
      enum: {
        values: [
          "Technology",
          "Healthcare",
          "Finance",
          "Education",
          "Retail",
          "Manufacturing",
          "Real Estate",
          "Logistics",
          "Energy",
          "Media & Entertainment",
          "Other",
        ],
        message: "{VALUE} is not a valid industry",
      },
      default: "Other",
    },

    status: {
      type: String,
      enum: {
        values: ["Prospect", "Active", "Inactive", "VIP", "Archived"],
        message: "{VALUE} is not a valid status",
      },
      default: "Prospect",
    },

    value: {
      type: Number,
      required: [true, "Client value is required"],
      min: [0, "Value cannot be negative"],
      default: 0,
    },

    lastContact: {
      type: Date,
      required: [true, "Last contact date is required"],
      validate: {
        validator: function (v) {
          return v <= new Date(); // Cannot be in the future
        },
        message: "Last contact date cannot be in the future",
      },
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },

    // Critical: Unique, auto-incremented project number
    projects: {
      type: Number,
      min: [1, "Project number must be at least 1"],
      unique: true,        // Prevents duplicates at DB level
      sparse: false,       // Enforced even if value is 0 (but we'll never allow 0)
      required: true,
    },

    joinedDate: {
      type: Date,
      default: Date.now,
      immutable: true, // Cannot be changed after creation
    },

    // Optional: Track who created/updated (if you have auth)
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance


// Virtual: Format project number with prefix (e.g., PROJ-000123)
clientSchema.virtual("projectId").get(function () {
  return `PROJ-${String(this.projects).padStart(6, "0")}`;
});

// Pre-save: Extra safety (never allow projects = 0 or duplicate)
clientSchema.pre("save", function (next) {
  if (this.projects <= 0) {
    this.projects = 1; // fallback (should never hit if counter works)
  }
  next();
});

// Prevent manual update of projects & joinedDate (optional strict mode)
clientSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.projects || update.joinedDate) {
    return next(
      new Error("Direct update of 'projects' or 'joinedDate' is not allowed")
    );
  }
  next();
});

const Client = model("Client", clientSchema);

export default Client;