import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true
    },
    joinDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    feeStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    totalFee: {
        type: Number,
        required: true,
        min: 0
    },
    paidAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    reminderMessage: {
        type: String,
        default: ''
    },
    attendance: [{
        date: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['present', 'absent'],
            default: 'present'
        }
    }]
}, {
    timestamps: true
});

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    whatYouLearn: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: 'English'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    students: [studentSchema],
    status: {
        type: String,
        enum: ['active', 'completed', 'upcoming'],
        default: 'active'
    },
    category: {
        type: String,
        default: 'General'
    },
    maxStudents: {
        type: Number,
        default: 50
    }
}, {
    timestamps: true
});

// Virtual for calculating course duration
courseSchema.virtual('duration').get(function () {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

// Virtual for calculating available seats
courseSchema.virtual('availableSeats').get(function () {
    return this.maxStudents - this.students.length;
});

// Auto-calculate fee status before saving student
studentSchema.pre('save', function (next) {
    if (this.paidAmount >= this.totalFee) {
        this.feeStatus = 'paid';
    } else {
        this.feeStatus = 'pending';
    }
    next();
});



export default mongoose.model('Course', courseSchema);