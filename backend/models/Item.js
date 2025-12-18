const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['job', 'course', 'book'],
      required: true
    },
    description: { type: String },
    location: { type: String },
    salary: { type: String },        // mainly for jobs
    link: { type: String },          // apply / course / book link
    image: { type: String }          // optional image URL
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);
