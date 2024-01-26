const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const subjectSchema = new Schema({
  name: { type: String, required: true },
  professors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  installationInstructions: { type: String },
  externalLinks: [{ type: String }],
});

module.exports = mongoose.model('Subject', subjectSchema);
