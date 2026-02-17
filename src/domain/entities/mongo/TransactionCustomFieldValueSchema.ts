import mongoose, { Schema, model } from "mongoose";

export const TransactionCustomFieldValueSchema = new Schema(
  {
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
      required: true,
    },
    transaction_id: {
      type: String,
      required: true,
      index: true,
    },
    custom_field_id: {
      type: String,
      required: true,
      index: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

TransactionCustomFieldValueSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

export const TransactionCustomFieldValueModel = model(
  "transaction_custom_field_values",
  TransactionCustomFieldValueSchema
);
