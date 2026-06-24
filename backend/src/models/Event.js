import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: ['page_view', 'click'],
    },
    pageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    x: {
      type: Number,
      required: function () {
        return this.eventType === 'click';
      },
    },
    y: {
      type: Number,
      required: function () {
        return this.eventType === 'click';
      },
    },
    viewportWidth: {
      type: Number,
      required: true,
    },
    viewportHeight: {
      type: Number,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

eventSchema.index({ sessionId: 1, timestamp: 1 });
eventSchema.index({ pageUrl: 1, eventType: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;